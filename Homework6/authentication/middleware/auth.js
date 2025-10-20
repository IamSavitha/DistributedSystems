// middleware/auth.js
function ensureAuth(req, res, next) {
  if (req.session?.user) return next();
  req.session.msg = { type: 'warning', text: 'Please log in to access the dashboard.' };
  res.redirect('/login');
}
module.exports = { ensureAuth };
