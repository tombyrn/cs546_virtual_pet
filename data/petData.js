const { ObjectId } = require('mongodb');

// petData functions
const pets = require('../config/mongoCollections').pets
const users = require('../config/mongoCollections').users

const userData = require('./userData');

const {validateIdString, validateName, validateDesignNumber} = require('../helpers');
const {decaySettings, actionRewards} = require('../gameConstants');

// petProps should be an object of {name: string,  design: number}
const createPet = async (
    userId, petProps
) => {
    userId = validateIdString(userId);
    if (!petProps || typeof petProps != 'object'){
        throw 'Error: Pet properties must be an object with name and design properties.'
    }
    petProps.name = validateName(petProps.name, 'Pet');
    petProps.design = validateDesignNumber(petProps.design);

    const user = await userData.getUserById(userId);
    if (user.petId){
        //TODO: Subject to change, depending on how death is handled.
        throw 'Error: User already has a pet.'
    }

    const petCollection = await pets();

    // creates new pet in the database
    const dateCreated = Date.now();
    let status = await petCollection.insertOne({
        userId: ObjectId(userId),
        name: petProps.name, 
        design: petProps.design, 
        hat: 0, 
        alive: true,
        health: 100,
        food: 100,
        cleanliness: 100,
        happiness: 100,
        rest: 100,
        lastUpdated: dateCreated,
        lastFed: dateCreated,
        lastCleaned: dateCreated,
        lastPlayed: dateCreated,
        foodHitZero: 0,
        cleanHitZero: 0,
        happyHitZero: 0
     })

    // fails if error creating pet
    if (!status.acknowledged || !status.insertedId)
        throw 'Error: Could not add pet to database'

    // returns object of {petId: string (object id)}
    return status.insertedId.toString();

}

// takes a user id and a pet id and adds the pet id to the users petId field in the database
const givePetToUser = async (
    userId, petId
) => {
    userId = validateIdString(userId);
    petId = validateIdString(petId);

    // Verify that user and pet exist (can be found in database).
    const user = await userData.getUserById(userId);
    const pet = await getPetById(petId);

    // updates the user's petId to the ObjectId of the newly created pet
    const userCollection = await users();
    const status = await userCollection.updateOne({_id: ObjectId(userId)}, {$set: {"petId": ObjectId(petId)}})

    // fails if error adding petId to user
    if (!status.acknowledged || !status.modifiedCount)
        throw 'Error: Could not add pet to database'

    return status
}

const getPetById = async (
    petId
) => {
    petId = validateIdString(petId);
    const petCollection = await pets();
    const pet = await petCollection.findOne({_id: ObjectId(petId)});
    if (!pet) {
        throw 'Error: No pet found with this ID.';
    }
    pet._id = pet._id.toString();
    return pet;
}

//TODO: Likely want to rename this. getPetByUserId sounds good. 
const getPetAttributes = async (
    userId
) => {
    userId = validateIdString(userId);
    const petCollection = await pets()

    // const projection = {
    //     _id: 1,
    //     userId: 1,
    //     name: 1,
    //     design: 1,
    //     hat: 1,
    //     alive: 1,
    //     food: 1,
    //     cleanliness: 1,
    //     happiness: 1,
    //     rest: 1
    // }
    const pet = await petCollection.findOne({userId: ObjectId(userId)})
    if (!pet) {
        throw 'Error: No pet found with this user ID.';
    }
    pet._id = pet._id.toString();
    return pet;
}

