module.exports = {
    designLimits: {
        // Defines highest and lowest numbers possible for pet design, background, and hat.
        min_design: 1,
        max_design: 3,
        min_bg: 1,
        max_bg: 3,
        min_hat: 1,
        max_hat: 3
    },
    decaySettings: {
        // Number of days for each feature to go from 100 to zero (or rest from 0 to 100).
        foodLifetime: 2,
        cleanLifetime: 7,
        happyLifetime: 14,
        restLifetime: 0.5,

        // Number of days a value can be kept at 0 before the pet dies. 
        foodGrace: 1,
        cleanGrace: 5,
        happyGrace: 5,

        // Interval (minutes) between decay calls.
        decayInterval: 5
    },
    actionRewards: {
        feed: {
            food: 20,
            cleanliness: -10,
            happiness: 5,
            rest: 0
        },
        clean: {
            food: 0,
            cleanliness: 20,
            happiness: 5,
            rest: -5
        },
        play: {
            food: 0,
            cleanliness: -10,
            happiness: 20,
            rest: -15
        }
    }
}