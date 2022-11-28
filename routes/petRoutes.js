const router = require('express').Router()
const userCollection = require('../config/mongoCollections').users
const petData = require('../data').pets

router.use('/', (req, res, next) => {
    if (!req.session.user /*|| !req.session.pet*/) {
        return res.status(403).redirect('/login');
    } else {
        next();
    }
});

// GET request to 'home'
router.route('/').get( async (req, res) => {
    res.render('home', {
        title: 'Home', 
        style: "/public/css/home.css",
    })
})

// POST request to 'home/profile'
router.route('/profile').post( async (req, res) => {
    const pet = req.session.pet
    res.render('profile', {
        title: 'Profile', 
        style: '/public/css/profile.css',
        name: pet.name,
        food: pet.food, 
        cleanliness: pet.cleanliness,
        happiness: pet.happiness,
        rest: pet.rest,
        lastFed: pet.lastFed,
        lastCleaned: pet.lastCleaned,
        lastPlayed: pet.lastPlayed,
        hat: pet.hat,
        background: pet.background
    })
})

// POST request to 'home/createPet' 
router.route('/createPet').post( async (req, res) => {
    // if no design or name is specified throw error (todo: make more sophisticated error handling)
    if(!req.body.design)
        throw 'No design input chosen'
    if(!req.body.name)
        throw 'No name input chosen'

    const pet = await petData.createPet(req.session.user.id, {name: req.body.name, design: req.body.design})

    const status = await petData.givePetToUser(req.session.user.id, pet.petId)
    req.session.pet = await petData.getPetAttributes(req.session.user.id)
    res.redirect('/home')
})

module.exports = router