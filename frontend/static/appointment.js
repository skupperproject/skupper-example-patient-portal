import * as gesso from "./gesso.js";
import * as main from "./main.js";

const html = `
<body class="excursion">
  <section>
    <div>
      <h1>Create an appointment</h1>
      <form id="appointment-form">
        <input type="hidden" id="patient-id" name="patientId"/>

        <div class="form-field">
          <div>Patient</div>
          <div>
            <input id="patient-name" readonly="readonly"/>
          </div>
          <div>The patient requesting an appointment</div>
        </div>

        <div class="form-field">
          <div>Date</div>
          <div>
            <input type="date" name="date" required="required" value="2021-12-21"/>
          </div>
          <div>Requested date: <span id="requested-date">-</span></div>
        </div>

        <div class="form-field">
          <div>Time</div>
          <div>
            <input type="time" name="time" required="required" value="09:00" step="1800"/>
          </div>
          <div>Requested time: <span id="requested-time">-</span></div>
        </div>

        <div class="form-field">
          <button type="submit">Create appointment</button>
        </div>
      </form>
    </div>
  </section>
</body>
`;

export class CreatePage extends gesso.Page {
    constructor(router) {
        super(router, "/appointment/create", html);

        this.body.$("#appointment-form").addEventListener("submit", event => {
            event.preventDefault();

            const doctorId = parseInt($p("doctor"));
            const requestId = parseInt($p("request"));

            gesso.postJson("/api/appointment/create", {
                doctor: doctorId,
                patient: parseInt(event.target.patientId.value),
                request: requestId,
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

            $("#patient-id").setAttribute("value", request.patient_id);
            $("#patient-name").setAttribute("value", data.patients[request.patient_id].name);
            $("#requested-date").textContent = request.date; // XXX Prefill the actual date
            $("#requested-time").textContent = request.time; // XXX Prefill the actual time
        });
    }
}
