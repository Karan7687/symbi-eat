const User = require("../../models/user");
const bcrypt = require("bcrypt");

function adminSettingsController() {
  return {
    async showSettings(req, res) {
      try {
        const admin = await User.findOne({ role: "admin" });
        res.render("admin/settings", { 
          admin: admin,
          success: req.flash("success"),
          error: req.flash("error")
        });
      } catch (error) {
        req.flash("error", "Error loading admin settings");
        res.redirect("/admin/orders");
      }
    },

    async updateCredentials(req, res) {
      try {
        const { currentPassword, newPassword, confirmPassword, email } = req.body;
        
        if (!currentPassword || !newPassword || !confirmPassword) {
          req.flash("error", "All fields are required");
          return res.redirect("/admin/settings");
        }

        if (newPassword !== confirmPassword) {
          req.flash("error", "New passwords do not match");
          return res.redirect("/admin/settings");
        }

        if (newPassword.length < 6) {
          req.flash("error", "Password must be at least 6 characters long");
          return res.redirect("/admin/settings");
        }

        const admin = await User.findOne({ role: "admin" });
        
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, admin.password);
        if (!isCurrentPasswordValid) {
          req.flash("error", "Current password is incorrect");
          return res.redirect("/admin/settings");
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        await User.updateOne(
          { role: "admin" }, 
          { 
            password: hashedNewPassword,
            email: email || admin.email
          }
        );

        req.flash("success", "Admin credentials updated successfully");
        res.redirect("/admin/settings");
        
      } catch (error) {
        console.error("Error updating admin credentials:", error);
        req.flash("error", "Error updating credentials");
        res.redirect("/admin/settings");
      }
    }
  };
}

module.exports = adminSettingsController;
