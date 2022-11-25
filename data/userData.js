const users = require('../config/mongoCollections').users
const pets = require('../config/mongoCollections').pets
const bcrypt = require('bcrypt')
const {ObjectId} = require('mongodb');
const validateUsernamePassword = require('../helpers').validateUsernamePassword

// returns object of {insertedUser: boolean, userId: ObjectId}
const createUser = async (
    username, password
) => { 
    // validates username and password
    await validateUsernamePassword(username, password) 
    username = username.trim().toLowerCase()
    password = await bcrypt.hash(password.trim(),  10)

    // create user in database and return if done successfully
    const userCollection = await users()

    const attemptFind = await userCollection.findOne({username})
    if(attemptFind)
        throw 'Error: Duplicate usernames not allowed'

    let userId = ObjectId()
    const status = await userCollection.insertOne({_id: userId, username, password, points: 0, background: 0, hatsUnlocked: [0], backgroundsUnlocked: [0]})

    if (!status.acknowledged || !status.insertedId)
        throw 'Error: Could not add user to database'

    return {insertedUser: true, userId: status.insertedId}
};

// returns object of {authenticatedUser: boolean, userId: ObjectId}
const checkUser = async (
    username, password
) => {
    // validates username and password
    await validateUsernamePassword(username, password) 
    username = username.trim().toLowerCase()
    password = password.trim()

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

const createPetSession = async (
    userId
) => {
    const userCollection = await users()

    const user = await userCollection.findOne({_id: userId})
    

    const petCollection = await pets()


}

module.exports = {createUser, checkUser};
