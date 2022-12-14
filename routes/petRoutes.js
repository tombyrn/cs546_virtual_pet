const router = require('express').Router()
const userCollection = require('../config/mongoCollections').users
const petData = require('../data').pets
const userData = require('../data').users
const hangmanGameDate = require('../data').hangmanGameDate

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
        background: req.session.user.background
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

// // GET request to 'home/play/simon'
// router.route('/play/simon').get((req, res) => {
//     res.render('simon', {title: "Simon"})
// })

// // GET request to 'home/play/hangman'
// router.route('/play/hangman').get((req, res) => {
//     res.render('hangman', {title: "Hangman"})
// })

// GET request to 'home/play/simon'
router.route('/play/simon').get((req, res) => {
    res.render('simon')
})

// GET request to 'home/play/hangman'
router.route('/play/hangman').get((req, res) => {
    res.render('hangman', {alphabets: hangmanGameDate.alphabets,lives: hangmanGameDate.lives,hintword: hangmanGameDate.word})
})
// GET request to 'home/play/hangman'
router.route('/').get((req, res) => {
    res.render('choosegame')
})

// GET request to 'home/play/hangman'
router.route('/gethint').get((req, res) => {
    let select_word  = req.query.answertext;
    let allwords = hangmanGameDate.words;
    let hint =  allwords.get(select_word);
    res.send(hint).status(200);
})

router.route('/getPetInfo').get(async (req, res) => {
    pet = await petData.getPetAttributes(req.session.user.id);
    if(pet === null){
        console.log('here')
        return res.redirect('/home/petDeath')
    }
    res.send({
        pet,
        background: req.session.user.background
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
            imageSrc = "/public/designs/hat1.webp"
            break;
        case "hat2":
            title = "Hat 2"
            price = 80
            imageSrc = "/public/designs/hat2.webp"
            break;
        case "hat3":
            title = "Hat 3"
            price = 200
            imageSrc = "/public/designs/hat3.webp"
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

    itemName = Object.keys(req.body)[0]
    price = Object.values(req.body)[0]

    let itemNo
    if(itemName.includes('1'))
        itemNo = 1
    if(itemName.includes('2'))
        itemNo = 2
    if(itemName.includes('3'))
        itemNo = 3

    const hat = itemName.includes('hat')
    console.log(hat)
    console.log(itemNo)
    // check if user already owns the item
    console.log(req.session.user.backgroundsUnlocked)
    console.log(req.session.user.hatsUnlocked)
    let owned = false
    if(hat){
        for(h of req.session.user.hatsUnlocked){
            if(itemNo === h)
                owned = true
        }
    }
    else{
        for(b of req.session.user.backgroundsUnlocked){
            if(itemNo === b)
                owned = true
        }
    }


    // check if user has enough points to purchase
    let canPurchase = 
    req.session.user.points >= price ? true : false

    switch (itemName) {
        case "hat1":
            itemName = "Hat 1"
            break;
        case "hat2":
            itemName = "Hat 2"
            break;
        case "hat3":
            itemName = "Hat 3"
            break;
        case "bg1":
            itemName = "Background 1"
            break;
        case "bg2":
            itemName = "Background 2"
            break;
        case "bg3":
            itemName = "Background 3"
            break;
        default:
            break;
    }

    res.render('purchase', {itemName, price, owned, canPurchase,  userPoints: req.session.user.points})
})

router.route('/purchaseItem').post(async (req, res) => {
    console.log(req.body)
    // console.log(req.session)
    const itemName = req.body.item
    const price = parseInt(req.body.price)
    console.log(itemName, price)

    let itemNo
    if(itemName.includes('1'))
        itemNo = 1
    if(itemName.includes('2'))
        itemNo = 2
    if(itemName.includes('3'))
        itemNo = 3

    let status = await userData.addPoints(req.session.user.id, req.session.user.username, -price)
    status = await userData.giveItemToUser(req.session.user.id, itemNo, itemName.includes('Hat'))
    console.log(status)
    req.session.user.points = status.points
    req.session.user.hatsUnlocked = status.hatsUnlocked
    req.session.user.backgroundsUnlocked = status.backgroundsUnlocked
    res.end()
})

router.route('/equipItem').post(async (req, res) => {
    console.log(req.body)
    const itemName = req.body.item
    
    let itemNo
    if(itemName.includes('1'))
        itemNo = 1
    if(itemName.includes('2'))
        itemNo = 2
    if(itemName.includes('3'))
        itemNo = 3

    if(itemName.includes('Hat')){
        req.session.hat = itemNo
        await petData.updateHat(req.session.user.id, itemNo)
    }
    else{
        req.session.user.background = itemNo
        await userData.updateBackground(req.session.user.id, itemNo)
    }
    console.log(req.session)
    res.end()
})

module.exports = router