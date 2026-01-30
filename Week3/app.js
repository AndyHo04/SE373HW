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
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');

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
  },
   runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true
  }
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));


if (!mongoURI) {
  console.error('MONGO_URI is not defined in environment variables.');
  process.exit(1);
}

async function connectToMongo() {
  try {
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB successfully');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
}


app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: true }));

//setup passport authentication
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    dbName: 'Empl'
  }),
  cookie: { httpOnly: true }
})
);

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

require('./auth/passport');

// Serve CSS files BEFORE routes 
app.use('/css', express.static(path.join(__dirname, 'css')));

const authRouter = require('./routes/auth');
app.use('/', authRouter);

//set up router - must come AFTER passport initialization
app.use('/', employeeRouter);



connectToMongo().then(() => {
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}); 
