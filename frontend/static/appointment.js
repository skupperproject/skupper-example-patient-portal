import * as main from "./main.js";

class CreatePage {
    render() {
        $("#content").innerHTML = `
<section>
  <div>
    <form id="appointment-form" method="post" action="/api/appointment">
      <div>
        <h4>XXX</h4>
        <input name="price" type="number" min="1" value="10" required="required" onclick="this.select()"/>
      </div>

      <div>
        <div class="hflex">
          <button name="action" type="submit">Create</button>
        </div>
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
