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

import binascii as _binascii
import os as _os
import psycopg as _psycopg
import uuid as _uuid

database_host = _os.environ.get("DATABASE_SERVICE_HOST", "localhost")
database_port = _os.environ.get("DATABASE_SERVICE_PORT", "5432")

async def cursor():
    conn = await _psycopg.AsyncConnection.connect(host=database_host,
                                                  port=database_port,
                                                  user="patient_portal",
                                                  password="secret",
                                                  autocommit=True)

    return conn.cursor()

def unique_id():
    uuid_bytes = _uuid.uuid4().bytes
    uuid_bytes = uuid_bytes[-4:]

    return _binascii.hexlify(uuid_bytes).decode("utf-8")
