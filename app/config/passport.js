const User = require("../models/user");
const bcrypt = require("bcrypt");
const localStrategy = require("passport-local").Strategy;
function init(passport) {
  passport.use(
    new localStrategy(
      { usernameField: "email" },
      async (email, password, done) => {
        //check if email exists
        const user = await User.findOne({ email: email });

        if (!user) {
          return done(null, false, { message: "No user with this email" });
        }

        bcrypt
          .compare(password, user.password)
          .then((match) => {
            if (match) {
              return done(null, user, { message: "Logged In successfully" });
            }
            return done(null, false, { message: "Wrong username or password" });
          })
          .catch((err) => {
            return done(null, false, { message: "Something went wrong" });
          });
      }
    )
  );

  //Storing id after login
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser((user) => {
    User.findById(id, (err, user) => {
      done(err, user);
    });
  });
}

module.exports = init;
