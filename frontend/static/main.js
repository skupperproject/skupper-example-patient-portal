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

new EventSource("/api/notifications").onmessage = event => {
    router.page.updateContent();
};
