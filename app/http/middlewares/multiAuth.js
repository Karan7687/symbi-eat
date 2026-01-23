// Middleware to check if user has access to admin routes
function admin(req, res, next) {
  if (req.isAuthenticated() && req.user.role === 'admin') {
    return next();
  }
  res.redirect('/login');
}

// Middleware to check if user has access to customer routes  
function auth(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

// Middleware to allow both user and admin access
function userOrAdmin(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

module.exports = { admin, auth, userOrAdmin };
