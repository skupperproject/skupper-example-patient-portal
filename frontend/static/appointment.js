export const createPage = `
<section>
  <div>
    <form id="order-form" method="post" action="/api/appointment">
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
