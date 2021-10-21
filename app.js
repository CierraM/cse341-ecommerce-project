const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors') // Place this with other requires (like 'path' and 'express')
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session)
const csrf = require('csurf')
const flash = require('connect-flash')

const errorController = require('./controllers/error');
const User = require('./models/user')

const MONGODB_URI = 'mongodb+srv://read-write-user:SWQ5mep2ULQjqvOl@cluster0.3lib4.mongodb.net/shop'
const MONGODB_URL = process.env.MONGODB_URL || MONGODB_URI;

const app = express();
//change this to work with heroku
const port = process.env.PORT || 3000;
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions'
})

const csrfProtection = csrf()

const corsOptions = {
  origin: "https://cierram-cse341-ecommerce-app.herokuapp.com/",
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

const options = {
  // useUnifiedTopology: true,
  // useNewUrlParser: true,
  // useCreateIndex: true,
  // useFindAndModify: false,
  family: 4
};


app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin')
const shopRoutes = require('./routes/shop')
const authRoutes = require('./routes/auth')


app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ secret: 'my secret', resave: false, saveUninitialized: false, store: store }));
app.use(csrfProtection)
app.use(flash())

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then(user => {
      if (!user) {
        return next();
      }
    //for setting up mongoose model
    req.user = user;
    next();
    })
    //will not fire if you don't find a user
    .catch(err => {
      throw new Error(err);
  });
})

app.use((req, res, next) => {
  //sets local variables that go into all the views
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
})

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get('/500', errorController.get500);
app.use(errorController.get404);

app.use((error, req, res, next) => {
  res.redirect('/500');
})

mongoose.connect(MONGODB_URI, options).then(result => {
  app.listen(port);

}).catch(err => console.log(err));