const petAction = async (
    petId, action
) => {
    // Input validation
    petId = validateIdString(petId);
    if (typeof action !== 'string'){
        throw 'Error: Action input must be a string.';
    }
    action = action.trim().toLowerCase();
    if (action !== 'feed' && action !== 'clean' && action !== 'play'){
        throw 'Error: Action input must be feed, clean, or play.'
    }

    // Get pet and the rewards for this action. 
    const pet = await getPetById(petId);
    const baseRewards = actionRewards[action];

    // Check rest requirements, and check if food/cleanliness are already maxed 
    // out for feed/clean. 
    if (pet.rest + baseRewards.rest < 0){
        throw `Error: Not enough rest to do action ${action}.`
    }
    if (action === 'feed' && pet.food === 100){
        throw 'Error: Cannot feed pet; pet food is already at 100.';
    }
    if (action === 'clean' && pet.cleanliness === 100){
        throw 'Error: Cannot clean pet; pet cleanliness is already at 100.';
    }

    // Assemble the pet update content. 
    const now = Date.now();
    const updates = {
        lastUpdated: now
    };
    if (action === 'feed'){
        updates.lastFed = now;
    } else if (action === 'clean'){
        updates.lastCleaned = now;
    } else if (action === 'play'){
        updates.lastPlayed = now;
    }
    for (let property in baseRewards){
        updates[property] = Math.max(0, Math.min(100, pet[property] + baseRewards[property]));
    }

    // Update the pet. 
    const petCollection = await pets();
    const status = await petCollection.updateOne({_id: ObjectId(petId)}, {$set: updates});
    if (!status.matchedCount) {
        throw `Error: Could not ${action} pet.`
    };

    // Check for properties that have become, or are no longer, zero.
    // (Update HitZero accordingly.)
    checkOneNewZeroes(petId);
    checkOneNotZeroes(petId);

    return status;
}

//TODO: This method scares me. Looks like it would be really easy to access and mess with 
// random stuff with this...and validation seems really spooky here too. I think it's 
// better to create more specialty methods depending on what we want to do. (And/or we can 
// make a "full update" method, I think.)
//TODO: Add validation here (if keeping this method).
// Updates a single field in the MongoDB entry of the pet
// field - database field you want to update
// value - value you want to set the field to
// isInt - wether or not the value passed in should be stored as an number
const updatePetAttribute = async (
    userId, field, value, isInt=false
) => {
    const petCollection = await pets()
    if(isInt)
        value = parseInt(value)
    obj = {}
    obj[field] = value
    const status = await petCollection.updateOne({userId: ObjectId(userId)}, {$set: obj})
    await calculateHealth(userId)
    return await petCollection.findOne({userId: ObjectId(userId)})
}

