const Order = require("../../../models/order");
const moment = require("moment");

function orderController() {
  return {
    async index(req, res) {
      try {
        console.log("🟢 Controller reached: adminOrderController.index");
        const orders = await Order.find(
          { status: { $ne: "completed" } },
          null,
          { sort: { createdAt: -1 } }
        ).populate("customerId", "-password");
        console.log("📦 Orders fetched from DB:", orders.length);

        if (req.xhr) {
          console.log("📤 Sending JSON response to AJAX request");
          return res.json(orders);
        } else {
          console.log("📄 Rendering EJS view: admin/orders.ejs");
          return res.render("admin/orders", { orders, moment });
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
        res.status(500).send("Server Error");
      }
    },
  };
}

module.exports = orderController;
