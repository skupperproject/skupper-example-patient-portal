import * as appointment from "./appointment.js";
import * as appointmentRequest from "./appointment-request.js";
import * as bill from "./bill.js";
import * as doctor from "./doctor.js";
import * as gesso from "./gesso.js";
import * as login from "./login.js";
import * as patient from "./patient.js";

export const router = new gesso.Router();

new login.MainPage(router);
new patient.MainPage(router);
new doctor.MainPage(router);
new appointment.CreatePage(router);
new appointmentRequest.CreatePage(router);
new bill.PayPage(router);

// {
//     "/": new login.MainPage(),
//     "/patient": new patient.MainPage(),
//     "/doctor": new doctor.MainPage(),
//     "/appointment/create": new appointment.CreatePage(),
//     "/appointment-request/create": new appointmentRequest.CreatePage(),
//     "/bill/pay": new bill.PayPage(),
// });

new EventSource("/api/notifications").onmessage = event => {
    router.page.updateContent();
};

export function isParameterChanged(name) {
    if (!router.previousUrl) {
        return false;
    }

    const prev = router.previousUrl.$p(name);
    const curr = $p(name);

    return curr !== prev;
}
