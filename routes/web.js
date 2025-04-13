// routes/web.js

const authController = require("../app/http/controllers/authController");
const cartController = require("../app/http/controllers/customers/cartController");
const homeController = require("../app/http/controllers/homeController");

function initRoutes(app) {
  //homeController().index; //calling homecontroller.index gives us the object

  app.get("/", homeController().index);

  // (req, res) => {
  //   res.render("home");
  // }

  app.get("/cart", cartController().index);

  app.get("/login", authController().login);

  app.get("/register", authController().register);
}

// Export the function so it can be required in server.js
module.exports = initRoutes;
