const gesso = new Gesso();

export const page = `
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

function renderLoginLinks(data) {
    const records = data.data.doctors;
    const nav = gesso.createElement(null, "nav", {id: "doctor-login-links", class: "login"});

    for (let record of records) {
        const href = `/doctor?id=${record[0]}`;
        gesso.createLink(nav, href, record[1]);
    }

    gesso.replaceElement($("#doctor-login-links"), nav);
}

function renderName(data) {
    const url = new URL(window.location);
    const id = parseInt(url.searchParams.get("id"));
    let name;

    for (let record of data.data.doctors) {
        if (record[0] == id) {
            name = record[1];
            break;
        }
    }

    $("#doctor-name").textContent = name;
}

function renderTable(data) {
    const records = data.data.doctors;
    const headings = ["ID", "Name", "Phone", "Email"];
    const div = gesso.createDiv(null, "#doctor-table");

    if (records.length) {
        gesso.createTable(div, headings, records);
    }

    gesso.replaceElement($("#doctor-table"), div);
}

export function update(data) {
    if ($("#doctor-login-links")) renderLoginLinks(data);
    if ($("#doctor-name")) renderName(data);
    if ($("#doctor-table")) renderTable(data);
}
