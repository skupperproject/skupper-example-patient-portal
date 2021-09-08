import * as main from "./main.js";

const gesso = new Gesso();

function renderName(data) {
    const id = parseInt(new URL(window.location).searchParams.get("id"));
    let name;

    for (let record of data.data.patients) {
        if (record[0] == id) {
            name = record[1];
            break;
        }
    }

    $("#patient-name").textContent = name;
}

function renderDoctorTable(data) {
    const records = data.data.doctors;
    const headings = ["ID", "Name", "Phone", "Email"];
    const div = gesso.createDiv(null, "#doctor-table");

    if (records.length) {
        gesso.createTable(div, headings, records);
    }

    gesso.replaceElement($("#doctor-table"), div);
}

class MainPage {
    render() {
        const patientId = new URL(window.location).searchParams.get("id");

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
    <a href="#bills">Bills</a>
    <a href="#doctors">Doctors</a>
  </nav>

  <div id="overview">

    <h1>Welcome!</h1>

    <p><a class="button" href="/appointment-request/create?patient=${patientId}">Request an appointment</a></p>

    <p>You have <b>0</b> open appointment requests.</p>

    <p>You have <b>1</b> upcoming appointment.</p>

    <p>Your next appointment is at <b><span id="next-appointment">8:00 AM on 21 December 2021 with Doctor Michaela Quinn</span></b>.</p>
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
        renderDoctorTable(data);
    }
}

export const mainPage = new MainPage();
