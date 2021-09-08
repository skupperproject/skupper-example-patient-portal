import * as main from "./main.js";

class CreatePage {
    render() {
        const patientId = new URL(window.location).searchParams.get("patient");

        $("#content").innerHTML = `
<section>
  <div>
    <form id="appointment-request-form">
      <div>
        <input type="hidden" name="patient" value="${patientId}"/>
        <div>
          <input type="date" name="day"/>
        </div>
        <div class="hflex">
          <button type="submit">Create</button>
        </div>
      </div>
    </form>
  </div>
</section>
`;

        $("#appointment-request-form").addEventListener("submit", event => {
            event.preventDefault();

            main.post("/api/appointment-request/create", {});

            main.navigate(new URL(`/patient?id=${patientId}#overview`, window.location));
        });
    }

    update(data) {
    }
}

export const createPage = new CreatePage();
