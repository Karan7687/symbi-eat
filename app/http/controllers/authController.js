function authController() {
  return {
    login(req, res) {
      res.render("auth/login");
    },
    register(req, res) {
      res.render("auth/register");
    },
    postRegister(req, res) {
      const { name, email, password } = req.body;
      console.log(req.body);
    },
  };
}

module.exports = authController;
