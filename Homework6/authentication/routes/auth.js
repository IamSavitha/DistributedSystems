// routes/auth.js
const express = require('express');
const router = express.Router();
const { ensureAuth } = require('../middleware/auth');

const USERS = [
  { username: 'ads_admin', name: 'ADS Admin', password: 'spartan123' },
  { username: 'student',   name: 'ADS Student', password: 'sjsu123' }
];

router.get('/login', (req, res) => {
  if (req.session?.user) return res.redirect('/dashboard');
  res.render('login', { title: 'Login • ADS-SJSU' });
});

router.post('/login', (req, res) => {
  const { username = '', password = '' } = req.body || {};
  const found = USERS.find(u => u.username === username && u.password === password);
  if (!found) {
    req.session.msg = { type: 'danger', text: 'Invalid username or password.' };
    return res.redirect('/login');
  }
  req.session.user = { username: found.username, name: found.name };
  req.session.msg  = { type: 'success', text: `Welcome, ${found.name}!` };
  res.redirect('/dashboard');
});

router.get('/dashboard', ensureAuth, (req, res) => {
  res.render('dashboard', { title: 'Dashboard • ADS-SJSU' });
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('ads.sid');
    res.redirect('/');
  });
});

module.exports = router;
