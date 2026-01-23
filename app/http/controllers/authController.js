const User = require("../../models/user");
const bcrypt = require("bcrypt");
const passport = require("passport");

function authController() {
  const _getRedirectUrl = (req) => {
    if (req.user.role === "admin") {
      return "/admin/dashboard";
    } else if (req.user.role === "customer") {
      return "/menu"; // Send users to the menu page
    } else {
      return "/"; // fallback to home
    }
  };
  
  // Store previous user info to allow switching back
  const _storePreviousUser = (req, currentUser) => {
    if (!req.session.previousUsers) {
      req.session.previousUsers = [];
    }
    
    // Remove if already exists
    req.session.previousUsers = req.session.previousUsers.filter(user => user.id !== currentUser.id);
    
    // Add current user to previous users
    req.session.previousUsers.push({
      id: currentUser.id,
      email: currentUser.email,
      name: currentUser.name,
      role: currentUser.role
    });
    
    // Keep only last 3 users
    if (req.session.previousUsers.length > 3) {
      req.session.previousUsers = req.session.previousUsers.slice(-3);
    }
  };
  
  return {
    login(req, res) {
      // Show available users to switch between
      const previousUsers = req.session.previousUsers || [];
      res.render("auth/login", { previousUsers });
    },
    
    postLogin(req, res, next) {
      passport.authenticate("local", (err, user, info) => {
        if (err) {
          req.flash("error", info.message);
          return next(err);
        }
        if (!user) {
          req.flash("error", info.message);
          return res.redirect("/login");
        }
        
        // Store current user before switching (if logged in)
        if (req.isAuthenticated()) {
          _storePreviousUser(req, req.user);
        }
        
        req.login(user, (err) => {
          if (err) {
            req.flash("error", info.message);
            return next(err);
          }

          return res.redirect(_getRedirectUrl(req));
        });
      })(req, res, next);
    },
    
    // Switch to a previous user
    switchUser(req, res) {
      const userId = req.params.userId;
      const previousUsers = req.session.previousUsers || [];
      const targetUser = previousUsers.find(user => user.id === userId);
      
      if (!targetUser) {
        req.flash("error", "User not found");
        return res.redirect("/login");
      }
      
      // Find full user object from database
      User.findById(userId).then(user => {
        if (!user) {
          req.flash("error", "User not found");
          return res.redirect("/login");
        }
        
        // Store current user before switching
        if (req.isAuthenticated()) {
          _storePreviousUser(req, req.user);
        }
        
        req.login(user, (err) => {
          if (err) {
            req.flash("error", "Failed to switch user");
            return res.redirect("/login");
          }
          
          return res.redirect(_getRedirectUrl(req));
        });
      }).catch(err => {
        req.flash("error", "Failed to switch user");
        res.redirect("/login");
      });
    },
    register(req, res) {
      res.render("auth/register");
    },
    async postRegister(req, res) {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        return res
          .status(400)
          .json({ success: false, message: "All fields are required" });
      }

      const existingUser = await User.exists({ email: email });
      if (existingUser) {
        return res
          .status(400)
          .json({ success: false, message: "Email already taken" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = new User({ name, email, password: hashedPassword });

      user
        .save()
        .then(() => {
          return res.status(200).json({ success: true });
        })
        .catch((err) => {
          return res
            .status(500)
            .json({ success: false, message: "Something went wrong!" });
        });
    },
    logout(req, res, next) {
      req.logout(function (err) {
        if (err) {
          return next(err);
        }
        
        // Single session - just logout the current user
        res.redirect("/login");
      });
    },
  };
}

module.exports = authController;
