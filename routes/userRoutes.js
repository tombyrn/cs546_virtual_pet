const router = require('express').Router()

const userData = require('../data/').users
const petData = require('../data/').pets
const validateUsernamePassword = require('../helpers').validateUsernamePassword

// GET request to '/'
router.route('/').get((req, res) => {
    if(req.session.user){
        res.redirect('/home')
    }
    else{
        res.redirect('/login')
    }
})

// GET request to 'login'
router.route('/login').get(async (req, res) => {
    res.render('login', {title: 'Login', style: "/public/css/login.css"})
})

// POST request to 'login'
router.route('/login').post(async (req, res) => {
    // check if the password is valid
    let username = req.body.usernameInput.trim().toLowerCase()
    let password = req.body.passwordInput.trim()

    try{
        await validateUsernamePassword(username, password) 
    } catch(e){
        res.status(400).send(`<script>alert("${e}"); window.location.href = "/login"; </script>`);
        return
    }

    // check if user exists and send to home page (main page with pet pen, statuses and buttons)
    try{
        const user = await userData.checkUser(username, password)

        // create express session if the user exists
        if(user.authenticatedUser){
            req.session.user = {username, id: user.userId}
            return res.redirect('/home')
        }
    } catch(e){}
    return res.status(400).send('<script>alert("Invalid Username or Password"); window.location.href = "/login"; </script>');
})


// GET request to 'register'
router.route('/register').get(async (req, res) => {
    res.render('register', {title: 'Register an Account', style: 'public/css/login.css'})
})

// POST request to 'register'
router.route('/register').post(async (req, res) => {
    // check if the password is valid
    let username = req.body.usernameInput.trim().toLowerCase()
    let password = req.body.passwordInput.trim()

    try{
        await validateUsernamePassword(username, password) 
    } catch(e){
        return res.send(`<script>alert("${e}"); window.location.href = "/register"; </script>`);
    }

    // create a user and send to login page
    try{
        const user = await userData.createUser(username, password);

        // create express session if user is successffully created
        if(user.insertedUser){
            req.session.user = {username, id: user.userId}

            // take user to next stage of registration (creating a pet)
            return res.redirect('/register/create')
        }
        else
            return res.status(500).send('<script>alert("Internal Server Error"); window.location.href = "/"; </script>')
    } catch(e){
        return res.status(400).send(`<script>alert("Could not create user"); window.location.href = "/register"; </script>`);
    }
})

// GET request to 'logout'
router.route('/logout').get((req, res) => {
    req.session.destroy();
    res.render('logout', {title: 'Logout'})
})

// GET request to 'register/create' (made when user begins registration after the user enters username and password)
router.route('/register/create').get((req, res) => {
    res.render('create', {title: 'Create'})
})



module.exports = router;