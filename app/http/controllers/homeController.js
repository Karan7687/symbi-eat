const Menu = require("../../models/menu");
function homeController() {
  //factory Functions
  return {
    async index(req, res) {
      // For non-authenticated users, show landing page
      if (!req.isAuthenticated()) {
        return res.render("landing");
      }
      
      // For authenticated users, show the menu
      const foodItems = await Menu.find();
      return res.render("home", { foodItems: foodItems });
    },
    
    async menu(req, res) {
      // Show menu for authenticated users
      const foodItems = await Menu.find();
      return res.render("home", { foodItems: foodItems });
    },
  };
}

module.exports = homeController;
