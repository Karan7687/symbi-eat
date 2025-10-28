// routes/web.js

const authController = require("../app/http/controllers/authController");
const cartController = require("../app/http/controllers/customers/cartController");
const orderController = require("../app/http/controllers/customers/orderController");
const homeController = require("../app/http/controllers/homeController");
const adminOrderController = require("../app/http/controllers/admin/orderController");
const guest = require("../app/http/middlewares/guest");
const auth = require("../app/http/middlewares/auth");

function initRoutes(app) {
  //homeController().index; //calling homecontroller.index gives us the object

  app.get("/", homeController().index);

  // (req, res) => {
  //   res.render("home");
  // }

  app.get("/login", guest, authController().login);
  app.post("/login", authController().postLogin);
  app.post("/logout", authController().logout);

  app.get("/register", guest, authController().register);
  app.post("/register", authController().postRegister);

  app.get("/cart", cartController().index);
  app.post("/update-cart", cartController().update);

  //Customer Routes
  app.post("/orders", auth, orderController().store);
  app.get("/customer/orders", auth, orderController().index);

  //Admin Routes
  app.get(
    "/admin/orders",
    auth,
    (req, res, next) => {
      console.log("🟡 Route hit: /admin/orders");
      next();
    },
    adminOrderController().index
  );
}

// Export the function so it can be required in server.js
module.exports = initRoutes;