const petCollectionDecay = async (
) => {
    // Calculate decay values per property
    const foodDecay = -(decaySettings.decayInterval / (decaySettings.foodLifetime * 24 * 60)) * 100;
    const cleanDecay = -(decaySettings.decayInterval / (decaySettings.cleanLifetime * 24 * 60)) * 100;
    const happyDecay = -(decaySettings.decayInterval / (decaySettings.happyLifetime * 24 * 60)) * 100;
    const restGrowth = (decaySettings.decayInterval / (decaySettings.restLifetime * 24 * 60)) * 100;
    
    // Decay all properties
    const petCollection = await pets();
    let status = await petCollection.updateMany({}, {$inc: {
        food: foodDecay, 
        cleanliness: cleanDecay,
        happiness: happyDecay,
        rest: restGrowth
    }})
    if (!status.acknowledged) throw 'Error: Could not decay pets.'

    // Scan all pets to bring them back within min and max
    status = await petCollection.updateMany({food: {$lt: 0}}, {$set: {food: 0}})
    if (!status.acknowledged) throw 'Error: Could not fix min food.'
    status = await petCollection.updateMany({food: {$gt: 100}}, {$set: {food: 100}})
    if (!status.acknowledged) throw 'Error: Could not fix max food.'
    status = await petCollection.updateMany({cleanliness: {$lt: 0}}, {$set: {cleanliness: 0}})
    if (!status.acknowledged) throw 'Error: Could not fix min cleanliness.'
    status = await petCollection.updateMany({cleanliness: {$gt: 100}}, {$set: {cleanliness: 100}})
    if (!status.acknowledged) throw 'Error: Could not fix max cleanliness.'
    status = await petCollection.updateMany({happiness: {$lt: 0}}, {$set: {happiness: 0}})
    if (!status.acknowledged) throw 'Error: Could not fix min happiness.'
    status = await petCollection.updateMany({happiness: {$gt: 100}}, {$set: {happiness: 100}})
    if (!status.acknowledged) throw 'Error: Could not fix max happiness.'
    status = await petCollection.updateMany({rest: {$lt: 0}}, {$set: {rest: 0}})
    if (!status.acknowledged) throw 'Error: Could not fix min rest.'
    status = await petCollection.updateMany({rest: {$gt: 100}}, {$set: {rest: 100}})
    if (!status.acknowledged) throw 'Error: Could not fix max rest.'

    // Set all pets as updated now.
    status = await petCollection.updateMany({}, {$set: {
        lastUpdated: Date.now()
    }})
    if (!status.acknowledged) throw 'Error: Could not update pet updated timestamps.'

    // Update HitZero for properties that have hit zero as a result of decay. 
    await checkAllNewZeroes();

    // Check for deaths (properties spent too long at zero)
    const foodLimit = decaySettings.foodGrace * 24 * 60 * 60 * 1000;
    const cleanLimit = decaySettings.cleanGrace * 24 * 60 * 60 * 1000;
    const happyLimit = decaySettings.happyGrace * 24 * 60 * 60 * 1000;
    const deathStatus = await petCollection.updateMany({$or:[
        {$and: [
            // Checking 0 is actually unnecessary here, but included for safety/consistency
            {food: {$eq: 0}},
            {foodHitZero: {$lt: Date.now() - foodLimit}}
        ]},
        {$and: [
            {clean: {$eq: 0}},
            {cleanHitZero: {$lt: Date.now() - cleanLimit}}
        ]},
        {$and: [
            {happiness: {$eq: 0}},
            {happyHitZero: {$lt: Date.now() - happyLimit}}
        ]}
    ]}, {$set: {
        alive: false
    }});
    if (!deathStatus.acknowledged){
        throw 'Error: Could not update pet death status.'
    }

    //TODO: Further processing after marking pets dead?

    // const status1 = await petCollection.updateMany({alive: true}, {$inc: {food: -1, cleanliness: -1, happiness: -1, rest: 1}}); // decreases food, cleanliness, happiness level of all pets, increases rest(todo: only increase rest when user is away)
    // const status2 = await petCollection.updateMany({$or: [{food: {$lte: 0}}, {cleanliness: {$lte: 0}}, {happiness: {$lte: 0}}, {rest: {$lte: 0}}]}, {$set: {alive: false}}); // if any of the metrics decrease below 0, set alive boolean to false
    // const status3 = await petCollection.deleteMany({alive: false}); // delete any pet who has died

    return true;
}

// Check for newly-zeroed properties on one pet and mark them with HitZero.
const checkOneNewZeroes = async (    
    petId
) => {
    petId = validateIdString(petId)
    const pet = await getPetById(petId);
    const update = {
        foodHitZero: pet.foodHitZero,
        cleanHitZero: pet.cleanHitZero,
        happyHitZero: pet.happyHitZero
    }
    if (pet.food === 0 && pet.foodHitZero === 0){
        update.foodHitZero = Date.now();
    }
    if (pet.cleanliness === 0 && pet.cleanHitZero === 0){
        update.cleanHitZero = Date.now();
    }
    if (pet.happiness === 0 && pet.happyHitZero === 0){
        update.happyHitZero = Date.now();
    }
    const petCollection = await pets();
    const status = await petCollection.updateOne({_id: ObjectId(petId)}, {$set: update});
    if (!status.matchedCount) {
        throw 'Error: Could not check zeroes on pet.'
    };
    return status;
}

