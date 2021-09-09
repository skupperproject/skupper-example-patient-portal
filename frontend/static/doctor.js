import * as main from "./main.js";

const gesso = new Gesso();

function getDoctorId() {
    return parseInt(new URL(window.location).searchParams.get("id"));
}

function renderName(data) {
    const name = data.data.new.doctors[getDoctorId()].name;
    $("#doctor-name").textContent = name;
}

function renderAppointmentRequestTable(data) {
    const id = "appointment-request-table";
    const collection = data.data.new.appointment_requests;
    const headings = ["ID", "Patient", "Day", "Day is approximate?", "Time of day", "Actions"];
    const fieldNames = ["id", "patient_id", "date", "date_is_approximate", "time_of_day", "id"];

    main.renderTable(id, collection, headings, fieldNames);
}

function renderAppointmentTable(data) {
    const id = "appointment-table";
    const collection = data.data.new.appointments;
    const headings = ["ID", "Patient", "Doctor", "Date", "Time"];
    const fieldNames = ["id", "patient_id", "doctor_id", "date", "time"];

    main.renderTable(id, collection, headings, fieldNames);
}

function renderPatientTable(data) {
    const id = "patient-table";
    const collection = data.data.new.patients;
    const headings = ["ID", "Name", "ZIP", "Phone", "Email"];
    const fieldNames = ["id", "name", "zip", "phone", "email"];

    main.renderTable(id, collection, headings, fieldNames);
}

class MainPage {
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

export const mainPage = new MainPage();
