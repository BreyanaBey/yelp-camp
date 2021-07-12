const express = require('express')
const router = express.Router()
const catchAsync = require('../utils/catchAsync')
const Campground = require('../models/campground')
const { isLoggedIn, validateCampground, isAuthor } = require('../middleware')


// Show all campgrounds 
router.route('/')
    .get(catchAsync(async (req, res) => {
        const campgrounds = await Campground.find({})
        res.render('campgrounds/index', { campgrounds })
    }))
    .post(isLoggedIn, validateCampground, catchAsync(async (req, res, next) => {
        // if(!req.body.campground) throw new ExpressError('Invalid Campground data', 400)
        
        const campground = new Campground(req.body.campground)
        campground.author = req.user._id
        await campground.save()
        req.flash('success', 'Successfully made a new campground!')
        res.redirect(`/campgrounds/${campground._id}`)
    }))


// Create a new campground
router.route('/new')
    .get(isLoggedIn, (req, res) => {
        res.render('campgrounds/new')
    })


// Show single campground // Show updated single campground // Delete single campground
router.route('/:id')
    .get(catchAsync(async (req, res) => {
        const campground = await (await Campground.findById(req.params.id).populate({path: 'reviews', populate: {path: 'author'}}).populate('author'))
        if (!campground) {
            req.flash('error', 'Campground not found.')
            return res.redirect('/campgrounds')
        }
        res.render('campgrounds/show', { campground })
    }))
    .put(isLoggedIn, isAuthor, validateCampground, catchAsync(async (req, res) => {
        const { id } = req.params
        const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground })
        req.flash('success', 'Successfully updated campground!')
        res.redirect(`/campgrounds/${campground._id}`)
    }))
    .delete(isLoggedIn, isAuthor, catchAsync(async (req, res) => {
        const { id } = req.params
        await Campground.findByIdAndDelete(id)
        req.flash('success', 'Successfully deleted campground.')
        res.redirect('/campgrounds')
    }))


// Edit single campground
router.route('/:id/edit')
    .get(isLoggedIn, isAuthor, catchAsync(async (req, res) => {
        const { id } = req.params
        const campground = await Campground.findById(id)
        if (!campground) {
            req.flash('error', 'Campground not found.')
            return res.redirect('/campgrounds')
        }
        res.render('campgrounds/edit', { campground })
    }))

module.exports = router