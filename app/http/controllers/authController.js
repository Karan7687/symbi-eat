const User = require("../../models/user");
const bcrypt = require("bcrypt");

function authController() {
  return {
    login(req, res) {
      res.render("auth/login");
    },
    register(req, res) {
      res.render("auth/register");
    },
    async postRegister(req, res) {
      const { name, email, password } = req.body;
      console.log(req.body);

      // Validate the request
      if (!name || !email || !password) {
        req.flash("error", "All fields are required");
        req.flash("name", name);
        req.flash("email", email);
        return res.redirect("/register");
      }

      // Check if user already exists
      const existingUser = await User.exists({ email: email });
      if (existingUser) {
        req.flash("error", "Email already taken");
        req.flash("name", name);
        req.flash("email", email);
        return res.redirect("/register");
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new user
      const user = new User({
        name,
        email,
        password: hashedPassword,
      });

      user
        .save()
        .then(() => {
          return res.redirect("/");
        })
        .catch((err) => {
          req.flash("error", "Something went wrong!");
          return res.redirect("/register");
        });
    },
  };
}

module.exports = authController;
