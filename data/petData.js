const { ObjectId } = require('mongodb');

// petData functions
const pets = require('../config/mongoCollections').pets
const users = require('../config/mongoCollections').users

// petProps should be an object of {name: string,  design: petProps.design}
const createPet = async (
    userId, petProps
) => {
    const petCollection = await pets();

    const dateCreated = Date.now();
    const petId = ObjectId();
    let status = await petCollection.insertOne({
        _id: petId, 
        userId: userId,
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

    if (!status.acknowledged || !status.insertedId)
        throw 'Error: Could not add pet to database'

    return { petId }

}

const givePetToUser = async (
    userId, petId
) => {
    const userCollection = await users()
    console.log(userId)
    const status = await userCollection.updateOne({_id: userId}, {$set: {"petId": petId}})
    console.log(status)
    return status
}

module.exports = {createPet, givePetToUser}