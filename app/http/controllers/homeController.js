const Menu = require("../../models/menu");
function homeController() {
  //factory Functions
  return {
    async index(req, res) {
      const foodItems = await Menu.find();

      return res.render("home", { foodItems: foodItems });

      //   Menu.find().then(function (foodItems) {
      //     console.log(foodItems);
      //     return res.render("home", { foodItems: foodItems });
      //   });
    },
  };
}

module.exports = homeController;
