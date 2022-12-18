const router = require('express').Router()

const petData = require('../data').pets
const userData = require('../data').users
const hangmanGameDate = require('../data').hangmanGameDate

const {validateName, validateDesignNumber} = require('../helpers')
const xss = require('xss');

router.use('/', (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/login');
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
    res.render('chooseGame', {title: 'Game Studio', style: '/public/css/chooseGame.css'})
})

// GET request to 'home/clean'
router.route('/clean').get((req, res) => {
    res.render('clean', {title: 'Clean', style: '/public/css/clean.css'})
})


// POST request to 'home/store'
router.route('/store').get((req, res) => {
    res.render('store', {title: 'Store', style: '/public/css/store.css'})
})

// POST request to 'home/profile'
router.route('/profile').get( async (req, res) => {
    try{
        const pet = await petData.getPetAttributes(req.session.user.id);
    } catch (e) {
        if (e === 'Error: No pet found with this user ID.'){
            // This user had a pet, but it died. 
            return res.redirect('/home/petDeath')
        } else {
            // Some other error has occurred. 
            return res.status(500).render('error', {title: 'Internal Error', style: "/public/css/landing.css", error: e})
        }
    }
    req.session.pet = pet

    //TODO: Return here after doing death stuff..
    //And actually, get all of this cookie-ry squared away. 
    // throw error if pet doesn't exist
    if(!pet)
        throw 'Error: no pet session cookie (petRoutes.js line45)'

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
    // if no design or name is specified throw error (todo: make more sophisticated error handling)
    let design = xss(req.body.design);
    if(!design)
        return res.render('create', {title:'Create a pet', style:'/public/css/create.css', designError: 'You need to choose a pet design'});
    try {
        design = validateDesignNumber(parseInt(design));
    } catch (e) {
        return res.render('create', {title:'Create a pet', style:'/public/css/create.css', designError: e});
    }
    let name = xss(req.body.name);
    if(!name)
        return res.render('create', {title:'Create a pet', style:'/public/css/create.css', nameError: 'You need to choose a pet name'})
    try {
        name = validateName(name);
    } catch (e) {
        return res.render('create', {title:'Create a pet', style:'/public/css/create.css', nameError: e})
    }
    
    const petId = await petData.createPet(req.session.user.id, {name: name, design: design})

    const status = await petData.givePetToUser(req.session.user.id, petId)
    req.session.pet = await petData.getPetAttributes(req.session.user.id)
    res.redirect('/home')
})

router.route('/createPet').get((req, res) => {
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
    // get pet information from database
    pet = await petData.getPetAttributes(req.session.user.id);
    // calculate the total health of the pet
    // TODO: Health system? Keep or no? 
    pet = await petData.calculateHealth(req.session.user.id);

    // if the pet doesn't exist it has died
    if(pet === null || pet.health === NaN){
        return res.redirect('/home/petDeath') // send the use to death screen
    }

    req.session.pet = pet

    // send information back to home page to be displayed
    res.send({
        pet,
        background: req.session.user.background,
        hatsUnlocked: req.session.user.hatsUnlocked,
        backgroundsUnlocked: req.session.user.backgroundsUnlocked
    })
})

// GET request to 'home/petDeath'
router.route('/petDeath').get(async (req, res) => {
    res.render('death', {title: 'Your Pet Has Died', style: '/public/css/death.css'})
})

router.route('/updatePetFood').post(async (req, res) => {
    const pet = await petData.getPetAttributes(req.session.user.id);

    const fedStatus = await petData.petAction(pet._id, 'feed');

    // await petData.updatePetAttribute(req.session.user.id, "lastFed", req.body.date, true)
    // await petData.updatePetAttribute(req.session.user.id, "food", req.body.foodLevel, true)

    // TODO: Update cookie?
    // req.session.pet.lastFed = parseInt(req.body.date)
    // req.session.pet.food = parseInt(req.body.foodLevel)
    // console.log('finished')
    res.end();
})

// POST request to 'home/updatePetWhenPlayedWith', called in an ajax request when the pet is played with
router.route('/updatePetWhenPlayedWith').post(async (req, res) => {
    // update the lastPlayed field in the database
    req.session.pet = await petData.updatePetAttribute(req.session.user.id, "lastPlayed", req.body.date, true)

    // make sure happiness <= 100 and rest >= 0
    const happiness =  req.session.pet.happiness+20 >= 100 ? 100 : req.session.pet.happiness+20
    const rest = req.session.pet.rest-20 <= 0 ? 0 : req.session.pet.rest-20

    // update the happiness field in the database
    await petData.updatePetAttribute(req.session.user.id, "happiness", happiness, true)
    // update the rest field and the pet session cookie
    req.session.pet = await petData.updatePetAttribute(req.session.user.id, "rest", rest, true)
    res.end();
})


// POST request to 'home/updatePetCleanliness', called in an ajax request in home page when the pet is cleaned
router.route('/updatePetCleanliness').post(async (req, res) => {
    const pet = await petData.getPetAttributes(req.session.user.id);
    const cleanStatus = await petData.petAction(pet._id, 'clean');

    // update the cleanliness field in the database
    // await petData.updatePetAttribute(req.session.user.id, "cleanliness", req.body.cleanLevel, true)
    // req.session.pet = await petData.updatePetAttribute(req.session.user.id, "cleanliness", req.body.cleanLevel, true)
    res.end();
});

// POST request to 'home/updatePetHappiness', called in an ajax request in home page when the pet is played with
router.route('/updatePetHappiness').post(async (req, res) => {
    const pet = await petData.getPetAttributes(req.session.user.id);
    const playStatus = await petData.petAction(pet._id, 'play');

    // update the cleanliness field in the database
    // await petData.updatePetAttribute(req.session.user.id, "cleanliness", req.body.cleanLevel, true)
    // req.session.pet = await petData.updatePetAttribute(req.session.user.id, "cleanliness", req.body.cleanLevel, true)
    res.end();
});

// POST request to 'home/updatePetHat', called in an ajax request in home page when the hat is changed
router.route('/updatePetHat').post(async (req, res) => {
    req.session.pet = await petData.updatePetAttribute(req.session.user.id, "hat", req.body.hat, true)
    res.end()
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

    let itemName = Object.keys(xss(req.body))[0]
    let price = Object.values(xss(req.body))[0]

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
    let status = await userData.addPoints(req.session.user.id, req.session.user.username, -price)
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