const router = require('express').Router()

const userData = require('../data/').users
const petData = require('../data/').pets

const {validateName, validateEmail, validateUsername, validatePassword, setUserSession} = require('../helpers')

// GET request to '/'
router.route('/').get((req, res) => {
    if(req.session.user){
        return res.redirect('/home')
    }
    else{
        return res.render('landing', {title: 'Dev-agotchi', style: "/public/css/landing.css"})
    }
})

// GET request to 'login'
router.route('/login').get(async (req, res) => {
    if (req.session.user){
        return res.redirect('/home')
    } else {
        return res.render('login', {title: 'Login', style: "/public/css/login.css"})
    }
})

// POST request to 'login'
router.route('/login').post(async (req, res) => {
    let username = req.body.usernameInput
    let password = req.body.passwordInput

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
        return res.status(400).render('login', {title: 'Login', style: "/public/css/login.css", errors: errors, inputs: req.body})
    }

    // check if user is valid
    let user = {}
    try{
        user = await userData.checkUser(username, password)
    } catch (e) {
        if (e === 'Error: Either the username or password is invalid'){
            return res.status(400).render('login', {title: 'Login', style: "/public/css/login.css", otherError: e, inputs: req.body})
        } else {
            // Something else happened
            return res.status(500).render('login', {title: 'Login', style: "/public/css/login.css", otherError: 'Internal Server Error', inputs: req.body})
        }
    }
    
    // create express session if the user exists, and send to home page
    if(user.authenticatedUser){
        req.session.user = setUserSession(user.userInfo)
        req.session.pet = await petData.getPetAttributes(user.userId)
        return res.redirect('/home')
    }
    
    // checkUser did not return, but did not throw. Not expected to trigger
    return res.status(500).render('login', {title: 'Login', style: "/public/css/login.css", otherError: 'Internal Server Error', inputs: req.body})
})


// GET request to 'register'
router.route('/register').get(async (req, res) => {
    if (req.session.user){
        return res.redirect('/home')
    } else {
        return res.render('register', {title: 'Register an Account', style: 'public/css/login.css'})
    }
})

// POST request to 'register'
router.route('/register').post(async (req, res) => {
    // check if the password is valid
    let firstName = req.body.firstNameInput
    let lastName = req.body.lastNameInput
    let email = req.body.emailInput
    let username = req.body.usernameInput
    let password = req.body.passwordInput

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
        return res.status(400).render('register', {title: 'Register an Account', style: "/public/css/login.css", errors: errors, inputs: req.body})
    }

    let user = {}
    try{
        user = await userData.createUser(firstName, lastName, email, username, password)
    } catch (e) {
        if (e === 'Error: The provided username or email is already in use.'){
            return res.status(400).render('register', {title: 'Register an Account', style: "/public/css/login.css", otherError: e, inputs: req.body})
        } else {
            // Something else happened
            return res.status(500).render('register', {title: 'Register an Account', style: "/public/css/login.css", otherError: 'Internal Server Error', inputs: req.body})
        }
    }

    // create express session if the user is created, and send to pet creation
    if(user.insertedUser){
        req.session.user = setUserSession(user.userInfo)
        return res.render('create', {title: 'Create a Pet', style:'/public/css/create.css'})
    }
    
    // createUser did not return, but did not throw. Not expected to trigger
    return res.status(500).render('register', {title: 'Register an Account', style: "/public/css/login.css", otherError: 'Internal Server Error', inputs: req.body})
})

// GET request to 'logout'
router.route('/logout').get((req, res) => {
    if (req.session.user){
        req.session.destroy();
        return res.render('logout', {title: 'Logout'})
    } else {
        return res.redirect('/login')
    }
})

router.route('/addUserPoints').post(async (req, res) => {
    const user = await userData.addPoints(req.session.user.id, req.session.user.username, parseInt(req.body.points))
    req.session.user.points = user.points
    res.end()
})


module.exports = router;