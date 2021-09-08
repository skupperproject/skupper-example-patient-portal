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
    <a href="#patients">Patients</a>
  </nav>

  <div id="appointment-requests">
    <h1>Appointment requests</h1>

    <p>XXX</p>
  </div>

  <div id="appointments">
    <h1>Appointments</h1>

    <p>XXX</p>
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
        renderPatientTable(data);
    }
}

export const mainPage = new MainPage();
