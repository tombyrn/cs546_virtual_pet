const users = require('../config/mongoCollections').users
const bcrypt = require('bcrypt')
const saltRounds = 10
const {ObjectId} = require('mongodb');
const { validateName, validateEmail, validateUsername, validatePassword } = require('../helpers');

// returns object of {insertedUser: boolean, userId: ObjectId}
const createUser = async (
    firstName, lastName, email, username, password
) => { 
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
        throw errors
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // create user in database and return if done successfully
    const userCollection = await users()

    const existingUsername = await userCollection.findOne({username: username})
    if(existingUsername)
        throw 'Error: The provided username or email is already in use.'
    const existingEmail = await userCollection.findOne({email: email})
    if (existingEmail)
        throw 'Error: The provided username or email is already in use.'

    const newUser = {
        firstName: firstName,
        lastName: lastName,
        email: email,
        username: username, 
        hashedPassword: hashedPassword,
        petId: null,
        points: 0,
        background: 0,
        hatsUnlocked: [],
        backgroundsUnlocked: []
    }

    const status = await userCollection.insertOne(newUser)

    if (!status.acknowledged || !status.insertedId)
        throw 'Error: Could not add user to database'

    return {insertedUser: true, userId: status.insertedId}
};

// returns object of {authenticatedUser: boolean, userId: ObjectId}
const checkUser = async (username, password) => {
    // validates username and password
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
        throw errors
    }

    // find user in database and return if it exists
    const userCollection = await users()
  
    const user = await userCollection.findOne({username})
  
    if(!user)
        throw 'Error: Either the username or password is invalid'
  
    // make sure the password matches the hashed password in the database
    const match = await bcrypt.compare(password, user.password)
    if(match)
        return {authenticatedUser: true, userId: user._id}
    else
        throw 'Error: Either the username or password is invalid'
};

module.exports = {createUser, checkUser};
