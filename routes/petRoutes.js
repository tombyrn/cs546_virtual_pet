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

router.route('/createPet').get((req, res) => {
    return res.render('create', {title: 'Create a Pet', style:'/public/css/create.css'})
})

// GET request to 'home/play/simon'
router.route('/play/simon').get((req, res) => {
    res.render('simon', {title: "Simon"})
})

// GET request to 'home/play/hangman'
router.route('/play/hangman').get((req, res) => {
    res.render('hangman', {title: "Hangman"})
})

router.route('/getPetInfo').get(async (req, res) => {
    pet = await petData.getPetAttributes(req.session.user.id);
    if(pet === null){
        console.log('here')
        return res.redirect('/home/petDeath')
    }
    res.send({
        pet
    })
})

router.route('/petDeath').get(async (req, res) => {
    res.render('death', {title: ':('})
})

router.route('/updatePetInfo').post(async (req, res) => {
    await petData.updatePetAttribute(req.session.user.id, "lastFed", req.body.date, true)
    await petData.updatePetAttribute(req.session.user.id, "food", req.body.foodLevel, true)

    req.session.pet.lastFed = parseInt(req.body.date)
    req.session.pet.food = parseInt(req.body.foodLevel)
    console.log('finished')
    res.end();
})

router.route('/store/:id').post((req, res) => {
    let title, price, imageSrc
    console.log('id: ', req.params.id)
    switch (req.params.id) {
        case "hat1":        //todo add hats
            title = "Hat 1"
            price = 40
            imageSrc = ""
            break;
        case "hat2":
            title = "Hat 2"
            price = 80
            imageSrc = ""
            break;
        case "hat3":
            title = "Hat 3"
            price = 200
            imageSrc = ""
            break;
        case "bg1":
            title = "Background 1"
            price = 200
            imageSrc = '/public/designs/bg1.png'

            break;
        case "bg2":
            title = "Background 2"
            price = 200
            imageSrc = '/public/designs/bg2.png'

            break;
        case "bg3":
            title = "Background 3"
            price = 500
            imageSrc = '/public/designs/bg3.png'

            break;
    
        default:
            break;
    }
    res.render('storeItem', {title, price, points: req.session.user.points, imageSrc, alt: title, name: req.params.id})
})


router.route('/buyItem').post((req, res) => {
    console.log('body', req.body)
    console.log(req.session.user)

    itemName = Object.keys(req.body)[0]
    price = Object.values(req.body)[0]
    console.log('iN: ', itemName)
    console.log('p: ', price)

    // check if user already owns the item
    let owned = false
    for(bg of req.session.user.backgroundsUnlocked){
        if(itemName === bg)
            owned = true
    }
    for(hat of req.session.user.hatsUnlocked){
        if(itemName === hat)
            owned = true
    }

    // check if user has enough points to purchase
    let canPurchase = 
    req.session.user.points >= points ? true : false

    res.render('purchase', {owned, canPurchase})
})

module.exports = router