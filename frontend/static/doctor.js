import * as gesso from "./gesso.js";
import * as main from "./main.js";

function getDoctorId() {
    return parseInt(new URL(window.location).searchParams.get("id"));
}

function renderName(data) {
    const name = data.doctors[getDoctorId()].name;
    $("#doctor-name").textContent = name;
}

function renderAppointmentRequestTable(data) {
    const id = "appointment-request-table";
    const items = Object.values(data.appointment_requests);
    const headings = ["ID", "Patient", "Date", "Date is approximate?", "Time of day", "Actions"];
    const fieldNames = ["id", "patient_id", "date", "date_is_approximate", "time_of_day", "id"];

    function getPatientName(patientId) {
        return data.patients[patientId].name;
    }

    function getYesNo(value) {
        if (value) return "Yes";
        else return "No";
    }

    function cap(value) {
        return value.charAt(0).toUpperCase() + value.slice(1);
    }

    const fieldFunctions = [null, getPatientName, null, getYesNo, cap];

    main.renderTable(id, items, headings, fieldNames, fieldFunctions);
}

function renderAppointmentTable(data) {
    const id = "appointment-table";
    const items = Object.values(data.appointments).filter(item => item.doctor_id === getDoctorId());
    const headings = ["ID", "Patient", "Date", "Time"];
    const fieldNames = ["id", "patient_id", "date", "time"];

    function getPatientName(patientId) {
        return data.patients[patientId].name;
    }

    const fieldFunctions = [null, getPatientName];

    main.renderTable(id, items, headings, fieldNames, fieldFunctions);
}

function renderPatientTable(data) {
    const id = "patient-table";
    const items = Object.values(data.patients);
    const headings = ["ID", "Name", "ZIP", "Phone", "Email"];
    const fieldNames = ["id", "name", "zip", "phone", "email"];

    main.renderTable(id, items, headings, fieldNames);
}

export class MainPage {
    render() {
        const doctorId = getDoctorId();

        $("#content").classList.remove("excursion");

        $("#content").innerHTML = `
<header>
  <div>
    <div>
      <span class="material-icons-outlined">medical_services</span>
      Patient Portal
    </div>
    <nav id="global-nav">
      <a>Doctor <span id="doctor-name">-</span></a>
      <a id="log-out-link" href="/">Log out</a>
    </nav>
  </div>
</header>
<section>
  <div>

<div class="tabs">
  <nav>
    <a href="#appointment-requests">Appointment requests</a>
    <a href="#appointments">Appointments</a>
    <!-- <a href="#bills">Bills</a> -->
    <a href="#patients">Patients</a>
  </nav>

  <div id="appointment-requests">
    <h1>Appointment requests</h1>

    <div id="appointment-request-table"></div>
  </div>

  <div id="appointments">
    <div class="fnaz">
      <h1>Appointments</h1>
      <a class="button" href="/appointment/create?doctor=${doctorId}">Create appointment</a>
    </div>

    <div id="appointment-table"></div>
  </div>

  <div id="bills">
    <h1>Bills</h1>

    <div id="bill-table"></div>
  </div>

  <div id="patients">
    <h1>Patients</h1>

    <div id="patient-table"></div>
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
        renderAppointmentRequestTable(data);
        renderAppointmentTable(data);
        renderPatientTable(data);
    }
}
