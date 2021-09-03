const gesso = new Gesso();

export const page = `
<header>
  <div>
    <a id="logotype" href="/">
      <span class="material-icons-outlined">medical_services</span>
      Patient Portal
    </a>
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
    <a href="#doctors">Doctors</a>
  </nav>

  <div id="overview">
    <h1>Welcome!</h1>

    <div>
      <h2>Your next appointment</h2>

      <p>XXX</p>
    </div>
  </div>

  <div id="appointments">
    <h1>Appointments</h1>

    <p>XXX</p>
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

function renderNav(data) {
    const records = data.data.patients;
    const nav = gesso.createElement(null, "nav", {id: "patient-nav", class: "entry"});

    for (let record of records) {
        const href = `/patient?id=${record[0]}`;
        gesso.createLink(nav, href, record[1]);
    }

    gesso.replaceElement($("#patient-nav"), nav);
}

function renderName(data) {
    const url = new URL(window.location);
    const id = parseInt(url.searchParams.get("id"));
    let name;

    for (let record of data.data.patients) {
        if (record[0] == id) {
            name = record[1];
            break;
        }
    }

    $("#patient-name").textContent = name;
}

function renderTable(data) {
    const records = data.data.patients;
    const headings = ["ID", "Name", "ZIP", "Phone", "Email"];
    const div = gesso.createDiv(null, "#patient-table");

    if (records.length) {
        gesso.createTable(div, headings, records);
    }

    gesso.replaceElement($("#patient-table"), div);
}

export function render(data) {
    if ($("#patient-nav")) renderNav(data);
    if ($("#patient-name")) renderName(data);
    if ($("#patient-table")) renderTable(data);
}
