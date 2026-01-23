const User = require("../models/user");
const bcrypt = require("bcrypt");
const LocalStrategy = require("passport-local").Strategy;

function init(passport) {
  passport.use(
    new LocalStrategy(
      { usernameField: "email" },
      async (email, password, done) => {
        try {
          let user;

          // Check if login is for admin (username: admin, password: admin@123)
          if (email === "admin" && password === "admin@123") {
            // Look for admin user in database
            user = await User.findOne({ role: "admin" });
            
            if (!user) {
              return done(null, false, { message: "Admin account not found. Please run seed script." });
            }
            
            return done(null, user, { message: "Logged in successfully as admin" });
          }

          // Regular user authentication with email
          user = await User.findOne({ email: email });

          if (!user) {
            return done(null, false, { message: "No user with this email" });
          }

          // Compare the password
          const match = await bcrypt.compare(password, user.password);
          if (match) {
            return done(null, user, { message: "Logged in successfully" });
          } else {
            return done(null, false, { message: "Wrong email or password" });
          }
        } catch (err) {
          return done(err); // Forward the error to Passport
        }
      }
    )
  );

  // Serialize user
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  // Deserialize user
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
}

module.exports = init;
