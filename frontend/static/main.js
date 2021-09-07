import * as appointment from "./appointment.js";
import * as appointmentRequest from "./appointment-request.js";
import * as doctor from "./doctor.js";
import * as login from "./login.js";
import * as patient from "./patient.js";

const routes = {
    "/": login.page,
    "/patient": patient.page,
    "/doctor": doctor.page,
    "/appointment/create": appointment.createPage,
    "/appointment-request/create": appointmentRequest.createPage,
};

export function navigate(url) {
    $("#content").innerHTML = routes[url.pathname];

    window.history.pushState({}, null, url);
    window.dispatchEvent(new Event("statechange"));
}

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
            navigate(url);
        }
    }
});

window.addEventListener("statechange", () => {
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

    function update() {
        updateTabs();

        fetch("/api/data", {
            method: "GET",
            headers: {"Content-Type": "application/json"},
        })
            .then(response => response.json())
            .then(data => {
                patient.update(data);
                doctor.update(data);
                appointment.update(data);
                appointmentRequest.update(data);
            });
    }

    update();
});

new EventSource("/api/notifications").onmessage = event => {
    const data = JSON.parse(event.data);
    window.dispatchEvent(new Event("statechange"));
};

export function post(url, data) {
    fetch("/api/appointment-request/create", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(data),
    }).then(response => response.json());

    // XXX errors
}
