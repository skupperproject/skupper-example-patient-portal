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

import os
import json
import uuid
import uvicorn

from psycopg_pool import AsyncConnectionPool
from sse_starlette.sse import EventSourceResponse
from starlette.applications import Starlette
from starlette.background import BackgroundTask
from starlette.responses import Response, FileResponse, JSONResponse, RedirectResponse
from starlette.staticfiles import StaticFiles

process_id = f"frontend-{uuid.uuid4().hex[:8]}"

database_host = os.environ.get("DATABASE_SERVICE_HOST", "localhost")
database_port = os.environ.get("DATABASE_SERVICE_PORT", "5432")
database_url = f"postgresql://patient_portal:secret@{database_host}:{database_port}/patient_portal"

pool = None

class CustomJsonResponse(JSONResponse):
    def render(self, content):
        return json.dumps(content, ensure_ascii=False, allow_nan=False,
                          indent=2, separators=(", ", ": "), default=str).encode("utf-8")

def log(message):
    print(f"{process_id}: {message}")

async def startup():
    global pool

    async def configure(conn):
        await conn.set_autocommit(True)

    pool = AsyncConnectionPool(database_url, configure=configure)

async def shutdown():
    await pool.close()

star = Starlette(debug=True, on_startup=[startup], on_shutdown=[shutdown])
star.mount("/static", StaticFiles(directory="static"), name="static")

@star.route("/")
@star.route("/patient")
@star.route("/doctor")
@star.route("/appointment/create")
@star.route("/appointment-request/create")
async def get_index(request):
    return FileResponse("static/index.html")

@star.route("/api/notifications")
async def get_notifications(request):
    async def generate():
        async with pool.connection() as conn:
            await conn.execute("listen changes")

            async for notify in conn.notifies():
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
            collection = dict()

            for record in records:
                record_dict = dict(zip(titles, record))
                collection[record_dict["id"]] = record_dict

            data[table] = collection

    return CustomJsonResponse(data)

@star.route("/api/appointment-request/create", methods=["POST"])
async def post_appointment_request_create(request):
    data = await request.json()

    async with pool.connection() as conn:
        await conn.execute("insert into appointment_requests (patient_id, date, date_is_approximate, time_of_day) "
                           "values (%s, %s, %s, %s)",
                           (data["patient"], data["date"], data["date_is_approximate"], data["time_of_day"]))

    return JSONResponse({"error": None})

@star.route("/api/appointment/create", methods=["POST"])
async def post_appointment_create(request):
    data = await request.json()

    async with pool.connection() as conn:
        await conn.execute("insert into appointments (patient_id, doctor_id, date, time) "
                           "values (%s, %s, %s, %s)",
                           (data["patient"], data["doctor"], data["date"], data["time"]))

    return JSONResponse({"error": None})

if __name__ == "__main__":
    http_host = os.environ.get("HTTP_HOST", "0.0.0.0")
    http_port = int(os.environ.get("HTTP_PORT", 8080))

    uvicorn.run(star, host=http_host, port=http_port, log_level="info")
