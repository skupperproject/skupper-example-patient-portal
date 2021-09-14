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
    window.dispatchEvent(new Event("update"));
};
