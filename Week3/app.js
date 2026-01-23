const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const mongoose = require('mongoose');
require('dotenv').config();
const port = process.env.PORT || 3000;
const mongoURI = process.env.MONGO_URI;
const methodOverride = require('method-override');
const { engine } = require('express-handlebars');
const employeeRouter = require('./routes/employee');

//templating engine setup
app.engine('hbs', engine({ 
  extname: '.hbs',
  layoutsDir: path.join(__dirname, 'views/layout'),
  defaultLayout: 'main',
  helpers: {
    eq: (a, b) => a === b,
    formatDate: (date) => {
      if (!date) return '';
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  }
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));


if (!mongoURI) {
  console.error('MONGO_URI is not defined in environment variables.');
  process.exit(1);
}

app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: true }));

//setup route comes before static files to handle dynamic routes first
app.use('/', employeeRouter);

app.use('/css', express.static(path.join(__dirname, 'css')));


async function connectToMongo() {
  try {
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB successfully');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
}

connectToMongo().then(() => {
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}); 
