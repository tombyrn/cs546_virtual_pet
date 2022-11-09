const path = require('path');

const constructorMethod = (app) => {
  app.use('/', (req, res) => {
    res.sendFile(path.resolve('public/index.html'));
  })
};

module.exports = constructorMethod;