const authController = require("../app/http/controllers/authController");
const cartController = require("../app/http/controllers/customers/cartController");
const orderController = require("../app/http/controllers/customers/orderController");
const homeController = require("../app/http/controllers/homeController");
const adminOrderController = require("../app/http/controllers/admin/orderController");

//middlewares
const guest = require("../app/http/middlewares/guest");
const auth = require("../app/http/middlewares/auth");
const admin = require("../app/http/middlewares/admin");
const preventAdmin = require("../app/http/middlewares/preventAdmin");

function initRoutes(app) {
  //homeController().index; //calling homecontroller.index gives us the object

  app.get("/", homeController().index);

  // Menu route for authenticated users (prevent admin)
  app.get("/menu", auth, preventAdmin, homeController().menu);

  // (req, res) => {
  //   res.render("home");
  // }

  app.get("/login", guest, authController().login);
  app.post("/login", authController().postLogin);
  app.get("/switch-user/:userId", authController().switchUser);
  app.post("/logout", authController().logout);

  app.get("/register", guest, authController().register);
  app.post("/register", authController().postRegister);

  app.get("/cart", auth, preventAdmin, cartController().index);
  app.post("/update-cart", auth, preventAdmin, cartController().update);

  //Customer Routes (prevent admin)
  app.post("/orders", auth, preventAdmin, orderController().store);
  app.get("/customer/orders", auth, preventAdmin, orderController().index);

  //Admin Routes
  app.get("/admin/dashboard", admin, adminOrderController().dashboard);
  app.get("/admin/orders", admin, adminOrderController().index);

  //admin order status
  app.get("/admin/orders/status", admin, adminOrderController().index);

  // POST route for updating order status
  app.post("/admin/order/status", admin, adminOrderController().updateStatus);

  // API Routes
  app.get("/api/orders/:orderId", auth, preventAdmin, orderController().show);
}

// Export the function so it can be required in server.js
module.exports = initRoutes;
