import * as gesso from "./gesso.js";
import * as main from "./main.js";

const html = `
<body class="excursion">
  <section>
    <div>
      <h1>Pay a bill</h1>
      <form id="bill-form">
        <input id="bill" type="hidden" name="bill"/>
        <input id="patient" type="hidden" name="patient"/>

        <div class="form-field">
          <div>Amount</div>
          <div>
            <input id="amount" readonly="readonly" name="amount"/>
          </div>
          <div>The amount to pay</div>
        </div>

        <div class="form-field">
          <div>Credit card number</div>
          <div>
            <input name="credit-card-number" required="required" value="4005 5192 0000 0004"/>
          </div>
          <div>The credit card to pay with</div>
        </div>

        <div class="form-field">
          <button type="submit">Submit payment</button>
        </div>
      </form>
    </div>
  </section>
</body>
`;

export class PayPage extends gesso.Page {
    constructor() {
        super(html);

        this.body.$("#bill-form").addEventListener("submit", event => {
            event.preventDefault();

            const billId = parseInt(event.target.bill.value);
            const patientId = parseInt(event.target.patient.value);

            gesso.post("/api/bill/pay", {
                bill: billId,
            });

            main.router.navigate(new URL(`/patient?id=${patientId}&tab=bills`, window.location));
        });
    }

    update() {
        const billId = gesso.getIntParameter("bill");

        $("#bill").setAttribute("value", billId);

        this.fetchData();
    }

    fetchData() {
        fetch("/api/data", {
            method: "GET",
            headers: {"Content-Type": "application/json"},
        })
            .then(response => response.json())
            .then(data => this.doUpdate(data));
    }

    doUpdate(data) {
        const billId = gesso.getIntParameter("bill");
        const bill = data.bills[billId];

        $("#patient").setAttribute("value", bill.patient_id);
        $("#amount").setAttribute("value", bill.amount);
    }
}
