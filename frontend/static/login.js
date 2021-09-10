import * as gesso from "./gesso.js";

function renderPatientLoginLinks(data) {
    const collection = data.patients;
    const nav = gesso.createElement(null, "nav", {id: "patient-login-links", class: "login"});

    for (const item of Object.values(collection)) {
        gesso.createLink(nav, `/patient?id=${item.id}`, item.name);
    }

    gesso.replaceElement($("#patient-login-links"), nav);
}

function renderDoctorLoginLinks(data) {
    const collection = data.doctors;
    const nav = gesso.createElement(null, "nav", {id: "doctor-login-links", class: "login"});

    for (const item of Object.values(collection)) {
        gesso.createLink(nav, `/doctor?id=${item.id}`, item.name);
    }

    gesso.replaceElement($("#doctor-login-links"), nav);
}

export class MainPage {
    render() {
        $("#content").classList.add("excursion");

        $("#content").innerHTML = `
<section>
  <div>
    <h1>Patient Portal</h1>

    <h2>Log in as a patient:</h2>
    <nav id="patient-login-links"></nav>

    <h2>Log in as a doctor:</h2>
    <nav id="doctor-login-links"></nav>
  </div>
</section>
`;
    }

    update(data) {
        renderPatientLoginLinks(data);
        renderDoctorLoginLinks(data);
    }
}
