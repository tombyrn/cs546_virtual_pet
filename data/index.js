const petData = require('./petData')
const userData = require('./userData')
const hangman = require('./hangman')
module.exports = {
    users: userData,
    pets: petData,
    hangmanGameDate: hangman
}