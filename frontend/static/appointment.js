import * as main from "./main.js";

class CreatePage {
    render() {
        const doctorId = parseInt(new URL(window.location).searchParams.get("doctor"));

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
          <select name="patient">
            <option value="1">Angela Martin</option>
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
`;

        $("#appointment-form").addEventListener("submit", event => {
            event.preventDefault();

            main.post("/api/appointment/create", {
                doctor: doctorId,
                patient: parseInt(event.target.doctor.value),
                date: event.target.date.value,
                time: event.target.time.value,
            });

            main.navigate(new URL(`/doctor?id=${doctorId}#appointments`, window.location));
        });
    }

    update(data) {
    }
}

export const createPage = new CreatePage();
