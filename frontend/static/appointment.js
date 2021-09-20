import * as gesso from "./gesso.js";
import * as main from "./main.js";

const html = `
<body class="excursion">
  <section>
    <div>
      <h1>Create an appointment</h1>
      <form id="appointment-form">
        <input id="doctor" type="hidden" name="doctor"/>

        <div class="form-field">
          <div>Patient</div>
          <div>
            <select id="patient-selector" name="patient">
            </select>
          </div>
          <div>The patient for the appointment</div>
        </div>

        <div class="form-field">
          <div>Date</div>
          <div>
            <input type="date" name="date" required="required" value="2021-12-21"/>
          </div>
          <div>The date of the appointment</div>
        </div>

        <div class="form-field">
          <div>Time</div>
          <div>
            <input type="time" name="time" required="required" value="09:00" step="1800"/>
          </div>
          <div>The time of the appointment</div>
        </div>

        <div class="form-field">
          <button type="submit">Create appointment</button>
        </div>
      </form>
    </div>
  </section>
</body>
`;

function renderPatientSelector(items) {
    const select = gesso.createElement(null, "select", {id: "patient-selector", name: "patient"});

    for (const item of items) {
        const option = gesso.createElement(select, "option", {value: item.id});
        option.textContent = item.name;
    }

    gesso.replaceElement($("#patient-selector"), select);
}

export class CreatePage extends gesso.Page {
    constructor(router) {
        super(router, "/appointment/create", html);

        this.body.$("#appointment-form").addEventListener("submit", event => {
            event.preventDefault();

            const doctorId = parseInt(event.target.doctor.value);

            gesso.postJson("/api/appointment/create", {
                doctor: doctorId,
                patient: event.target.patient.value,
                date: event.target.date.value,
                time: event.target.time.value,
            });

            main.router.navigate(new URL(`/doctor?id=${doctorId}&tab=appointments`, window.location));
        });
    }

    updateView() {
        $("#doctor").setAttribute("value", $p("doctor"));
    }

    updateContent() {
        gesso.getJson("/api/data", data => {
            const patients = Object.values(data.patients);

            renderPatientSelector(patients);
        });
    }
}
