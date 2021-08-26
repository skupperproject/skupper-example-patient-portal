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

import asyncio
import os
import psycopg2
import psycopg2.extensions
import select
import threading
import time
import traceback
import uvicorn

from sse_starlette.sse import EventSourceResponse
from starlette.applications import Starlette
from starlette.background import BackgroundTask
from starlette.responses import Response, FileResponse, JSONResponse, RedirectResponse
from starlette.staticfiles import StaticFiles

from animalid import generate_animal_id
from data import *

process_id = f"frontend-{unique_id()}"

notification_queues = set()
lock = threading.Lock()

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

    conn.set_isolation_level(psycopg2.extensions.ISOLATION_LEVEL_AUTOCOMMIT)

    return conn

def process_notifications():
    while True:
        conn = connect()

        try:
            with conn.cursor() as cur:
                cur.execute("listen patients")

                while True:
                    if select.select([conn], [], [], 5) != ([], [], []):
                        conn.poll()

                        while conn.notifies:
                            with lock:
                                for queue in notification_queues:
                                    asyncio.run(queue.put(conn.notifies.pop(0)))
        except:
            traceback.print_exc()
            time.sleep(1)

## HTTP

http_host = os.environ.get("HTTP_HOST", "0.0.0.0")
http_port = int(os.environ.get("HTTP_PORT", 8080))

star = Starlette(debug=True)
star.mount("/static", StaticFiles(directory="static"), name="static")

@star.route("/")
async def get_index(request):
    return FileResponse("static/index.html")

@star.route("/api/notifications")
async def get_notifications(request):
    queue = asyncio.Queue()

    async def generate():
        with lock:
            notification_queues.add(queue)

        while True:
            await queue.get()
            yield {"data": "[]"}

    async def cleanup():
        with lock:
            notification_queues.remove(queue)

    return EventSourceResponse(generate(), background=BackgroundTask(cleanup))

@star.route("/api/data")
async def get_data(request):
    with connect().cursor() as cur:
        cur.execute("select * from patients order by name");
        patient_records = cur.fetchall()

    return JSONResponse({"data": {"patients": patient_records}})

if __name__ == "__main__":
    update_thread = threading.Thread(target=process_notifications, daemon=True)
    update_thread.start()

    uvicorn.run(star, host=http_host, port=http_port, log_level="info")
