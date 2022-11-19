const router = require('express').Router()
const userCollection = require('../config/mongoCollections').users
const petData = require('../data').pets

// GET request to 'home'
router.route('/').get( async (req, res) => {
    res.render('home', {title: 'Home', style: "/public/css/pet.css"})
})

// POST request to 'home/profile'
router.route('/profile').post( async (req, res) => {
    console.log('here')
    res.render('profile', {title: 'Profile'})
})

// POST request to 'home/createPet' 
router.route('/createPet').post( async (req, res) => {
    if(!req.body.design)
        throw 'No design input chosen'
    if(!req.body.name)
        throw 'No name input chosen'

    const pet = await petData.createPet(req.session.id, {name: req.body.name, design: req.body.design})

    // DOESN'T WORK YET
    // const status = await petData.givePetToUser(req.session.id, pet.petId)

    // if(!status.acknowledged || !status.modifiedCount)
    //     throw 'Error: could not register pet'

    res.redirect('/login')
})

module.exports = router