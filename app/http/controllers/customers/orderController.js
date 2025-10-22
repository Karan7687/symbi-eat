const Order = require("../../../models/order");
const moment = require("moment");

function orderController() {
  return {
    // store: place the order, save total, clear session, render orders page with success overlay
    async store(req, res) {
      try {
        const cart = req.session.cart;

        if (!cart || !cart.items || Object.keys(cart.items).length === 0) {
          req.flash("error", "Your cart is empty!");
          return res.redirect("/cart");
        }

        // compute total (fallback if cart.total or cart.totalPrice is missing)
        let total =
          typeof cart.total === "number"
            ? cart.total
            : typeof cart.totalPrice === "number"
            ? cart.totalPrice
            : 0;

        if (total === 0) {
          for (const id in cart.items) {
            const it = cart.items[id];
            total += (it.item.price || 0) * (it.qty || 0);
          }
        }

        const order = new Order({
          customerId: req.user._id,
          items: cart.items,
          total: total, // saved in DB under 'total'
        });

        const saved = await order.save();

        // clear cart
        req.session.cart = null;

        // fetch updated orders to show on orders page
        const orders = await Order.find({ customerId: req.user._id }).sort({
          createdAt: -1,
        });

        // render orders page with success overlay payload
        return res.render("customers/orders", {
          orders,
          moment,
          success: true,
          orderId: saved._id,
          total: total,
          user: req.user,
          session: req.session,
        });
      } catch (err) {
        console.error("Order save error:", err);
        req.flash("error", "Something went wrong!");
        return res.redirect("/cart");
      }
    },

    // index: show orders page (regular view)
    async index(req, res) {
      try {
        const orders = await Order.find({ customerId: req.user._id }).sort({
          createdAt: -1,
        });
        return res.render("customers/orders", {
          orders,
          moment,
          user: req.user,
          session: req.session,
        });
      } catch (err) {
        console.error("Fetch orders error:", err);
        return res.status(500).send("Internal Server Error");
      }
    },
  };
}

module.exports = orderController;
