const users = require('../config/mongoCollections').users
const bcrypt = require('bcrypt')
const {ObjectId} = require('mongodb');
const validateUsernamePassword = require('../helpers').validateUsernamePassword

const createUser = async (
    username, password
) => { 
    await validateUsernamePassword(username, password) 

    username = username.trim().toLowerCase()
    password = await bcrypt.hash(password.trim(),  10)

    const userCollection = await users()

    const attemptFind = await userCollection.findOne({username})
    if(attemptFind)
        throw 'Error: Duplicate usernames not allowed'

    let userId = ObjectId()
    const status = await userCollection.insertOne({_id: userId, username, password, points: 0, background: 0, hatsUnlocked: [0], backgroundsUnlocked: [0]})

    // todo: give petId attribute to user collection
    console.log(status)
    if (!status.acknowledged || !status.insertedId)
        throw 'Error: Could not add user to database'

    return {insertedUser: true}
};

const checkUser = async (username, password) => {
    await validateUsernamePassword(username, password) 
    username = username.trim().toLowerCase()
    password = password.trim()

    const userCollection = await users()
  
    const user = await userCollection.findOne({username})
  
    if(!user)
        throw 'Error: Either the username or password is invalid'
  
    const match = await bcrypt.compare(password, user.password)
    if(match)
        return {authenticatedUser: true, userId: user._id}
    else
        throw 'Error: Either the username or password is invalid'
};

module.exports = {createUser, checkUser};
