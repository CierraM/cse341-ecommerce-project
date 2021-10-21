const express = require('express');
const { check, body } = require('express-validator/check');

const authController = require('../controllers/auth');
const User = require('../models/user');


const router = express.Router();

router.get('/login', authController.getLogin);

router.get('/signup', authController.getSignup);

router.post('/login',
    check('email').isEmail().withMessage('Please enter a valid email')
    .normalizeEmail(),
    body('password', 'Password has to be valid').isLength({min: 4}).trim(),
    authController.postLogin);

router.post('/signup',
    check('email').isEmail()
        .withMessage('Please enter a valid email.')
        .custom((value, { req }) => {
            return User.findOne({ email: value }).then(userDoc => {
                if (userDoc) {
                    return Promise.reject('Email already exists')
                }
            })
        })
        .normalizeEmail(),
    body('password', 'please enter a valid password with at least 5 characters').isLength({ min: 4 }).trim(),
    body('confirmPassword').trim()
        .custom((value, { req }) => {
        if (value !== req.body.password){
            throw new Error('passwords have to match')
        }
        return true;
    }),
    authController.postSignup);

router.post('/logout', authController.postLogout);

router.get('/reset', authController.getReset);
router.post('/reset', authController.postReset);

router.get('/reset/:token', authController.getNewPassword);
router.post('/new-password', authController.postNewPassword);
    
module.exports = router;