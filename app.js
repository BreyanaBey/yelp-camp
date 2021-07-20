const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const ejsMate = require('ejs-mate')
const session = require('express-session')
const flash = require('connect-flash')
const ExpressError = require('./utils/ExpressError')
const methodOverride = require('method-override')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const User = require('./models/user')


const userRoutes = require('./routes/users')
const campgroundRoutes = require('./routes/campgrounds')
const reviewRoutes = require('./routes/reviews')

// Connect to database
mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
})

const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', () => {
    console.log('Database connected')
})

// Initialize express
const app = express();

// Use EJS templating engine
app.engine('ejs', ejsMate)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))


// Middleware to stop depreciation errors in terminal // to ensure path name is absolute
app.use(express.urlencoded({extended: true}))
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname, 'public')))


// Setting configuration for sessions and cookies // cookie expires in one week
const sessionConfig = {
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig))
app.use(flash())


// Needed to use passport authentication // Using the local strategy
app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

// Middleware that stores information from passport and flash in the local storage
app.use((req, res, next) => {
    res.locals.currentUser = req.user
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    next()
})

//Create new user with email, username, id, and salted password
// app.get('/fakeUser', async (req, res) => {
//     const user = new User({email: 'colt@gmail.com', username: 'colt'})
//     const newUser = await User.register(user, 'chicken')
//     res.send(newUser)
// })
//JSON Output
// {
//     "_id": "60d8d88ef7232d15ecbab877",
//     "email": "colt@gmail.com",
//     "username": "colt",
//     "salt": "b42de59f401cbfc4976bd1a8c74a55e7203ad63a73b95fd6694d53227078fedc",
//     "hash": "d28efac61285a9eaabdb99837f8b8beb4e2ccac0b237329dee172f2ae607d049806da7b5fbcbeff37a68e50bba2da87a08bc8ff956ce4fb93ce152b39a50275eb8cc21e74da5e21e8ef7178de1f62699de1d75b08fc9203d3fc4d7d0b544f566789b53278ee6854619f44d973553c8631f1220fd7e932ddc596cc53731c237aedc227284949af7d64261b103d3284fe71b103119627b9fd5e40907a511d4d39f97796a1128e4d4d6ea71393972aecc46027d478b62712a524149938fb0d6a17ed6d892d7b96328594fbf3ba5e9259c03fcb106e6ff3172e7e97046ac852dfe314fd0893866eac0fd128d691e959aece1f6148e20c93962099c4c22a61b9bf3eb850941b2655ee2f48dec2804f5ce031bf7d193cc1a46de9ca83ac70013b487de4eff0916a6a34d28224cbd12d3e886286a0ca3e1cdf461394582007a7dbe43353d80a2f90f34e2ed2baf3394ee3ab43584b899059457e43964b7050903ba1d0a2c41b4c5da572f3991779cc80461523b52863029674a33bffaa9b7f3ffe0be4b6c25fc1bf6795400d2eeb36d3fd8fdc9804aa888511537b59fd564465578424b7954c3cbb2450593eec30891cf3aa55fc07f26fc6843781a7e5c19be5ecf130e4495018c10a7e042d9d473968f67c8fb6a5d3afa87e5739647b7693898fcf07d674781f98602cb9abc58963220f60c5d32cbb32225b4f80c5956c2d13cf17079",
//     "__v": 0
// }

// Home Route
app.route('/')
    .get((req, res) => {
        res.render('home')
    })
    .post((req, res) => {
        res.send('Add to Home')
    })
    .put((req, res) => {
        res.send('Update Home')
    })

// Prefix all routes in routes/user to use the route /user/...
app.use('/',  userRoutes)
//Prefix all routes in routes/campgrounds to use the route /campgrounds/...
app.use('/campgrounds', campgroundRoutes)

app.use('/campgrounds/:id/reviews', reviewRoutes)


// Middleware to add 404 error handler
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

// Middleware to add 500 error handler
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err
    if(!err.message) err.message = 'Oh No, Something went wrong!'
    res.status(statusCode).render('error', { err })
})

// Start up server
app.listen(3000, () => {
    console.log('Listening on port 3000')
})