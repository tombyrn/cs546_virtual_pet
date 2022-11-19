const path = require('path');
const userRoutes = require('./userRoutes')
const petRoutes = require('./petRoutes')

const constructorMethod = (app) => {
    app.use('/', userRoutes)
    app.use('/home', petRoutes)
    app.use('*', (req, res) => {
      res.sendStatus(404)
    })
}

module.exports = constructorMethod;