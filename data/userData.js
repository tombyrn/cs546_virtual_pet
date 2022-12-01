const users = require('../config/mongoCollections').users
const pets = require('../config/mongoCollections').pets
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
const checkUser = async (
    username, password
) => {
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
    const match = await bcrypt.compare(password, user.hashedPassword)
    if(match)
        return {authenticatedUser: true, userId: user._id}
    else
        throw 'Error: Either the username or password is invalid'
};

const addPoints = async(
    userId, username, points
) => {
    if(typeof userId !== 'string' || userId.trim().length === 0){throw "Error: Must provide a valid id"}
    userId = userId.trim();
    if(!ObjectId.isValid(userId)){throw "Error: Invalid object id"}

    username = validateUsername(username);

    if(!points){throw "Error: Points must be provided."}
    if(typeof points != "number" || !Number.isInteger(points)){throw "Error: Points must be an int number"}

    const userCollection = await users()
  
    const user = await userCollection.findOne({username})
  
    if(!user){throw 'Error: User not found'}

    points = user.points + points;

    const update = {
        points: points
    }

    const updateInfo = await userCollection.updateOne({ _id: ObjectId(userId) },{ $set: update });
    if (!updateInfo.modifiedCount && !updateInfo.matchedCount) {throw 'Error: Could not update point info.'}

    return await userCollection.findOne({username});
}

const updateUserInfo = async(
    userId, firstName, lastName, email, username, password
) => {
    if(typeof userId !== 'string' || userId.trim().length === 0){throw "Error: Must provide a valid id"}
    userId = userId.trim();
    if(!ObjectId.isValid(userId)){throw "Error: Invalid object id"}

    firstName = validateName(firstName, 'First')
    lastName = validateName(lastName, 'Last')
    email = validateEmail(email)
    username = validateUsername(username)
    password = validatePassword(password)
    
    if(!points){throw "Error: Points must be provided."}
    if(typeof points != "number" || !Number.isInteger(points)){throw "Error: Points must be an int number"}

    // need to finished

    

}


// const createPetSession = async (
//     userId
// ) => {
//     const userCollection = await users()
//     const user = await userCollection.findOne({_id: userId})
//     const petCollection = await pets()
// }

module.exports = {createUser, checkUser, addPoints};
