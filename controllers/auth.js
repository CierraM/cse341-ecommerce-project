const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');

const transporter = nodemailer.createTransport(sendgridTransport({
  auth: {
    api_key: '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'
  }
}));

const User = require('../models/user');

exports.getLogin = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  }
  else {
    message = null;
  }
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    errorMessage: message
  });
};

exports.getSignup = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  }
  else {
    message = null;
  }
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    errorMessage: message

  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  User.findOne({
      email: email
    })
    .then(user => {
      if (!user) {
        req.flash('error', 'Invalid email or password')
        return res.redirect('/login');
      }
      bcrypt.compare(password, user.password).then(doMatch => {
        if (doMatch) {
          req.session.isLoggedIn = true;
          req.session.user = user;
          return req.session.save(err => {
            console.log(err);
            res.redirect('/');
          });
        }
        req.flash('error', 'Invalid email or password')
        res.redirect('/login')
      }).catch(err => {
        //if something goes wrong, not if password doesn't match
        res.redirect('/login')
      })

    })
    .catch(err => console.log(err));
};

exports.postSignup = (req, res, next) => {

  const firstName = req.body.fname;
  const lastName = req.body.lname;
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;

  User.findOne({
      email: email
    }).then(userDoc => {
      if (userDoc) {
        req.flash('error', 'Email already exists')
        return res.redirect('/signup')
      }
      //takes thing to be encrypted, and salt value
      return bcrypt.hash(password, 12)
        .then(hashedPassword => {
          const user = new User({
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: hashedPassword,
            cart: {
              items: []
            }
          });
          return user.save();
        })
        .then(result => {
          res.redirect('/login');
          return transporter.sendMail({
            to: email,
            from: 'how17018@byui.edu',
            subject: 'Signup Suceeded',
            html: '<h1>Thanks for signing up!</h1>'
          })
        })
        .catch(err => {
        console.log(err)
      })
    })
    .catch(err => {
      console.log(err)
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect('/');
  });
};