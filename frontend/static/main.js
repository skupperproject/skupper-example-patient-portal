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

// window.addEventListener("update", event => {
//     router.page.fetchData();
// });

new EventSource("/api/notifications").onmessage = event => {
    router.page.fetchData();
    // window.dispatchEvent(new Event("update"));
};
