import * as appointment from "./appointment.js";
import * as appointmentRequest from "./appointment-request.js";
import * as doctor from "./doctor.js";
import * as gesso from "./gesso.js";
import * as login from "./login.js";
import * as patient from "./patient.js";

export const router = new gesso.Router({
    "/": new login.MainPage(),
    "/patient": new patient.MainPage(),
    "/doctor": new doctor.MainPage(),
    "/appointment/create": new appointment.CreatePage(),
    "/appointment-request/create": new appointmentRequest.CreatePage(),
});

window.addEventListener("update", event => {
    fetch("/api/data", {
        method: "GET",
        headers: {"Content-Type": "application/json"},
    })
        .then(response => response.json())
        .then(data => router.page.update(data));
});

new EventSource("/api/notifications").onmessage = event => {
    // console.log("Notified!");
    // const data = JSON.parse(event.data);
    window.dispatchEvent(new Event("update"));
};

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

export function renderTable(id, items, headings, fieldNames, fieldFunctions) {
    const rows = [];
    const div = gesso.createDiv(null, `#${id}`);

    for (const item of items) {
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
