// routes/web.js

const homeController = require("../app/http/controllers/homeController");

function initRoutes(app) {
  //homeController().index; //calling homecontroller.index gives us the object
 
  app.get("/", homeController().index);

  // (req, res) => {
  //   res.render("home");
  // }

  app.get("/cart", (req, res) => {
    res.render("customers/cart");
  });

  app.get("/login", (req, res) => {
    res.render("auth/login");
  });

  app.get("/register", (req, res) => {
    res.render("auth/register");
  });
}

// Export the function so it can be required in server.js
module.exports = initRoutes;
