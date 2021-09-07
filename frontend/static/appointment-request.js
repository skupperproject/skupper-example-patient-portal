import * as main from "./main.js";

export const createPage = `
<section>
  <div>
    <form id="appointment-request-form">
      <div>
        <div class="hflex">
          <button name="action" type="submit">Create</button>
        </div>
      </div>
    </form>
  </div>
</section>
`;

export function update(data) {
    const form = $("#appointment-request-form");

    if (form) {
        form.addEventListener("submit", event => {
            event.preventDefault();

            main.post("/api/appointment-request/create", {});

            main.navigate(new URL("/patient?id=1#overview", window.location));
        });
    }
}
