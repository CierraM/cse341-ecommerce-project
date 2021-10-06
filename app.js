const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const adminRoutes = require('./routes/admin')
const shopRoutes = require('./routes/shop')

const errorController = require('./controllers/error');
const User = require('./models/user')

const app = express();
//change this to work with heroku
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', 'views');

// const adminRoutes = require('./routes/admin');
// const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  User.findById('615b9908f9033d2b4b2282d5')
    .then(user => {
      req.user = user;
      next();
    })
    .catch(err => console.log(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

mongoose.connect('mongodb+srv://read-write-user:SWQ5mep2ULQjqvOl@cluster0.3lib4.mongodb.net/shop?retryWrites=true&w=majority').then(result => {
  User.findOne().then(user => {
    if (!user) {
      const user = new User({
        name: 'Max',
        email: 'max@test.com',
        cart: {
          items: []
        }
      })
      user.save();
 
    }
  })
  app.listen(port);
}).catch(err => console.log(err));
