const router = require('express').Router()

const userData = require('../data/').users
const petData = require('../data/').pets

const {validateName, validateEmail, validateUsername, validatePassword, setUserSession} = require('../helpers')
const xss = require('xss');

// GET request to '/'
router.route('/').get((req, res) => {
    if(xss(req.session.user)){
        return res.redirect('/home')
    }
    else{
        return res.render('landing', {title: 'Dev-agotchi', style: "/public/css/landing.css"})
    }
})

// GET request to 'login'
router.route('/login').get(async (req, res) => {
    if (xss(req.session.user)){
        return res.redirect('/home')
    } else {
        return res.render('login', {title: 'Login', style: "/public/css/login.css"})
    }
})

// POST request to 'login'
router.route('/login').post(async (req, res) => {
    let username = xss(req.body.usernameInput)
    let password = xss(req.body.passwordInput)

    // Validation
    const errors = {}
    try {
        username = validateUsername(username)
    } catch (e) {
        errors.username = e
    }
    try {
        password = validatePassword(password)
    } catch (e) {
        errors.password = e
    }
    if (Object.keys(errors).length > 0) {
        return res.status(400).render('login', {title: 'Login', style: "/public/css/login.css", errors: errors, inputs: xss(req.body)})
    }

    // check if user is valid
    let user = {}
    try{
        user = await userData.checkUser(username, password)
    } catch (e) {
        if (e === 'Error: Either the username or password is invalid'){
            return res.status(400).render('login', {title: 'Login', style: "/public/css/login.css", otherError: e, inputs: xss(req.body)})
        } else {
            // Something else happened
            return res.status(500).render('login', {title: 'Login', style: "/public/css/login.css", otherError: 'Internal Server Error', inputs: xss(req.body)})
        }
    }
    
    // create express session if the user exists, and send to home page
    if(user.authenticatedUser){
        req.session.user = setUserSession(user.userInfo)
        //TODO: Add try-catch for get pet attributes. 
        req.session.pet = await petData.getPetAttributes(user.userInfo._id)
        if(!req.session.pet){// if the pet cannot be found it was removed from database because it has died
            return res.redirect('/home/petDeath')
        } 
        return res.redirect('/home')
    }
    
    // checkUser did not return, but did not throw. Not expected to trigger
    return res.status(500).render('login', {title: 'Login', style: "/public/css/login.css", otherError: 'Internal Server Error', inputs: req.body})
})


// GET request to 'register'
router.route('/register').get(async (req, res) => {
    if (xss(req.session.user)){
        return res.redirect('/home')
    } else {
        return res.render('register', {title: 'Register an Account', style: 'public/css/login.css'})
    }
})

// POST request to 'register'
router.route('/register').post(async (req, res) => {
    // check if the password is valid
    let firstName = xss(req.body.firstNameInput)
    let lastName = xss(req.body.lastNameInput)
    let email = xss(req.body.emailInput)
    let username = xss(req.body.usernameInput)
    let password = xss(req.body.passwordInput)

    // Validation
    const errors = {}
    try {
        firstName = validateName(firstName, 'First')
    } catch (e) {
        errors.firstName = e
    }
    try {
        lastName = validateName(lastName, 'Last')
    } catch (e) {
        errors.lastName = e
    }
    try {
        email = validateEmail(email)
    } catch (e) {
        errors.email = e
    }
    try {
        username = validateUsername(username)
    } catch (e) {
        errors.username = e
    }
    try {
        password = validatePassword(password)
    } catch (e) {
        errors.password = e
    }
    if (Object.keys(errors).length > 0) {
        return res.status(400).render('register', {title: 'Register an Account', style: "/public/css/login.css", errors: errors, inputs: xss(req.body)})
    }

    let user = {}
    try{
        user = await userData.createUser(firstName, lastName, email, username, password)
    } catch (e) {
        if (e === 'Error: The provided username or email is already in use.'){
            return res.status(400).render('register', {title: 'Register an Account', style: "/public/css/login.css", otherError: e, inputs: xss(req.body)})
        } else {
            // Something else happened
            return res.status(500).render('register', {title: 'Register an Account', style: "/public/css/login.css", otherError: 'Internal Server Error', inputs: xss(req.body)})
        }
    }

    // create express session if the user is created, and send to pet creation
    if(user.insertedUser){
        req.session.user = setUserSession(user.userInfo)
        return res.render('create', {title: 'Create a Pet', style:'/public/css/create.css'})
    }
    
    // createUser did not return, but did not throw. Not expected to trigger
    return res.status(500).render('register', {title: 'Register an Account', style: "/public/css/login.css", otherError: 'Internal Server Error', inputs: xss(req.body)})
})

// GET request to 'logout'
router.route('/logout').get((req, res) => {
    if (xss(req.session.user)){
        req.session.destroy();
        return res.render('logout', {title: 'Logout', style: "/public/css/landing.css"})
    } else {
        return res.redirect('/login')
    }
})

// POST request to 'addUserPoints', called in ajax request when the user earns or spends points
router.route('/addUserPoints').post(async (req, res) => {
    const user = await userData.addPoints(req.session.user.id, req.session.user.username, parseInt(req.body.points))
    req.session.user.points = user.points
    return res.end()
})

// POST request to 'updateUserBackground', called in ajax request when the user changes their background
router.route('/updateUserBackground').post(async (req, res) => {
    const user = await userData.updateBackground(req.session.user.id, req.body.background)
    req.session.user.background = user.background
    res.end();
})


module.exports = router;