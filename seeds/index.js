const mongoose = require('mongoose')
const cities = require('./cities')
const { descriptors, places} = require('./seedHelpers')
const Campground = require('../models/campground')

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
})

const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', () => {
    console.log('Database connected')
})

const sample = array => array[Math.floor(Math.random() * array.length)]

const seedDB = async () => {
    await Campground.deleteMany({})
    try {
        for (let i = 0; i < 50; i++) {
            const random1000 = Math.floor(Math.random() * 1000)
            const price = Math.floor(Math.random() * 20) + 10
            const camp = new Campground({
                author: '60e350d0dfc2a627e8d7122a',
                location: `${cities[random1000].city}, ${cities[random1000].state}`,
                title: `${sample(descriptors)} ${sample(places)}`,
                image: 'https://source.unsplash.com/collection/483251',
                description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
                price: price
            })
            await camp.save()
        }
    } catch(err) {
        console.log(err)
    }
    
}

seedDB().then(() => {
    mongoose.connection.close()
})