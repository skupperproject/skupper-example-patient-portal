#
# Licensed to the Apache Software Foundation (ASF) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The ASF licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.
#

import argparse
import asyncio
import os
import json
import uuid
import uvicorn

from httpx import AsyncClient
from psycopg_pool import AsyncConnectionPool
from sse_starlette.sse import EventSourceResponse
from starlette.applications import Starlette
from starlette.background import BackgroundTask
from starlette.responses import Response, FileResponse, JSONResponse
from starlette.staticfiles import StaticFiles

database_host = os.environ.get("DATABASE_SERVICE_HOST", "localhost")
database_port = os.environ.get("DATABASE_SERVICE_PORT", "5432")
database_url = f"postgresql://patient_portal:secret@{database_host}:{database_port}/patient_portal"

payment_processor_host = os.environ.get("PAYMENT_PROCESSOR_SERVICE_HOST", "localhost")
payment_processor_port = os.environ.get("PAYMENT_PROCESSOR_SERVICE_PORT", "8081")
payment_processor_url = f"http://{payment_processor_host}:{payment_processor_port}"

pool = None
change_event = None

class CustomJsonResponse(JSONResponse):
    def render(self, content):
        return json.dumps(content, ensure_ascii=False, allow_nan=False,
                          indent=2, separators=(", ", ": "), default=str).encode("utf-8")

async def startup():
    async def configure(conn):
        await conn.set_autocommit(True)

    global pool
    pool = AsyncConnectionPool(database_url, configure=configure, check=AsyncConnectionPool.check_connection)

    global change_event
    change_event = asyncio.Event()

    async def listen():
        while True:
            try:
                async with pool.connection() as conn:
                    await conn.execute("listen changes")

                    async for notify in conn.notifies():
                        change_event.set()
                        change_event.clear()
            except KeyboardInterrupt:
                raise
            except Exception as e:
                print(str(e))

            asyncio.sleep(2)

    asyncio.create_task(listen())

async def shutdown():
    await pool.close()

star = Starlette(debug=True, on_startup=[startup], on_shutdown=[shutdown])
star.mount("/static", StaticFiles(directory="static"), name="static")

@star.route("/")
@star.route("/patient")
@star.route("/doctor")
@star.route("/appointment/create")
@star.route("/appointment-request/create")
@star.route("/bill/pay")
async def get_index(request):
    return FileResponse("static/index.html")

@star.route("/api/notifications")
async def get_notifications(request):
    async def generate():
        while True:
            await change_event.wait()
            yield {"data": "1"}

    return EventSourceResponse(generate())

@star.route("/api/data")
async def get_data(request):
    async with pool.connection() as conn:
        data = dict()
        tables = "patients", "doctors", "appointment_requests", "appointments", "bills"

        for table in tables:
            curs = await conn.execute(f"select * from {table}")
            titles = [x.name for x in curs.description]
            records = await curs.fetchall()
            items = dict()

            for record in records:
                item = dict(zip(titles, record))
                items[item["id"]] = item

            data[table] = items

    return CustomJsonResponse(data)

@star.route("/api/health")
async def get_health(request):
    async with pool.connection() as conn:
        await conn.execute("select 1")

    return Response("OK\n", 200)

@star.route("/api/appointment-request/create", methods=["POST"])
async def post_appointment_request_create(request):
    data = await request.json()

    async with pool.connection() as conn:
        await conn.execute("insert into appointment_requests (patient_id, date, time) "
                           "values (%s, %s, %s)",
                           [data["patient"], data["date"], data["time"]])

    return CustomJsonResponse({"error": None})

@star.route("/api/appointment/create", methods=["POST"])
async def post_appointment_create(request):
    data = await request.json()

    async with pool.connection() as conn:
        curs = await conn.execute("insert into appointments (doctor_id, patient_id, date, time) "
                                  "values (%s, %s, %s, %s) returning id",
                                  (data["doctor"], data["patient"], data["date"], data["time"]))

        appointment_id = (await curs.fetchone())[0]

        await conn.execute("update appointment_requests set appointment_id = %s where id = %s",
                           [appointment_id, data["request"]])

    return CustomJsonResponse({"error": None})

@star.route("/api/bill/pay", methods=["POST"])
async def post_bill_pay(request):
    data = await request.json()

    async with AsyncClient() as client:
        response = await client.post(f"{payment_processor_url}/api/pay", json={})

    if response.status_code != 200:
        return CustomJsonResponse({"error": response.text}, response.status_code)

    async with pool.connection() as conn:
        await conn.execute("update bills "
                           "set date_paid = current_date "
                           "where id = %s",
                           [data["bill"]])

    return CustomJsonResponse({"error": None})

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--host", default="0.0.0.0")
    parser.add_argument("--port", type=int, default=8080)

    args = parser.parse_args()

    uvicorn.run(star, host=args.host, port=args.port)
