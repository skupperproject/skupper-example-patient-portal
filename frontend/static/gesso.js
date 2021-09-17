// Licensed to the Apache Software Foundation (ASF) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The ASF licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

Element.prototype.$ = function () {
  return this.querySelector.apply(this, arguments);
};

Element.prototype.$$ = function () {
  return this.querySelectorAll.apply(this, arguments);
};

window.$ = $;
window.$$ = $$;

export function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export function nvl(value, replacement) {
    if (value === null || value === undefined) {
        return replacement;
    }
}

export function getParameter(name) {
    return new URL(window.location).searchParams.get(name);
}

export function getIntParameter(name) {
    return parseInt(getParameter(name));
}

export function createElement(parent, tag, options) {
    const elem = document.createElement(tag);

    if (parent != null) {
        parent.appendChild(elem);
    }

    if (options != null) {
        if (typeof options === "string" || typeof options === "number") {
            createText(elem, options);
        } else if (typeof options === "object") {
            if (options.hasOwnProperty("text")) {
                let text = options["text"];

                if (text != null) {
                    createText(elem, text);
                }

                delete options["text"];
            }

            for (let key of Object.keys(options)) {
                elem.setAttribute(key, options[key]);
            }
        } else {
            throw `illegal argument: ${options}`;
        }
    }

    return elem;
}

export function createText(parent, text) {
    const node = document.createTextNode(text);

    if (parent != null) {
        parent.appendChild(node);
    }

    return node;
}

function _setSelector(elem, selector) {
    if (selector == null) {
        return;
    }

    if (selector.startsWith("#")) {
        elem.setAttribute("id", selector.slice(1));
    } else {
        elem.setAttribute("class", selector);
    }
}

export function createDiv(parent, selector, options) {
    const elem = createElement(parent, "div", options);

    _setSelector(elem, selector);

    return elem;
}

export function createSpan(parent, selector, options) {
    const elem = createElement(parent, "span", options);

    _setSelector(elem, selector);

    return elem;
}

export function createLink(parent, href, options) {
    const elem = createElement(parent, "a", options);

    if (href != null) {
        elem.setAttribute("href", href);
    }

    return elem;
}

export function createTable(parent, headings, rows, options) {
    const elem = createElement(parent, "table", options);
    const thead = createElement(elem, "thead");
    const tbody = createElement(elem, "tbody");

    if (headings) {
        const tr = createElement(thead, "tr");

        for (const heading of headings) {
            createElement(tr, "th", heading);
        }
    }

    for (const row of rows) {
        const tr = createElement(tbody, "tr");

        for (const cell of row) {
            const td = createElement(tr, "td");

            if (cell instanceof Node) {
                td.appendChild(cell);
            } else {
                createText(td, cell);
            }
        }
    }

    return elem;
}

export function createFieldTable(parent, fields, options) {
    const elem = createElement(parent, "table", options);
    const tbody = createElement(elem, "tbody");

    for (const field of fields) {
        const tr = createElement(tbody, "tr");
        const th = createElement(tr, "th", field[0]);
        const td = createElement(tr, "td");

        if (field[1] instanceof Node) {
            td.appendChild(field[1]);
        } else {
            createText(td, field[1]);
        }
    }

    return elem;
}

export function replaceElement(oldElement, newElement) {
    oldElement.parentNode.replaceChild(newElement, oldElement);
}

