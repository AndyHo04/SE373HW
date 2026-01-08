const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 3000;

// Serve static files from the Public directory
app.use(express.static(path.join(__dirname, 'public')));

//Routes for site
app.get('/', (req, res) => {
  res.writeHead(301, {'Location': 'http://' + req.headers['host'] + '/index.html'});
  res.end();
});

app.get('/todo', (req, res) => {
    fs.readFile(path.join(__dirname, 'data', 'todo.json'), 'utf8', (err, data) => {
        if (err) {
            res.status(500).send('Error reading todo items');
            return;
        }
        res.setHeader('Content-Type', 'application/json');
        res.send(data); 
    });
});

app.get('/read-todo', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'read-todo.html'));
});

// Catch-all route - redirect any undefined routes to index
app.use((req, res) => {
    res.redirect('/index.html');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});