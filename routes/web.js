// routes/web.js

const authController = require("../app/http/controllers/authController");
const cartController = require("../app/http/controllers/customers/cartController");
const orderController = require("../app/http/controllers/customers/orderController");
const homeController = require("../app/http/controllers/homeController");
const guest= require("../app/http/middlewares/guest");

function initRoutes(app) {
  //homeController().index; //calling homecontroller.index gives us the object

  app.get("/", homeController().index);

  // (req, res) => {
  //   res.render("home");
  // }

  app.get("/login", guest,authController().login);
  app.post("/login", authController().postLogin);
  app.post("/logout", authController().logout);

  app.get("/register", guest,authController().register);
  app.post("/register", authController().postRegister);

  app.get("/cart", cartController().index);
  app.post("/update-cart", cartController().update);
  app.post("/orders",orderController().store);  
}

// Export the function so it can be required in server.js
module.exports = initRoutes;