// Check for newly-zeroed properties on all pets and mark them with HitZero.
const checkAllNewZeroes = async (    
) => {
    const petCollection = await pets();
    const zeroFoodCheck = await petCollection.updateMany({$and:[ 
        {food: {$eq: 0}},
        {foodHitZero: {$eq: 0}}
    ]}, {$set: {
        foodHitZero: Date.now()
    }});
    if (!zeroFoodCheck.acknowledged){
        throw 'Error: Could not update pet food zeroes.';
    }
    const zeroCleanCheck = await petCollection.updateMany({$and:[
        {cleanliness: {$eq: 0}},
        {cleanHitZero: {$eq: 0}}
    ]}, {$set: {
        cleanHitZero: Date.now()
    }});
    if (!zeroCleanCheck.acknowledged){
        throw 'Error: Could not update pet cleanliness zeroes.';
    }
    const zeroHappyCheck = await petCollection.updateMany({$and:[ 
        {happiness: {$eq: 0}},
        {happyHitZero: {$eq: 0}}
    ]}, {$set: {
        happyHitZero: Date.now()
    }});
    if (!zeroHappyCheck.acknowledged){
        throw 'Error: Could not update pet happiness zeroes.';
    }
    return true;
}

// Check for properties on one pet that are *no longer* at zero after an action
// Update HitZero accordingly
const checkOneNotZeroes = async (    
    petId
) => {
    petId = validateIdString(petId)
    const pet = await getPetById(petId);
    const update = {
        foodHitZero: pet.foodHitZero,
        cleanHitZero: pet.cleanHitZero,
        happyHitZero: pet.happyHitZero
    }
    if (pet.food !== 0 && pet.foodHitZero !== 0){
        update.foodHitZero = 0;
    }
    if (pet.cleanliness !== 0 && pet.cleanHitZero !== 0){
        update.cleanHitZero = 0;
    }
    if (pet.happiness !== 0 && pet.happyHitZero !== 0){
        update.happyHitZero = 0;
    }
    const petCollection = await pets();
    const status = await petCollection.updateOne({_id: ObjectId(petId)}, {$set: update});
    if (!status.matchedCount) {
        throw 'Error: Could not check zeroes on pet.'
    };
    return status;
}

// Check for properties on all pets that are *no longer* at zero after an action
// Update HitZero accordingly
const checkAllNotZeroes = async (
) => {
    const petCollection = await pets();
    const nonzeroFoodCheck = await petCollection.updateMany({$and:[ 
        {food: {$ne: 0}},
        {foodHitZero: {$ne: 0}}
    ]}, {$set: {
        foodHitZero: 0
    }});
    if (!nonzeroFoodCheck.acknowledged){
        throw 'Error: Could not update pet food zeroes.';
    }
    const nonzeroCleanCheck = await petCollection.updateMany({$and:[
        {cleanliness: {$ne: 0}},
        {cleanHitZero: {$ne: 0}}
    ]}, {$set: {
        cleanHitZero: 0
    }});
    if (!nonzeroCleanCheck.acknowledged){
        throw 'Error: Could not update pet cleanliness zeroes.';
    }
    const nonzeroHappyCheck = await petCollection.updateMany({$and:[ 
        {happiness: {$ne: 0}},
        {happyHitZero: {$ne: 0}}
    ]}, {$set: {
        happyHitZero: 0
    }});
    if (!nonzeroHappyCheck.acknowledged){
        throw 'Error: Could not update pet happiness zeroes.';
    }
    return true;
}

const updateHat = async (
    userId, hatNo
) => {
    const petCollection = await pets()

    const status = await petCollection.updateOne({userId: ObjectId(userId)}, {$set: {hat: hatNo}})

    if(!status.acknowledged)
        throw 'Error: background not updated in database'

    return await petCollection.findOne({userId: ObjectId(userId)})
}

const calculateHealth = async (
    userId
) => {
    userId = validateIdString(userId);

    const pet = await getPetAttributes(userId);

    let health
    if(pet)
        health =  Math.floor((pet.cleanliness + pet.happiness + pet.food + pet.rest) / 4)

    const petCollection = await pets()
    const status = await petCollection.updateOne({userId: ObjectId(userId)}, {$set: {health}})
    if(!status.acknowledged)
        throw 'Error: health not updated in database'

    return await petCollection.findOne({userId: ObjectId(userId)})
}

module.exports = {
    createPet, 
    givePetToUser, 
    getPetById,
    getPetAttributes, 
    petAction, 
    updatePetAttribute, 
    petCollectionDecay, 
    updateHat,
    calculateHealth
}
