import * as appointment from "./appointment.js";
import * as appointmentRequest from "./appointment-request.js";
import * as doctor from "./doctor.js";
import * as login from "./login.js";
import * as patient from "./patient.js";

const gesso = new Gesso();

let currentPage;

const routes = {
    "/": login.mainPage,
    "/patient": patient.mainPage,
    "/doctor": doctor.mainPage,
    "/appointment/create": appointment.createPage,
    "/appointment-request/create": appointmentRequest.createPage,
};

function routeRequest(path) {
    currentPage = routes[path];

    currentPage.render();

    window.dispatchEvent(new Event("update"));
}

export function navigate(url) {
    window.history.pushState({}, null, url);
    routeRequest(url.pathname);
}

window.addEventListener("popstate", () => {
    routeRequest(window.location.pathname);
});

window.addEventListener("load", () => {
    routeRequest(window.location.pathname);
});

window.addEventListener("click", event => {
    if (event.target.tagName === "A") {
        event.preventDefault();

        const url = new URL(event.target.href, window.location);

        if (url.href != window.location.href) {
            navigate(url);
        }
    }
});

export function updateTabs() {
    const url = new URL(window.location);
    const selectedTabId = url.hash.slice(1);

    for (let tabs of $$(".tabs")) {
        if (!selectedTabId) {
            tabs.$(":scope > nav > a").classList.add("selected");
            tabs.$(":scope > div").style.display = "inherit";
            continue;
        }

        for (let link of tabs.$$(":scope > nav > a")) {
            if (link.href == url.href) {
                link.classList.add("selected");
            } else {
                link.classList.remove("selected");
            }
        }

        for (let pane of tabs.$$(":scope > div")) {
            if (pane.id == selectedTabId) {
                pane.style.display = "inherit";
            } else {
                pane.style.display = "none";
            }
        }
    }
}

window.addEventListener("update", event => {
    fetch("/api/data", {
        method: "GET",
        headers: {"Content-Type": "application/json"},
    })
        .then(response => response.json())
        .then(data => currentPage.update(data));
});

new EventSource("/api/notifications").onmessage = event => {
    console.log("Notified!");
    // const data = JSON.parse(event.data);
    window.dispatchEvent(new Event("update"));
};

export function post(url, data) {
    console.log("Posting data to", url, data);

    fetch(url, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(data),
    }).then(response => response.json());

    // XXX errors
}

export function renderTable(id, collection, headings, fieldNames, fieldFunctions) {
    const rows = [];
    const div = gesso.createDiv(null, `#${id}`);

    for (const item of Object.values(collection)) {
        const row = [];
        let index = 0;

        for (const name of fieldNames) {
            let value = item[name];

            if (fieldFunctions && fieldFunctions.length > index) {
                const func = fieldFunctions[index];

                if (func) {
                    value = func(value);
                }
            }

            row.push(value);
            index++;
        }

        rows.push(row);
    }

    if (rows.length) {
        gesso.createTable(div, headings, rows);
    }

    gesso.replaceElement($(`#${id}`), div);
}
