import * as appointment from "./appointment.js";
import * as entry from "./entry.js";
import * as doctor from "./doctor.js";
import * as patient from "./patient.js";

"use strict";

const routes = {
    "/": entry.page,
    "/patient": patient.page,
    "/doctor": doctor.page,
    "/appointment/create": appointment.createPage,
};

window.addEventListener("popstate", () => {
    $("#content").innerHTML = routes[window.location.pathname];
    window.dispatchEvent(new Event("statechange"));
});

window.addEventListener("load", () => {
    $("#content").innerHTML = routes[window.location.pathname];
    window.dispatchEvent(new Event("statechange"));
});

window.addEventListener("click", event => {
    if (event.target.tagName === "A") {
        event.preventDefault();

        const url = new URL(event.target.href, window.location);

        if (url.href != window.location.href) {
            $("#content").innerHTML = routes[url.pathname];

            window.history.pushState({}, null, url);
            window.dispatchEvent(new Event("statechange"));
        }
    }
});

function updateTabs() {
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

function render() {
    updateTabs();

    fetch("/api/data", {
        method: "GET",
        headers: {"Content-Type": "application/json"},
    })
        .then(response => response.json())
        .then(data => {
            patient.render(data);
            doctor.render(data);
        });
}

window.addEventListener("statechange", () => {
    render();
});

const dataSource = new EventSource("/api/notifications");

dataSource.onmessage = event => {
    const item = JSON.parse(event.data); // XXX
    window.dispatchEvent(new Event("statechange"));
};
