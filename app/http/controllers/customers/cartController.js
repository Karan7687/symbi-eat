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

      // console.log(req.body);

      //chck if the item is not present in the cart
      if (!cart.items[req.body._id]) {
        cart.items[req.body._id] = {
          item: req.body,
          qty: 1,
        };

        cart.totalQty = cart.totalQty + 1;
        cart.totalPrice = cart.totalPrice + req.body.price;
      } else {
        //if foodItem already present in the cart
        cart.items[req.body._id].qty = cart.items[req.body._id].qty + 1;
        cart.totalQty = cart.totalQty + 1;
        cart.totalPrice = cart.totalPrice + req.body.price;
      }
      return res.json({ totalQty: req.session.cart.totalQty });
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
