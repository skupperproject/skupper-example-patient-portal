/*
 *
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */

"use strict";

window.addEventListener("load", () => {
    const gesso = new Gesso();
    const dataSource = new EventSource("/api/notifications");

    function cap(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    function nvl(value, replacement) {
        if (value === null || value === undefined) {
            return replacement;
        }

        return value;
    }

    function renderPatients() {
        fetch("/api/data", {
            method: "GET",
            headers: {"Content-Type": "application/json"},
        })
            .then(response => response.json())
            .then(data => {
                const records = data["data"]["patients"];
                const headings = ["ID", "Name", "Age"];
                const rows = new Array();

                for (let record of records) {
                    rows.push(record);
                }

                const div = gesso.createDiv(null, "#patients");

                if (rows.length) {
                    gesso.createTable(div, headings, rows);
                }

                gesso.replaceElement($("#patients"), div);
            });
    }

    renderPatients();

    dataSource.onmessage = event => {
        const item = JSON.parse(event.data);
        renderPatients();
    };
});
