function cartController() {
  return {
    index(req, res) {
      res.render("customers/cart");
    },

    update(req, res) {
      if (!req.session.cart) {
        req.session.cart = {
          items: {},
          totalQty: 0,
          totalPrice: 0,
        };
      }

      let cart = req.session.cart;
      console.log(req.body);

      return res.json({ data: "All okay" });
      // send success response to frontend
    },
  };
}

module.exports = cartController;
// return res.json({ data: "ALL OKAY" });

// let cart = {
//   items: {
//     footItemId: { item: foodObject, qty: 0 },
//   },
//   totalQty: 0,
//   totalPrice: 0,
// };
