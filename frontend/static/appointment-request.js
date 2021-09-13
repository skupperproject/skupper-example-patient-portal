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
            <input type="date" name="date" required="required" value="2021-12-21"/>
          </div>
          <div>Your preferred date for the appointment</div>
        </div>

        <div class="form-field">
          <div>Date is approximate?</div>
          <div>
            <select name="dateIsApproximate">
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
          </div>
          <div>If yes, your preferred date is flexible (plus or minus two days)</div>
        </div>

        <div class="form-field">
          <div>Time of day</div>
          <div>
            <select name="timeOfDay">
              <option value="any">Any time</option>
              <option value="morning">Morning</option>
              <option value="afternoon">Afternoon</option>
              <option value="evening">Evening</option>
            </select>
          </div>
          <div>Your preferred time of day for the appointment</div>
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
    constructor() {
        super(html);
    }

    render() {
        super.render();

        const patientId = new URL(window.location).searchParams.get("patient");

        $("#appointment-request-form").addEventListener("submit", event => {
            event.preventDefault();

            gesso.post("/api/appointment-request/create", {
                patient: parseInt(event.target.patient.value),
                date: event.target.date.value,
                date_is_approximate: event.target.dateIsApproximate.value === "yes",
                time_of_day: event.target.timeOfDay.value,
            });

            main.router.navigate(new URL(`/patient?id=${patientId}#overview`, window.location));
        });
    }

    update(data) {
        const patientId = parseInt(new URL(window.location).searchParams.get("patient"));

        $("#patient").setAttribute("value", patientId);
    }
}
