module.exports = {
    designLimits: {
        // Defines highest and lowest numbers possible for pet design, background, and hat.
        min_design: 1,
        max_design: 3,
        min_bg: 0,
        max_bg: 3,
        min_hat: 0,
        max_hat: 3
    },
    //NOTE: These would be the real values we would use in our program
    // decaySettings: {
    //     // Number of days for each feature to go from 100 to zero (or rest from 0 to 100).
    //     foodLifetime: 2,
    //     cleanLifetime: 7,
    //     happyLifetime: 14,
    //     restLifetime: 0.5,

    //     // Number of days a value can be kept at 0 before the pet dies. 
    //     foodGrace: 1,
    //     cleanGrace: 5,
    //     happyGrace: 5,

    //     // Interval (minutes) between decay calls.
    //     decayInterval: 5
    // },
    decaySettings: {
        //NOTE: These are values used in demonstration/presentation
        // Number of days for each feature to go from 100 to zero (or rest from 0 to 100).
        foodLifetime: 7 / (24 * 60),
        cleanLifetime: 7 / (24 * 60),
        happyLifetime: 7 / (24 * 60),
        restLifetime: 0.5 / (24 * 60),

        // Number of days a value can be kept at 0 before the pet dies. 
        foodGrace: 2.5 / (24 * 60),
        cleanGrace: 2.5 / (24 * 60),
        happyGrace: 2.5 / (24 * 60),

        // Interval (minutes) between decay calls.
        decayInterval: 0.25
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
            cleanliness: 100,
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