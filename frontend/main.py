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

from sse_starlette.sse import EventSourceResponse
from starlette.applications import Starlette
from starlette.background import BackgroundTask
from starlette.responses import Response, FileResponse, JSONResponse, RedirectResponse
from starlette.staticfiles import StaticFiles

from data import *

process_id = f"frontend-{unique_id()}"

def log(message):
    print(f"{process_id}: {message}")

http_host = os.environ.get("HTTP_HOST", "0.0.0.0")
http_port = int(os.environ.get("HTTP_PORT", 8080))

star = Starlette(debug=True)
star.mount("/static", StaticFiles(directory="static"), name="static")

@star.route("/")
async def get_index(request):
    return FileResponse("static/index.html")

@star.route("/api/notifications")
async def get_notifications(request):
    async def generate():
        async with await cursor() as cur:
            await cur.execute("listen patients")

            async for notify in cur.connection.notifies():
                yield {"data": "1"}

    return EventSourceResponse(generate())

@star.route("/api/data")
async def get_data(request):
    async with await cursor() as cur:
        await cur.execute("select id, name, age from patients order by name, id");
        patient_records = await cur.fetchall()

    return JSONResponse({"data": {"patients": patient_records}})

if __name__ == "__main__":
    uvicorn.run(star, host=http_host, port=http_port, log_level="info")
