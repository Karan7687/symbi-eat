function homeController() {
  //factory Functions
  return {
    index(req, res ) {
      res.render("home");
    },
  };
}

module.exports = homeController;
