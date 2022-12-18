const users = require('../config/mongoCollections').users
const bcrypt = require('bcrypt')
const saltRounds = 10
const {ObjectId} = require('mongodb');
const { validateIdString, validateName, validateEmail, validateUsername, validatePassword, 
    validatePoints, validateHatNumber, validateBgNumber } = require('../helpers');

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
        hatsUnlocked: [0],
        backgroundsUnlocked: [0]
    }

    const status = await userCollection.insertOne(newUser)

    if (!status.acknowledged || !status.insertedId)
        throw 'Error: Could not add user to database'

    return {insertedUser: true, userInfo: await userCollection.findOne({_id: status.insertedId})}
};

const getUserById = async (
    id
) => {
    id = validateIdString(id);
    const userCollection = await users();
    const user = await userCollection.findOne({_id: ObjectId(id)});
    if (!user) {
        throw 'Error: No user found with this ID.';
    }
    user._id = user._id.toString();
    return user;
}

const getUserByUsername = async (
    username, 
    notFoundError
) => {
    username = validateUsername(username)
    const userCollection = await users();
    const user = await userCollection.findOne({username: username});
    if (!user) {
        throw notFoundError;
    }
    user._id = user._id.toString();
    return user;
}

// returns object of user authenticated (boolean) and some user props, including id
// and game features (points, background, hatsUnlocked, backgroundsUnlocked)
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

    const userCollection = await users();
    const user = await getUserByUsername(username, 'Error: Either the username or password is invalid');
  
    // make sure the password matches the hashed password in the database
    const match = await bcrypt.compare(password, user.hashedPassword)
    if(match)
        return {
            authenticatedUser: true, 
            userInfo: user
        }
    else
        throw 'Error: Either the username or password is invalid'
};

const addPoints = async(
    userId, points
) => {
    userId = validateIdString(userId);
    points = validatePoints(points);

    const user = await getUserById(userId);

    points = user.points + points;

    const update = {
        points: points
    }

    const userCollection = await users();
    const updateInfo = await userCollection.updateOne({ _id: ObjectId(userId) },{ $set: update });
    if (!updateInfo.modifiedCount && !updateInfo.matchedCount) {throw 'Error: Could not update point info.'}

    return await getUserById(userId);
}

const updateUserInfo = async(
    userId, firstName, lastName, email, username, password
) => {
    userId = validateIdString(userId);
    firstName = validateName(firstName, 'First')
    lastName = validateName(lastName, 'Last')
    email = validateEmail(email)
    username = validateUsername(username)
    password = validatePassword(password)
    
    // Verifies that user exists
    const user = await getUserById(userId);

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
    userId = validateIdString(userId)
    if (typeof hat !== 'boolean'){
        throw 'Error: hat input must be boolean.'
    }
    if (hat){
        itemNo = validateHatNumber(itemNo)
    } else {
        itemNo = validateBgNumber(itemNo)
    }

    const user = await getUserById(userId);
    if (hat){
        if (user.hatsUnlocked.includes(itemNo)){
            throw 'Error: User already has this hat.'
        }
    } else {
        if (user.backgroundsUnlocked.includes(itemNo)){
            throw 'Error: User already has this background.'
        }
    }

    const userCollection = await users()
    let status
    if (hat){
        status = await userCollection.updateOne({_id: ObjectId(userId)}, {$push: {hatsUnlocked: itemNo}})
    } else {
        status = await userCollection.updateOne({_id: ObjectId(userId)}, {$push: {backgroundsUnlocked: itemNo}})
    }

    if(!status.acknowledged)
        throw 'Error: item could not be given to user'

    return await getUserById(userId);
}

const updateBackground = async (
    userId, bgNo
) => {
    userId = validateIdString(userId);
    bgNo = validateBgNumber(bgNo);

    const user = await getUserById(userId);
    if (user.background === bgNo){
        throw 'Error: User background is already set to input background number.'
    }
    if (!user.backgroundsUnlocked.includes(bgNo)){
        throw 'Error: User does not have access to this background.'
    }

    const userCollection = await users()
    const status = await userCollection.updateOne({_id: ObjectId(userId)}, {$set: {background: bgNo}})

    if(!status.acknowledged)
        throw 'Error: Background not updated in database.'

    return await getUserById(userId);
}



// const createPetSession = async (
//     userId
// ) => {
//     const userCollection = await users()
//     const user = await userCollection.findOne({_id: userId})
//     const petCollection = await pets()
// }

module.exports = {
    createUser, 
    checkUser, 
    getUserById, 
    getUserByUsername, 
    addPoints, 
    updateUserInfo, 
    giveItemToUser, 
    updateBackground
};
