const express = require('express');
const router = express.Router();
const passport = require('passport');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const requireAuth = require('../middleware/requireauth');

//get routes to display dashboard register and login
router.get('/register', (req, res) => {
    res.render('auth/register', { title: 'Register' });
});

router.get('/login', (req, res) => {
    res.render('auth/login', { title: 'Login' });
});

router.get('/dashboard', requireAuth, (req, res) => {
    res.render('auth/dashboard', { title: 'Dashboard', user: req.user });
});

router.get('/reset', (req, res) => {
    res.render('auth/reset', { title: 'Reset Password' });
});

//Post route for registering a new user
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const existingUser = await User.findOne({ $or: [ { username }, { email } ] });

        if (existingUser) {
            return res.status(400).render('auth/register', { 
                title: 'Register',
                errorMessage: 'Username or email already exists',
                formData: req.body
            });
        }

        //email validation regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).render('auth/register', {
                title: 'Register',
                errorMessage: 'Invalid email format',
                formData: req.body
            });
        }       

        if (password.length < 6) {
            return res.status(400).render('auth/register', { 
                title: 'Register',
                errorMessage: 'Password must be at least 6 characters long',
                formData: req.body
            });
        }

        // Check for at least one capital letter
        if (!/[A-Z]/.test(password)) {
            return res.status(400).render('auth/register', { 
                title: 'Register',
                errorMessage: 'Password must contain at least one capital letter',
                formData: req.body
            });
        }

        // Check for at least one number
        if (!/[0-9]/.test(password)) {
            return res.status(400).render('auth/register', { 
                title: 'Register',
                errorMessage: 'Password must contain at least one number',
                formData: req.body
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, email, passwordhash: hashedPassword });
        await user.save();

        res.redirect('/auth/login');
    } catch (error) {
        res.status(500).render('auth/register', { 
            title: 'Register',
            errorMessage: 'An error occurred during registration',
            formData: req.body
        });
    }
});

//Login via credentials
router.post('/login', passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
}));

//Logout route
router.post('/logout', (req, res, next) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/login');
    });
});

//Reset password route
router.post('/reset', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        const user = await User.findOne({ username });
        
        if (!user) {
            return res.status(400).render('auth/reset', { 
                title: 'Reset Password',
                errorMessage: 'Username not found'
            });
        }

        if (user.email !== email) {
            return res.status(400).render('auth/reset', { 
                title: 'Reset Password',
                errorMessage: 'Email does not match our records'
            });
        }

        if (password.length < 6) {
            return res.status(400).render('auth/reset', { 
                title: 'Reset Password',
                errorMessage: 'Password must be at least 6 characters long'
            });
        }

        if (!/[A-Z]/.test(password)) {
            return res.status(400).render('auth/reset', { 
                title: 'Reset Password',
                errorMessage: 'Password must contain at least one capital letter'
            });
        }

        if (!/[0-9]/.test(password)) {
            return res.status(400).render('auth/reset', { 
                title: 'Reset Password',
                errorMessage: 'Password must contain at least one number'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        user.passwordhash = hashedPassword;
        await user.save();

        res.render('auth/login', { 
            title: 'Login',
            successMessage: 'Password reset successfully! Please log in.'
        });
    } catch (error) {
        res.status(500).render('auth/reset', { 
            title: 'Reset Password',
            errorMessage: 'An error occurred while resetting password'
        });
    }
});

module.exports = router;


