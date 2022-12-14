const router = require('express').Router()

const petData = require('../data').pets
const userData = require('../data').users
const hangmanGameDate = require('../data').hangmanGameDate

const gameConstants = require('../gameConstants');

const {validateName, validateDesignNumber, validateHatNumber} = require('../helpers')
const xss = require('xss');

// This middleware checks the authenticated user, and checks the status of the pet
// (and updates the pet cookie accordingly). It also handles death reroutes when necessary. 
// From this middleware, we can assume that req.session.user and req.session.pet exist in most cases. 
router.use(async (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/login');
    } else if (req.url !== '/petDeath' && req.url !== '/createPet'){
        // Need to check if pet has died or not (and update pet session cookie).
        let pet = {};
        try {
            pet = await petData.getPetAttributes(req.session.user.id);
        } catch (e) {
            if (e === 'Error: No pet found with this user ID.') {
                // Pet is dead, set pet cookie back to undefined. 
                req.session.pet = undefined;
                return res.redirect('/home/petDeath');
            } else {
                // Not expected to trigger
                return res.status(500).render('error', {title: 'Internal Error', style: "/public/css/landing.css", error: `Pet-Fetch Error: ${e}`})
            }
        }
        req.session.pet = pet;
    }
    next();
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
    if (req.session.pet.rest + gameConstants.actionRewards.play.rest < 0){
        res.redirect('/home');
    }
    res.render('chooseGame', {title: 'Game Studio', style: '/public/css/chooseGame.css'})
})

// GET request to 'home/clean'
router.route('/clean').get((req, res) => {
    if (req.session.pet.cleanliness === 100){
        res.redirect('/home');
    }
    res.render('clean', {title: 'Clean', style: '/public/css/clean.css'})
})


// POST request to 'home/store'
router.route('/store').get((req, res) => {
    res.render('store', {title: 'Store', style: '/public/css/store.css'})
})

// POST request to 'home/profile'
router.route('/profile').get( async (req, res) => {
    const pet = req.session.pet;

    // presenting date on the screen
    pet.lastFed = new Date(Number(pet.lastFed)).toDateString();
    pet.lastCleaned = new Date(Number(pet.lastCleaned)).toDateString();
    pet.lastPlayed = new Date(Number(pet.lastPlayed)).toDateString();

    // render profile page with all relevant information
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
    try {
        // If user already has a pet, redirect back home
        const pet = await petData.getPetAttributes(req.session.user.id);
        return res.redirect('/home');
    } catch (e) {
        if (e === 'Error: No pet found with this user ID.') {
            // User doesn't have a pet, proceed with pet creation
        } else {
            // Not expected to trigger
            return res.status(500).render('error', {title: 'Internal Error', style: "/public/css/landing.css", error: `Pet-Fetch Error: ${e}`})
        }
    }

    // if no design or name is specified throw error
    let design = xss(req.body.design);
    let name = xss(req.body.name);
    if(!design)
        return res.render('create', {title:'Create a pet', style:'/public/css/create.css', designError: 'You need to choose a pet design'});
    try {
        design = validateDesignNumber(parseInt(design));
    } catch (e) {
        return res.render('create', {title:'Create a pet', style:'/public/css/create.css', designError: e});
    }
    if(!name)
        return res.render('create', {title:'Create a pet', style:'/public/css/create.css', nameError: 'You need to choose a pet name'})
    try {
        name = validateName(name, 'Pet');
    } catch (e) {
        return res.render('create', {title:'Create a pet', style:'/public/css/create.css', nameError: e})
    }
    
    const petId = await petData.createPet(req.session.user.id, {name: name, design: design})
    const status = await petData.givePetToUser(req.session.user.id, petId)
    res.redirect('/home')
})

router.route('/createPet').get(async (req, res) => {
    try {
        // If user already has a pet, redirect back home
        const pet = await petData.getPetAttributes(req.session.user.id);
        return res.redirect('/home');
    } catch (e) {
        if (e === 'Error: No pet found with this user ID.') {
            // User doesn't have a pet, proceed with pet creation
        } else {
            // Not expected to trigger
            return res.status(500).render('error', {title: 'Internal Error', style: "/public/css/landing.css", error: `Pet-Fetch Error: ${e}`})
        }
    }
    return res.render('create', {title: 'Create a Pet', style:'/public/css/create.css'})
})

