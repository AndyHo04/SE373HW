const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const mongoose = require('mongoose');
require('dotenv').config();
const port = process.env.PORT || 3000;
const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
  console.error('MONGO_URI is not defined in environment variables.');
  process.exit(1);
}


// Serve static files from the Public directory
app.use(express.static('public'));

app.use(express.json());

// Connect to MongoDB
async function connectToMongo() {
  try {
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB successfully');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
}

// MongoDB Schema and Model
const todoSchema = new mongoose.Schema({}, { strict: false });
const Todo = mongoose.model('Todo', todoSchema, 'todos');

// Routes
app.get('/', (req, res) => {
  res.redirect(301, '/index');
});

app.get('/index', (req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

app.get('/todo', async (req, res) => {
  try {
    const todos = await Todo.find({});
    console.log('Fetched successfully');
    res.setHeader('Content-Type', 'application/json');
    res.json(todos);
  } catch (error) {   
    console.error('Error fetching todos:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } 
});

app.get('/read-todo', (req, res) => {
  res.sendFile('read-todo.html', { root: 'public' });
});

app.get('/todo/:id', async (req, res) => {
  try {
    const todo = await Todo.findOne({ id: parseInt(req.params.id) });
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    res.json(todo);
  } catch (error) {   
    console.error('Error fetching todo by ID:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Catch-all route - redirect any undefined routes to index
app.use((req, res) => {
  res.redirect(301, '/index');
});

connectToMongo().then(() => {
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}); 