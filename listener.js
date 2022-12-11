const petData = require('./data').pets

const DECAY_RATE = 30 * 1000 // decay every 30 seconds

const constructorMethod = () => {
    setInterval(async () => {
        // console.log('updating')
        await petData.petCollectionDecay();
    }, DECAY_RATE);
}

module.exports = constructorMethod