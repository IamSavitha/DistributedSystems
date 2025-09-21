//enable EJS + layouts + routes

const path = require('path');
const express = require('express');
const expressLayouts = require('express-ejs-layouts');

const app = express();
const PORT = process.env.PORT || 3001;




// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layout'); // views/layout.ejs

// Static + forms
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

// Expose simple locals (e.g., active nav)
app.use((req, res, next) => {
  res.locals.path = req.path; // used to highlight the current nav link
  next();
});

//working on auth 
require('dotenv').config();
const session = require('express-session');
const isProd = process.env.NODE_ENV === 'production';

app.use(
  session({
    name: 'ads.sid',
    secret: process.env.SESSION_SECRET || 'dev_fallback',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProd,         // requires HTTPS in prod
      maxAge: 1000 * 60 * 60 // 1 hour
    }
  })
);

// Make session data available to EJS
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.msg = req.session.msg || null; // one-shot messages
  if (req.session.msg) delete req.session.msg;
  next();
});
//working on auth till here 

// Routes

const mainRoutes = require('./routes/main');
const authRoutes = require('./routes/auth');

app.use('/', mainRoutes);
app.use('/', authRoutes);

// 404
app.use((req, res) => res.status(404).render('index', { title: 'Not Found' }));

// 500
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render('500', { title: 'Server Error' });
});


app.listen(PORT, () => console.log(`Server http://localhost:${PORT}`));
