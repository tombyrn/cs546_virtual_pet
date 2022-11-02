const path = require('path');

const constructorMethod = (app) => {
  app.use('/index', (req, res) => {
    console.log(__dirname)
    const resPath = path.normalize(path.join(__dirname,  '../res/'))
    console.log(resPath);
    res.sendFile('index.html', {root: resPath});
  })
  app.use('*', (req, res) => {
    res.sendStatus(404);
  });
};

module.exports = constructorMethod;