export function formatDuration(millis, suffixes) {
    if (millis == null) {
        return "-";
    }

    if (suffixes == null) {
        suffixes = [
            " years",
            " weeks",
            " days",
            " hours",
            " minutes",
            " seconds",
            " millis",
        ];
    }

    let prefix = "";

    if (millis < 0) {
        prefix = "-";
    }

    millis = Math.abs(millis);

    const seconds = Math.round(millis / 1000);
    const minutes = Math.round(millis / 60 / 1000);
    const hours = Math.round(millis / 3600 / 1000);
    const days = Math.round(millis / 86400 / 1000);
    const weeks = Math.round(millis / 604800 / 1000);
    const years = Math.round(millis / 31536000 / 1000);

    if (years >= 1)   return `${prefix}${years}${suffixes[0]}`;
    if (weeks >= 1)   return `${prefix}${weeks}${suffixes[1]}`;
    if (days >= 1)    return `${prefix}${days}${suffixes[2]}`;
    if (hours >= 1)   return `${prefix}${hours}${suffixes[3]}`;
    if (minutes >= 1) return `${prefix}${minutes}${suffixes[4]}`;
    if (seconds >= 1) return `${prefix}${seconds}${suffixes[5]}`;
    if (millis == 0) return "0";

    return `${prefix}${Math.round(millis)}${suffixes[6]}`;
}

export function formatDurationBrief(millis) {
    return formatDuration(millis, ["y", "w", "d", "h", "m", "s", "ms"]);
}

export function post(url, data) {
    // console.log("Posting data to", url, data);

    fetch(url, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(data),
    }).then(response => response.json());

    // XXX errors
}

export class Page {
    constructor(html) {
        if (!html) {
            return;
        }

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");

        this.body = doc.activeElement;
    }

    render() {
        replaceElement($("body"), this.body);
    }

    update() {
        this.fetchData();
    }

    fetchData() {
    }
}

export class Router {
    constructor(routes) {
        this.routes = routes;
        this.page = null;

        this.addEventListeners();
    }

    addEventListeners() {
        window.addEventListener("popstate", () => {
            this.route(window.location.pathname);
        });

        window.addEventListener("load", () => {
            this.route(window.location.pathname);
        });

        window.addEventListener("click", event => {
            if (event.target.tagName === "A") {
                event.preventDefault();

                const url = new URL(event.target.href, window.location);

                if (url.href != window.location.href) {
                    this.navigate(url);
                }
            }
        });
    }

    route(path) {
        this.page = this.routes[path];

        this.page.render();
        this.page.update();

        // window.dispatchEvent(new Event("update"));
    }

    navigate(url) {
        window.history.pushState({}, null, url);

        this.route(url.pathname);
    }
}

// window.addEventListener("update", event => {
//     fetch("/api/data", {
//         method: "GET",
//         headers: {"Content-Type": "application/json"},
//     })
//         .then(response => response.json())
//         .then(data => router.page.update(data));
// });

export class Table {
    constructor(id, columns) {
        this.id = id;
        this.columns = columns;
    }

    render(items, context) {
        const headings = [];
        const rows = [];
        const div = createDiv(null, `#${this.id}`);

        for (const column of this.columns) {
            headings.push(column[0]);
        }

        for (const item of items) {
            const row = [];

            for (const column of this.columns) {
                let value = item[column[1]];

                if (column.length === 3) {
                    value = column[2](value, context);
                }

                row.push(value);
            }

            rows.push(row);
        }

        if (rows.length) {
            createTable(div, headings, rows);
        }

        replaceElement($(`#${this.id}`), div);
    }
}

export class Tabs {
    constructor(id) {
        this.id = id;
    }

    render() {
        const links = $$(`#${this.id} > nav > a`);

        for (const link of links) {
            const url = new URL(window.location);
            url.searchParams.set(this.id, link.dataset.tab);
            link.setAttribute("href", url.href);
        }
    }

    update() {
        const url = new URL(window.location);
        const selectedTabId = url.searchParams.get(this.id);
        const tabs = $(`#${this.id}`);

        if (!selectedTabId) {
            tabs.$(":scope > nav > a").classList.add("selected");
            tabs.$(":scope > div").style.display = "inherit";
            return;
        }

        for (const link of tabs.$$(":scope > nav > a")) {
            if (link.href === url.href) {
                link.classList.add("selected");
            } else {
                link.classList.remove("selected");
            }
        }

        for (const pane of tabs.$$(":scope > div")) {
            if (pane.id === selectedTabId) {
                pane.style.display = "inherit";
            } else {
                pane.style.display = "none";
            }
        }
    }
}
