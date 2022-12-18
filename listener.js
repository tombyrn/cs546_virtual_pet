const petData = require('./data').pets

const DECAY_RATE = require('./gameConstants').decaySettings.decayInterval * 60 * 1000

const constructorMethod = () => {
    setInterval(async () => {
        try {
            await petData.petCollectionDecay();
        } catch (e) {
            // This is a strictly backend-error, so it is presented via the console.
            //TODO: Route instead? 
            console.log(e);
        }
    }, DECAY_RATE);
}

module.exports = constructorMethod