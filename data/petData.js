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

    const projection = {
        _id: 1,
        userId: 1,
        name: 1,
        design: 1,
        hat: 1,
        alive: 1,
        food: 1,
        cleanliness: 1,
        happiness: 1,
        rest: 1
    }
    const pet = await petCollection.findOne({userId: ObjectId(userId)}, projection)
    return pet
}

module.exports = {createPet, givePetToUser, getPetAttributes}