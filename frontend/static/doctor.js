import * as gesso from "./gesso.js";
import * as main from "./main.js";

const html = `
<body>
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

<div class="tabs" id="tab">
  <nav>
    <a data-tab="appointment-requests">Appointment requests</a>
    <a data-tab="appointments">Appointments</a>
    <a data-tab="bills">Bills</a>
    <a data-tab="patients">Patients</a>
  </nav>

  <div id="appointment-requests">
    <h1>Appointment requests</h1>

    <div id="appointment-request-table"></div>
  </div>

  <div id="appointments">
    <div class="fnaz">
      <h1>Appointments</h1>
      <a class="button" id="appointment-create-link">Create appointment</a>
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
</body>
`;

const tabs = new gesso.Tabs("tab");

function formatYesNo(value) {
    if (value) return "Yes";
    else return "No";
}

const appointmentRequestTable = new gesso.Table("appointment-request-table", [
    ["ID", "id"],
    ["Patient", "patient_id", (id, data) => data.patients[id].name],
    ["Date", "date"],
    ["Date is approximate?", "date_is_approximate", formatYesNo],
    ["Time of day", "time_of_day", (value) => gesso.capitalize(value)],
//    ["Actions", "id"],
]);

const appointmentTable = new gesso.Table("appointment-table", [
    ["ID", "id"],
    ["Patient", "patient_id", (id, data) => data.patients[id].name],
    ["Date", "date"],
    ["Time", "time"],
]);

const patientTable = new gesso.Table("patient-table", [
    ["ID", "id"],
    ["Name", "name"],
    ["ZIP", "zip"],
    ["Phone", "phone"],
    ["Email", "email"],
]);

export class MainPage extends gesso.Page {
    constructor() {
        super(html);
        this.prevId = null;
    }

    render() {
        super.render();
        tabs.render();
    }

    update() {
        tabs.update();

        const id = gesso.getIntParameter("id");

        if (id === this.prevId) {
            return;
        }

        this.prevId = id;

        this.fetchData();
    }

    fetchData() {
        fetch("/api/data", {
            method: "GET",
            headers: {"Content-Type": "application/json"},
        })
            .then(response => response.json())
            .then(data => this.doUpdate(data));
    }

    doUpdate(data) {
        const id = gesso.getIntParameter("id");
        const name = data.doctors[id].name;
        const appointmentCreateLink = `/appointment/create?doctor=${id}`;
        const appointmentRequests = Object.values(data.appointment_requests);
        const appointments = Object.values(data.appointments) .filter(item => item.doctor_id === id);
        const patients = Object.values(data.patients);

        $("#doctor-name").textContent = name;
        $("#appointment-create-link").setAttribute("href", appointmentCreateLink);

        appointmentRequestTable.render(appointmentRequests, data);
        appointmentTable.render(appointments, data);
        patientTable.render(patients, data);
    }
}
