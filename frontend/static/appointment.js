import * as gesso from "./gesso.js";
import * as main from "./main.js";

const html = `
<body class="excursion">
  <section>
    <div>
      <h1>Create an appointment</h1>
      <form id="appointment-form">
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

function updatePatientSelector(items, selectedId) {
    const select = gesso.createElement(null, "select", {id: "patient-selector", name: "patient"});

    for (const item of items) {
        const option = gesso.createElement(select, "option", {value: item.id});
        option.textContent = item.name;

        if (item.id === selectedId) {
            option.setAttribute("selected", "selected");
        }
    }

    gesso.replaceElement($("#patient-selector"), select);
}

export class CreatePage extends gesso.Page {
    constructor(router) {
        super(router, "/appointment/create", html);

        this.body.$("#appointment-form").addEventListener("submit", event => {
            event.preventDefault();

            const doctorId = parseInt($p("doctor"));

            gesso.postJson("/api/appointment/create", {
                doctor: doctorId,
                patient: event.target.patient.value,
                date: event.target.date.value,
                time: event.target.time.value,
            });

            this.router.navigate(new URL(`/doctor?id=${doctorId}&tab=appointments`, window.location));
        });
    }

    getContentKey() {
        return [this.page, $p("request")].join();
    }

    updateContent() {
        gesso.getJson("/api/data", data => {
            const request = data.appointment_requests[$p("request")];
            const patients = Object.values(data.patients);

            updatePatientSelector(patients, request.patient_id);
        });
    }
}
