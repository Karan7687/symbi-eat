// Middleware to prevent admin from accessing customer routes
function preventAdmin(req, res, next) {
  if (req.isAuthenticated() && req.user.role === 'admin') {
    req.flash('error', 'Admin cannot access customer features');
    return res.redirect('/admin/dashboard');
  }
  next();
}

module.exports = preventAdmin;
