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

print("pol")

import asyncio
import os
import psycopg2
import threading
import time
import uvicorn

from sse_starlette.sse import EventSourceResponse
from starlette.applications import Starlette
from starlette.background import BackgroundTask
from starlette.responses import Response, FileResponse, JSONResponse, RedirectResponse
from starlette.staticfiles import StaticFiles

from animalid import generate_animal_id
from data import *

process_id = f"frontend-{unique_id()}"

store = DataStore()
data_request_queues = set()

def log(message):
    print(f"{process_id}: {message}")

## Database

database_host = os.environ.get("DATABASE_SERVICE_HOST", "localhost")
database_port = os.environ.get("DATABASE_SERVICE_PORT", "5432")

def connect():
    conn = psycopg2.connect(host=database_host,
                            port=database_port,
                            database="patient_portal",
                            user="patient_portal",
                            password="secret")
    return conn

print("database connected")

# def process_updates():
#     while True:
#         log("tick")
#         time.sleep(1) # XXX Sucks

#         with database.cursor() as cur:
#             print("before execute")
#             cur.execute("select * from patients");
#             print("after execute")
#             records = cur.fetchall()
#             print("after fetchall")

#         for record in records:
#             patient = Patient(id=None) # XXX
#             patient.name = record[0]

#             store.put(patient)

#             log(patient)

## HTTP

http_host = os.environ.get("HTTP_HOST", "0.0.0.0")
http_port = int(os.environ.get("HTTP_PORT", 8080))

print("http host and port", http_host, http_port)

star = Starlette(debug=True)
star.mount("/static", StaticFiles(directory="static"), name="static")

@star.route("/")
async def get_index(request):
    return FileResponse("static/index.html")

@star.route("/api/data")
async def get_data(request):
    # queue = asyncio.Queue()

    # async def generate():
    #     for item in store.get():
    #         if item.deletion_time is not None:
    #             continue

    #         yield {"data": item.json()}

    #     data_request_queues.add(queue)

    #     while True:
    #         yield {"data": (await queue.get()).json()}

    # async def cleanup():
    #     data_request_queues.remove(queue)

    # return EventSourceResponse(generate(), background=BackgroundTask(cleanup))

    with connect().cursor() as cur:
        cur.execute("select * from patients");
        records = cur.fetchall()

    patient_data = dict()

    for record in records:
        patient = Patient(id=None) # XXX
        patient.name = record[0]

        patient_data[patient.id] = patient.data()

    return JSONResponse({"data": {"patients": patient_data}})

if __name__ == "__main__":
    # update_thread = threading.Thread(target=process_updates, daemon=True)
    # update_thread.start()

    uvicorn.run(star, host=http_host, port=http_port, log_level="info")
