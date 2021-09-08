import * as main from "./main.js";

class CreatePage {
    render() {
        const patientId = new URL(window.location).searchParams.get("doctor");

        $("#content").classList.add("excursion");

        $("#content").innerHTML = `
<section>
  <div>
    <h1>Create an appointment</h1>
    <form id="appointment-form">
      <input type="hidden" name="doctor" value="${doctorId}"/>

      <div class="form-field">
        <div>Patient</div>
        <div>
          <input type="date" name="day" value=""/>
        </div>
        <div>Your preferred date for the appointment</div>
      </div>

      <div class="form-field">
        <div>Date is approximate?</div>
        <div>
          <select name="dateIsApproximate">
            <option value="no">No</option>
            <option value="yes">Yes&nbsp;&nbsp;</option>
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
        <button type="submit">Create appointment</button>
      </div>
    </form>
  </div>
</section>
`;

    }

    update(data) {
    }
}

export const createPage = new CreatePage();
