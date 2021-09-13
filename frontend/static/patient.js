import * as gesso from "./gesso.js";
import * as main from "./main.js";

function getPatientId() {
    return parseInt(new URL(window.location).searchParams.get("id"));
}

function renderName(data) {
    const name = data.patients[getPatientId()].name;
    $("#patient-name").textContent = name;
}

function renderAppointmentRequestCount(data) {
    const items = Object.values(data.appointment_requests).filter(item => item.patient_id = getPatientId());
    $("#appointment-request-count").textContent = items.length;
}

function renderAppointmentCount(data) {
    const items = Object.values(data.appointments).filter(item => item.patient_id = getPatientId());
    $("#appointment-count").textContent = items.length;
}

function renderAppointmentTable(data) {
    const id = "appointment-table"
    const items = Object.values(data.appointments).filter(item => item.patient_id === getPatientId());
    const headings = ["ID", "Doctor", "Date", "Time"];
    const fieldNames = ["id", "doctor_id", "date", "time"];

    function getDoctorName(doctorId) {
        return data.doctors[doctorId].name;
    }

    const fieldFunctions = [null, getDoctorName];

    main.renderTable(id, items, headings, fieldNames, fieldFunctions);
}

function renderDoctorTable(data) {
    const id = "doctor-table"
    const items = Object.values(data.doctors);
    const headings = ["ID", "Name", "Phone", "Email"];
    const fieldNames = ["id", "name", "phone", "email"];

    main.renderTable(id, items, headings, fieldNames);
}

export class MainPage extends gesso.Page {
    render() {
        const patientId = getPatientId();

        $("#content").classList.remove("excursion");

        $("#content").innerHTML = `
<header>
  <div>
    <div>
      <span class="material-icons-outlined">medical_services</span>
      Patient Portal
    </div>
    <nav id="global-nav">
      <a>Patient <span id="patient-name">-</span></a>
      <a id="log-out-link" href="/">Log out</a>
    </nav>
  </div>
</header>
<section>
  <div>

<div class="tabs">
  <nav>
    <a href="#overview">Overview</a>
    <a href="#appointments">Appointments</a>
    <!-- <a href="#bills">Bills</a> -->
    <a href="#doctors">Doctors</a>
  </nav>

  <div id="overview">

    <h1>Welcome!</h1>

    <p><a class="button" href="/appointment-request/create?patient=${patientId}">Request an appointment</a></p>

    <p>You have <b id="appointment-request-count">-</b> open appointment request(s).</p>

    <p>You have <b id="appointment-count">-</b> upcoming appointment(s).</p>

    <!-- <p>Your next appointment is at <b><span id="next-appointment">8:00 AM on 21 December 2021 with Doctor Michaela Quinn</span></b>.</p> -->
  </div>

  <div id="appointments">
    <h1>Appointments</h1>

    <div id="appointment-table"></div>
  </div>

  <div id="bills">
    <h1>Bills</h1>

    <div id="bill-table"></div>
  </div>

  <div id="doctors">
    <h1>Doctors</h1>

    <div id="doctor-table"></div>
  </div>
</div>

  </div>
</section>
<footer>
</footer>
`;
    }

    update(data) {
        main.updateTabs();
        renderName(data);
        renderAppointmentRequestCount(data);
        renderAppointmentCount(data);
        renderAppointmentTable(data);
        renderDoctorTable(data);
    }
}