// GET request to 'home/play/simon'
router.route('/play/simon').get((req, res) => {
    return res.render('simon', {title: 'Simon', style: '/public/css/simon.css'})
})

// GET request to 'home/play/hangman'
router.route('/play/hangman').get((req, res) => {
    const word_list = [...hangmanGameDate.words.keys()];
    let word = word_list[Math.floor(Math.random() * word_list.length)];

    res.render('hangman', {
        title: "Hangman", 
        style:"/public/css/hangman.css", 
        alphabets: hangmanGameDate.alphabets,
        lives: hangmanGameDate.lives,
        hintword: word
    })
})

// GET request to game studio
router.route('/choose').get((req, res) => {
    res.render('choosegame', {title: 'Game Studio', style: '/public/css/chooseGame.css'});
})

// GET request to get hint
router.route('/gethint').get((req, res) => {
    let select_word  = req.query.answertext;
    let allwords = hangmanGameDate.words;
    let hint =  allwords.get(select_word);
    res.send(hint).status(200);
})

// GET request to 'home/getPetInfo', called in an ajax request in home page
router.route('/getPetInfo').get(async (req, res) => {
    // calculate the total health of the pet
    // Note: Health is a visual average measure with no bearing on pet life (unlike food, cleanliness, or happiness)
    // Thus, calculating it for just this pet for frontend purposes should be sufficient
    await petData.calculateHealth(req.session.user.id);

    // send information back to home page to be displayed
    res.send({
        pet: req.session.pet,
        background: req.session.user.background,
        hatsUnlocked: req.session.user.hatsUnlocked,
        backgroundsUnlocked: req.session.user.backgroundsUnlocked
    })
})

// GET request to 'home/petDeath'
router.route('/petDeath').get(async (req, res) => {
    try {
        // Check if user's pet is still alive. If so, redirect back home. 
        const pet = await petData.getPetAttributes(req.session.user.id);
        return res.redirect('/home');
    } catch (e) {
        if (e === 'Error: No pet found with this user ID.') {
            // Pet is confirmed dead
            try {
                await petData.removePetFromUser(req.session.user.id);
                return res.render('death', {title: 'Your Pet Has Died', style: '/public/css/death.css'});
            } catch (e){
                // Not expected to trigger
                return res.status(500).render('error', {title: 'Internal Error', style: "/public/css/landing.css", error: `${e}`})
            }
        } else {
            // Not expected to trigger
            return res.status(500).render('error', {title: 'Internal Error', style: "/public/css/landing.css", error: `Pet-Fetch Error: ${e}`})
        }
    }
})

router.route('/updatePetFood').post(async (req, res) => {
    let pet
    try {
        pet = await petData.getPetAttributes(req.session.user.id);
    } catch (e) {
        return res.status(500).render('error', {title: 'Internal Error', style: "/public/css/landing.css", error: e})
    }
    try {
        const fedStatus = await petData.petAction(pet._id, 'feed');
    } catch (e) {
        if (e !== 'Error: Cannot feed pet; pet food is already at 100.'){
            return res.status(500).render('error', {title: 'Internal Error', style: "/public/css/landing.css", error: e})
        }
        // Otherwise, this error can be gracefully ignored. (DB is not updated)
    }
    res.end();
})


// POST request to 'home/updatePetCleanliness', called in an ajax request in home page when the pet is cleaned
router.route('/updatePetCleanliness').post(async (req, res) => {
    let pet
    try {
        pet = await petData.getPetAttributes(req.session.user.id);
    } catch (e) {
        return res.status(500).render('error', {title: 'Internal Error', style: "/public/css/landing.css", error: e})
    }
    try {
        const cleanStatus = await petData.petAction(pet._id, 'clean');
    } catch (e){
        if (e !== 'Error: Cannot clean pet; pet cleanliness is already at 100.' 
            || e !== 'Error: Not enough rest to do action clean.'){
            return res.status(500).render('error', {title: 'Internal Error', style: "/public/css/landing.css", error: e})
        }
        // Otherwise, this error can be gracefully ignored. (DB is not updated)
    }
    res.end();
});

