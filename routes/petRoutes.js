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

// POST request to 'home/play'
router.route('/play').get((req, res) => {
    res.render('chooseGame', {title: 'Choose Game', style: '/public/css/chooseGame.css'})
})

// POST request to 'home/clean'
router.route('/clean').get((req, res) => {
    res.render('clean', {title: 'Clean'})
})

// POST request to 'home/store'
router.route('/store').get((req, res) => {
    res.render('store', {title: 'Store', style: '/public/css/store.css'})
})

// POST request to 'home/profile'
router.route('/profile').get( async (req, res) => {
    
    const pet = req.session.pet

    //presenting date on the screen
    
    pet.lastFed = new Date(Number(pet.lastFed)).toDateString();
    pet.lastCleaned = new Date(Number(pet.lastCleaned)).toDateString();
    pet.lastPlayed = new Date(Number(pet.lastPlayed)).toDateString();

    res.render('profile', {
        title: 'Profile', 
        style: '/public/css/profile.css',
        name: pet.name,
        health: pet.health, 
        food: pet.food, 
        cleanliness: pet.cleanliness,
        happiness: pet.happiness,
        rest: pet.rest,
        lastFed: pet.lastFed,
        lastCleaned: pet.lastCleaned,
        lastPlayed: pet.lastPlayed,
        hat: pet.hat === "0" ? "none" : pet.hat,
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

// GET request to 'home/play/simon'
router.route('/play/simon').get((req, res) => {
    res.render('simon', {title: "Simon"})
})

// GET request to 'home/play/hangman'
router.route('/play/hangman').get((req, res) => {
    res.render('hangman', {title: "Hangman"})
})

router.route('/getPetInfo').get((req, res) => {
    res.send({
        pet: req.session.pet
    })
})

router.use('/store/:id', (req, res) => {
    res.render('storeItem', {title: req.params.id})
})

module.exports = router