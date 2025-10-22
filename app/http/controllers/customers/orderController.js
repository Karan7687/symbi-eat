const Order = require("../../../models/order");

function orderController() {
  return {
    store(req, res) {
      const cart = req.session.cart;

      if (!cart || !cart.items) {
        req.flash("error", "Your cart is empty!");
        return res.redirect("/cart");
      }

      const order = new Order({
        customerId: req.user._id,
        items: cart.items,
        total: cart.totalPrice, // <-- Add total here
      });

      order
        .save()
        .then((result) => {
          req.flash("success", "Order Placed Successfully!");
          // Optional: clear cart after order is placed
          req.session.cart = null;
          res.redirect("/");
        })
        .catch((err) => {
          req.flash("error", "Something went wrong!");
          return res.redirect("/cart");
        });
    },

    async index(req, res) {
      const orders = await Order.find({ customerId: req.user._id });
      res.render("customers/orders", { orders: orders });
    },
  };
}

module.exports = orderController;
