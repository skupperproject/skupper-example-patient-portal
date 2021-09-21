import * as gesso from "./gesso.js";
import * as main from "./main.js";

const html = `
<body class="excursion">
  <section>
    <div>
      <h1>Request an appointment</h1>
      <form id="appointment-request-form">
        <input id="patient" type="hidden" name="patient"/>

        <div class="form-field">
          <div>Date</div>
          <div>
            <input type="date" id="date" name="date" required="required"/>
          </div>
          <div>Your preferred date for the appointment</div>
        </div>

        <div class="form-field">
          <div>Time</div>
          <div>
            <input type="time" id="time" name="time" required="required"/>
          </div>
          <div>Your preferred time for the appointment</div>
        </div>

        <div class="form-field">
          <button type="submit">Submit request</button>
        </div>
      </form>
    </div>
  </section>
</body>
`;

export class CreatePage extends gesso.Page {
    constructor(router) {
        super(router, "/appointment-request/create", html);

        this.body.$("#appointment-request-form").addEventListener("submit", event => {
            event.preventDefault();

            const patientId = parseInt($p("patient"));

            gesso.postJson("/api/appointment-request/create", {
                patient: patientId,
                date: event.target.date.value,
                time: event.target.time.value,
            });

            this.router.navigate(new URL(`/patient?id=${patientId}`, window.location));
        });
    }

    update() {
        $("#date").setAttribute("value", gesso.formatDate(new Date()));
        $("#time").setAttribute("value", gesso.formatTime(new Date()));
    }
}
