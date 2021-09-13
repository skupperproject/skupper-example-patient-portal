import * as gesso from "./gesso.js";
import * as main from "./main.js";

const html = `
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

    <p><a class="button" id="appointment-request-create-link">Request an appointment</a></p>

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

const appointmentTable = new gesso.Table("appointment-table", [
    ["ID", "id"],
    ["Doctor", "doctor_id", (id, data) => data.doctors[id].name],
    ["Date", "date"],
    ["Time", "time"],
]);

const doctorTable = new gesso.Table("doctor-table", [
    ["ID", "id"],
    ["Name", "name"],
    ["Phone", "phone"],
    ["Email", "email"],
]);

export class MainPage extends gesso.Page {
    render() {
        $("#content").classList.remove("excursion");
        $("#content").innerHTML = html;
    }

    update(data) {
        main.updateTabs();

        const id = parseInt(new URL(window.location).searchParams.get("id"));
        const name = data.patients[id].name;
        const appointmentRequestCreateLink = `/appointment-request/create?patient=${id}`;

        const appointmentRequests = Object.values(data.appointment_requests)
              .filter(item => item.patient_id = id);

        const appointments = Object.values(data.appointments)
              .filter(item => item.patient_id === id);

        const doctors = Object.values(data.doctors);

        $("#patient-name").textContent = name;
        $("#appointment-request-create-link").setAttribute("href", appointmentRequestCreateLink);
        $("#appointment-request-count").textContent = appointmentRequests.length;
        $("#appointment-count").textContent = appointments.length;

        appointmentTable.render(appointments, data);
        doctorTable.render(doctors);
    }
}
