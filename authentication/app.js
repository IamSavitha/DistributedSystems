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

// Routes
const mainRoutes = require('./routes/main');
app.use('/', mainRoutes);

// 404
app.use((req, res) => res.status(404).render('index', { title: 'Not Found' }));

app.listen(PORT, () => console.log(`Server http://localhost:${PORT}`));
