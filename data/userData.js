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

    return {insertedUser: true, userInfo: await userCollection.findOne({_id: status.insertedId})}
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
        return {
            authenticatedUser: true, 
            userInfo: await userCollection.findOne({_id: user._id})
        }
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

    //can change what we return
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
    
    const userCollection = await users()
  
    const user = await userCollection.findOne({username})
  
    if(!user){throw 'Error: User not found'}

    const update = {
        firstName: firstName,
        lastName: lastName,
        email: email,
        username: username,
        password:  password
    }

    const updateInfo = await userCollection.updateOne({ _id: ObjectId(userId) },{ $set: update });
    if (!updateInfo.modifiedCount && !updateInfo.matchedCount) {throw 'Error: Could not update point info.'}

    return await userCollection.findOne({username});
    
    //can change what we return

}

// updates either the backgroundsUnlocked array or the hatsUnlocked array of the user depending on hat === true
// itemNo should be the number of the item to add to the array (eg. Background 3 -> itemNo = 3, Hat 1 -> itemNo = 1)
const giveItemToUser = async (
    userId, itemNo, hat
)  =>  {
    const userCollection = await users()

    let status
    if(hat)
        status = await userCollection.updateOne({_id: ObjectId(userId)}, {$push: {hatsUnlocked: itemNo}})
    else
        status = await userCollection.updateOne({_id: ObjectId(userId)}, {$push: {backgroundsUnlocked: itemNo}})

    if(!status.acknowledged)
        throw 'Error: item could not be given to user'


    return await userCollection.findOne({_id: ObjectId(userId)})
}

const updateBackground = async (
    userId, bgNo
) => {
    const userCollection = await users()

    const status = await userCollection.updateOne({_id: ObjectId(userId)}, {$set: {background: bgNo}})

    if(!status.acknowledged)
        throw 'Error: background not updated in database'

    return await userCollection.findOne({_id: ObjectId(userId)})
}



// const createPetSession = async (
//     userId
// ) => {
//     const userCollection = await users()
//     const user = await userCollection.findOne({_id: userId})
//     const petCollection = await pets()
// }

module.exports = {createUser, checkUser, addPoints, updateUserInfo, giveItemToUser, updateBackground};
