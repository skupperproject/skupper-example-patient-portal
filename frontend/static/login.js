const gesso = new Gesso();

function renderPatientLoginLinks(data) {
    const records = data.data.patients;
    const nav = gesso.createElement(null, "nav", {id: "patient-login-links", class: "login"});

    for (let record of records) {
        const href = `/patient?id=${record[0]}`;
        gesso.createLink(nav, href, record[1]);
    }

    gesso.replaceElement($("#patient-login-links"), nav);
}

function renderDoctorLoginLinks(data) {
    const records = data.data.doctors;
    const nav = gesso.createElement(null, "nav", {id: "doctor-login-links", class: "login"});

    for (let record of records) {
        const href = `/doctor?id=${record[0]}`;
        gesso.createLink(nav, href, record[1]);
    }

    gesso.replaceElement($("#doctor-login-links"), nav);
}

class MainPage {
    render() {
        $("#content").classList.add("excursion");

        $("#content").innerHTML = `
<section>
  <div>
    <h1>Patient Portal</h1>

    <h2>Log in as a patient:</h2>
    <nav id="patient-login-links"></nav>

    <h2>Log in as a doctor:</h2>
    <nav id="doctor-login-links"></nav>
  </div>
</section>
`;
    }

    update(data) {
        renderPatientLoginLinks(data);
        renderDoctorLoginLinks(data);
    }
}

export const mainPage = new MainPage();
