import * as main from "./main.js";

const gesso = new Gesso();

function renderName(data) {
    const id = parseInt(new URL(window.location).searchParams.get("id"));
    let name;

    for (let record of data.data.doctors) {
        if (record[0] == id) {
            name = record[1];
            break;
        }
    }

    $("#doctor-name").textContent = name;
}

function renderAppointmentRequestTable(data) {
    const records = data.data.appointment_requests;
    const headings = ["ID", "Patient", "Day", "Day is approximate?", "Time of day"];
    const div = gesso.createDiv(null, "#appointment-request-table");

    if (records.length) {
        gesso.createTable(div, headings, records);
    }

    gesso.replaceElement($("#appointment-request-table"), div);
}

function renderPatientTable(data) {
    const records = data.data.patients;
    const headings = ["ID", "Name", "ZIP", "Phone", "Email"];
    const div = gesso.createDiv(null, "#patient-table");

    if (records.length) {
        gesso.createTable(div, headings, records);
    }

    gesso.replaceElement($("#patient-table"), div);
}

class MainPage {
    render() {
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
    <a href="#bills">Bills</a>
    <a href="#patients">Patients</a>
  </nav>

  <div id="appointment-requests">
    <h1>Appointment requests</h1>

    <div id="appointment-request-table"></div>
  </div>

  <div id="appointments">
    <h1>Appointments</h1>

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
        renderPatientTable(data);
    }
}

export const mainPage = new MainPage();
