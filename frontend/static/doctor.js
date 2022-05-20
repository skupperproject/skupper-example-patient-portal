import * as gesso from "./gesso/gesso.js";
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

  <div data-tab="appointment-requests">
    <h1>Appointment requests</h1>

    <div id="appointment-request-table"></div>
  </div>

  <div data-tab="appointments">
    <h1>Appointments</h1>

    <div id="appointment-table"></div>
  </div>

  <div data-tab="bills">
    <h1>Bills</h1>

    <div id="bill-table"></div>
  </div>

  <div data-tab="patients">
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

function createAppointmentLink(id) {
    const doctorId = $p("id");
    return gesso.createLink(null, `/appointment/create?doctor=${doctorId}&request=${id}`,
                            {class: "action", text: "Create appointment"});
}

const appointmentRequestTable = new gesso.Table("appointment-request-table", [
    ["ID", "id"],
    ["Patient", "patient_id", (id, item, data) => data.patients[id].name],
    ["Date", "date"],
    ["Time", "time"],
    ["", "id", createAppointmentLink],
]);

const appointmentTable = new gesso.Table("appointment-table", [
    ["ID", "id"],
    ["Patient", "patient_id", (id, item, data) => data.patients[id].name],
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
    constructor(router) {
        super(router, "/doctor", html);
    }

    getContentKey() {
        return [this.path, $p("id")].join();
    }

    updateView() {
        tabs.update();
    }

    updateContent() {
        gesso.getJson("/api/data", data => {
            const id = parseInt($p("id"));
            const name = data.doctors[id].name;
            const appointmentCreateLink = `/appointment/create?doctor=${id}`;
            const appointmentRequests = Object.values(data.appointment_requests)
                  .filter(item => item.appointment_id === null);
            const appointments = Object.values(data.appointments)
                  .filter(item => item.doctor_id === id);
            const patients = Object.values(data.patients);

            $("#doctor-name").textContent = name;

            appointmentRequestTable.update(appointmentRequests, data);
            appointmentTable.update(appointments, data);
            patientTable.update(patients, data);
        });
    }
}
