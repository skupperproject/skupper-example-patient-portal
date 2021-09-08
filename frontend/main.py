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
import uvicorn

from psycopg_pool import AsyncConnectionPool
from sse_starlette.sse import EventSourceResponse
from starlette.applications import Starlette
from starlette.background import BackgroundTask
from starlette.responses import Response, FileResponse, JSONResponse, RedirectResponse
from starlette.staticfiles import StaticFiles

from data import *

process_id = f"frontend-{unique_id()}"

database_host = os.environ.get("DATABASE_SERVICE_HOST", "localhost")
database_port = os.environ.get("DATABASE_SERVICE_PORT", "5432")
database_url = f"postgresql://patient_portal:secret@{database_host}:{database_port}/patient_portal"

pool = None

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
        curs = await conn.execute("select id, name, zip, phone, email from patients order by name, id")
        patient_records = await curs.fetchall()

        curs = await conn.execute("select id, name, phone, email from doctors order by name, id")
        doctor_records = await curs.fetchall()

        # XXX 1
        curs = await conn.execute("select id, patient_id, to_char(date, 'YYYY-MM-DD'), date_is_approximate, time_of_day from appointment_requests order by date")
        appointment_request_records = await curs.fetchall()

    return JSONResponse({"data": {
        "patients": patient_records,
        "doctors": doctor_records,
        "appointment_requests": appointment_request_records,
    }})

@star.route("/api/appointment/create")
async def post_appointment_create(request, methods=["POST"]):
    async with pool.connection() as conn:
        await conn.execute("insert into appointments (date, time, patient_id, doctor_id)"
                           "values ('2021-12-21', '08:00', 1, 1)")

    return JSONResponse({"error": None})

@star.route("/api/appointment-request/create", methods=["POST"])
async def post_appointment_request_create(request):
    # XXX Get patient ID

    async with pool.connection() as conn:
        await conn.execute("insert into appointment_requests (patient_id, date, date_is_approximate, time_of_day)"
                           "values (1, '2021-12-21', true, 'any')")

    return JSONResponse({"error": None})

if __name__ == "__main__":
    http_host = os.environ.get("HTTP_HOST", "0.0.0.0")
    http_port = int(os.environ.get("HTTP_PORT", 8080))

    uvicorn.run(star, host=http_host, port=http_port, log_level="info")
