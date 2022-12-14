const petData = require('./data').pets

// Decay every five minutes
const DECAY_RATE = require('./gameConstants').decaySettings.decayInterval * 60 * 1000

const constructorMethod = () => {
    setInterval(async () => {
        // console.log('updating')
        await petData.petCollectionDecay();
    }, DECAY_RATE);
}

module.exports = constructorMethod