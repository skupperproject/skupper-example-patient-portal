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

from plano import *

image_tag = "quay.io/skupper/patient-portal-payment-processor"

@command
def build():
    run(f"podman build -t {image_tag} .")

@command
def run_container():
    build()
    run(f"podman run --net host {image_tag} --host localhost --port 8081")

@command
def run_process():
    with start("python3 main.py --host localhost --port 8081") as frontend:
        sleep(0.5)

        print(http_get(f"http://localhost:8081/api/health"))
        print(http_post_json(f"http://localhost:8081/api/pay", {}))

        sleep(86400)

@command
def push():
    build()
    run(f"podman push {image_tag}")
