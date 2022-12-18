const { ObjectId } = require('mongodb');

// petData functions
const pets = require('../config/mongoCollections').pets
const users = require('../config/mongoCollections').users

// petProps should be an object of {name: string,  design: number}
const createPet = async (
    userId, petProps
) => {
    const petCollection = await pets();

    // creates new pet in the database
    const dateCreated = Date.now();
    const petId = ObjectId();
    let status = await petCollection.insertOne({
        _id: petId, 
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

    // returns object of {petId: ObjectId}
    return { petId }

}

// takes a user id and a pet id and adds the pet id to the users petId field in the database
const givePetToUser = async (
    userId, petId
) => {
    const userCollection = await users()

    // updates the user document to have a field called 'petId' matching the ObjectId of the newly created pet
    const status = await userCollection.updateOne({_id: ObjectId(userId)}, {$set: {"petId": petId}})

    // fails if error adding petId to user
    if (!status.acknowledged || !status.modifiedCount)
        throw 'Error: Could not add pet to database'

    return status
}

const getPetAttributes = async (
    userId
) => {
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
    return pet
}

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
    const petCollection = await pets()

    const status = await petCollection.updateMany({alive: true}, {$inc: {food: -1, cleanliness: -1, happiness: -1, rest: 1}}); // decreases food, cleanliness, happiness level of all pets, increases rest(todo: only increase rest when user is away)
    const status2 = await petCollection.updateMany({$or: [{food: {$lte: 0}}, {cleanliness: {$lte: 0}}, {happiness: {$lte: 0}}, {rest: {$lte: 0}}]}, {$set: {alive: false}}); // if any of the metrics decrease below 0, set alive boolean to false
    const status3 = await petCollection.deleteMany({alive: false}); // delete any pet who has died

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
    const petCollection = await pets()

    const pet = await petCollection.findOne({userId: ObjectId(userId)})

    let health
    if(pet)
        health =  Math.floor((pet.cleanliness + pet.happiness + pet.food + pet.rest) / 4)

    const status = await petCollection.updateOne({userId: ObjectId(userId)}, {$set: {health}})
    if(!status.acknowledged)
        throw 'Error: health not updated in database'

    return await petCollection.findOne({userId: ObjectId(userId)})
}

module.exports = {createPet, givePetToUser, getPetAttributes, updatePetAttribute, petCollectionDecay, updateHat, calculateHealth}