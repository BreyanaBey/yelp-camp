const { campgroundSchema, reviewSchema } = require('./schemas')
const ExpressError = require('./utils/ExpressError')
const Campground = require('./models/campground')
const Review = require('./models/review')

// Middleware to protect certain routes from being accessed without logging in
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        //Stores url in session to redirect back to after logged in
        req.session.returnTo = req.originalUrl
        
        req.flash('error', 'You must be logged in to view this page')
        return res.redirect('/login')
    }
    next()
}

// Check for errors
module.exports.validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body)
    if(error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next()
    }
}

// Check ownership before allowing edit/ delete of campground
module.exports.isAuthor = async(req, res, next) => {
    const { id } = req.params
    const campground = await Campground.findById(id)
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', 'Please check to see if you own this campground')
        return res.redirect(`/campgrounds/${id}`)
    }
    next()
}

// Check ownership before allowing edit/ delete of review
module.exports.isReviewAuthor = async(req, res, next) => {
    const { id, reviewId } = req.params
    const review = await Campground.findById(reviewId)
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'Please check to see if you own this review')
        return res.redirect(`/campgrounds/${id}`)
    }
    next()
}

// Error validation
module.exports.validateReviews = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body)
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next()
    }
}