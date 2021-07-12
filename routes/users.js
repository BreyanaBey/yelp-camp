const express = require('express')
const router = express.Router()
const passport = require('passport')
const catchAsync = require('../utils/catchAsync')
const User = require('../models/user')

// Register user with passport local and log user in
router.route('/register')
    .get((req, res) => {
        res.render('users/register')
})
    .post(catchAsync(async (req, res, next) => {
        try {
            const { email, username, password } = req.body
            const user = new User({email, username})
            const registeredUser = await User.register(user, password)
            req.login(registeredUser, err => {
                if (err) return next(err)
                req.flash('success', 'Welcome to Yelp Camp!')
                res.redirect('/campgrounds')
            })
        } catch(e) {
            req.flash('error', e.message)
            res.redirect('register')
        }
}))

// Log user in with passport local
router.route('/login')
    .get((req, res) => {          
        res.render('users/login')
})
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req, res) => {
        req.flash('success', 'Welcome back!')
        let redirectUrl = req.session.returnTo || '/campgrounds'
        delete req.session.returnTo
        res.redirect(redirectUrl)
})

// Log user out with passport local
router.route('/logout')
    .get((req, res) => {
        req.logout()
        req.flash('success', 'Goodbye 👋')
        res.redirect('/campgrounds')
    })

module.exports = router