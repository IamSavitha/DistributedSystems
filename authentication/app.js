// app.js
const express = require('express');
const path = require('path');

const app = express();  
const PORT = process.env.PORT || 3001;

// Middleware: serve static files (HTML, CSS, JS) from /public
app.use(express.static(path.join(__dirname, 'public')));

// Basic route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'about.html'));
  });

app.get('/hello', (req, res) => {
    res.json({ msg: "Hello ADS-SJSU 🚀" });
 });
  

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
