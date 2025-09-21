// routes/main.js
const express = require('express');
const router = express.Router();

// Public pages only — DO NOT import other routers here
router.get('/', (req, res) => res.render('index', { title: 'Home • ADS-SJSU' }));
router.get('/about', (req, res) => res.render('about', { title: 'About • ADS-SJSU' }));
router.get('/contact', (req, res) => res.render('contact', { title: 'Contact • ADS-SJSU' }));

module.exports = router;