// POST request to 'home/updatePetHappiness', called in an ajax request in home page when the pet is played with
router.route('/updatePetHappiness').post(async (req, res) => {
    let pet
    try {
        pet = await petData.getPetAttributes(req.session.user.id);
    } catch (e) {
        return res.status(500).render('error', {title: 'Internal Error', style: "/public/css/landing.css", error: e})
    }
    try {
        const playStatus = await petData.petAction(pet._id, 'play');
    } catch (e) {
        if (e !== 'Error: Not enough rest to do action play.'){
            return res.status(500).render('error', {title: 'Internal Error', style: "/public/css/landing.css", error: e})
        }
        // Otherwise, this error can be gracefully ignored. (DB is not updated)
    }
    res.end();
});

// POST request to 'home/updatePetHat', called in an ajax request in home page when the hat is changed
router.route('/updatePetHat').post(async (req, res) => {
    if (!req.body.hat) {
        // Not expected to trigger
        return res.status(500).render('error', {title: 'Internal Error', style: "/public/css/landing.css", error: 'No hat specified to switch to.'})
    }
    let hat = parseInt(xss(req.body.hat));
    try {
        hat = validateHatNumber(hat);
    } catch (e) {
        // Not expected to trigger
        return res.status(500).render('error', {title: 'Internal Error', style: "/public/css/landing.css", error: e})
    }
    let pet;
    try {
        pet = await petData.updateHat(req.session.user.id, hat)
    } catch (e) {
        // No errors are expected here.
        return res.status(500).render('error', {title: 'Internal Error', style: "/public/css/landing.css", error: e})
    }
    req.session.pet = pet
    res.end();
});

// POST request to 'home/store/:id'
router.route('/store/:id').post((req, res) => {
    // set the attributes of the store item that was chosen
    let title, price, imageSrc
    switch (xss(req.params.id)) {
        case "hat1":
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
    res.render('storeItem', {title, price, points: req.session.user.points, imageSrc, alt: title, name: xss(req.params.id), style: '/public/css/storeItems.css'})
})

// POST request to 'home/buyItem' 
router.route('/buyItem').post((req, res) => {

    let itemName = xss(Object.keys(req.body)[0])
    let price = xss(Object.values(req.body)[0])

    // find the number of the item
    let itemNo
    if(itemName.includes('1'))
        itemNo = 1
    if(itemName.includes('2'))
        itemNo = 2
    if(itemName.includes('3'))
        itemNo = 3

    // check if user already owns the item
    const hat = itemName.includes('hat')
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

    // set the attributes to display
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

    // render the purchase page
    res.render('purchase', {itemName, price, owned, canPurchase,  userPoints: req.session.user.points, style: '/public/css/storeItems.css'})
})

// POST request to 'home/purchaseItem'
router.route('/purchaseItem').post(async (req, res) => {
    // get item name and price from request
    //TODO: Add additional validation for name (string) and price (number)
    const itemName = xss(req.body.item)
    const price = parseInt(xss(req.body.price))

    // find the number of the item
    let itemNo
    if(itemName.includes('1'))
        itemNo = 1
    if(itemName.includes('2'))
        itemNo = 2
    if(itemName.includes('3'))
        itemNo = 3

    // subtract the points the item cost from the points the user has
    let status = await userData.addPoints(req.session.user.id, -price)
    status = await userData.giveItemToUser(req.session.user.id, itemNo, itemName.includes('Hat'))

    // update the user session cookie
    req.session.user.points = status.points
    req.session.user.hatsUnlocked = status.hatsUnlocked
    req.session.user.backgroundsUnlocked = status.backgroundsUnlocked
    res.end()
})

// POST request to 'home/equipItem'
router.route('/equipItem').post(async (req, res) => {
    // get item name from request
    const itemName = xss(req.body.item)
    
    // find the number of the item
    let itemNo
    if(itemName.includes('1'))
        itemNo = 1
    if(itemName.includes('2'))
        itemNo = 2
    if(itemName.includes('3'))
        itemNo = 3

    // check if the item is a hat
    if(itemName.includes('Hat')){
        req.session.pet.hat = itemNo
        await petData.updateHat(req.session.user.id, itemNo)
    }
    // if not it is a background
    else{
        req.session.user.background = itemNo // update user session cookie
        await userData.updateBackground(req.session.user.id, itemNo) // update user in the database
    }

    res.end()
})

module.exports = router