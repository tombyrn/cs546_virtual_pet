const express = require('express');
const app = express();
const configRoutes = require('./routes');


app.use('/public', express.static( __dirname + '/public' ));

configRoutes(app);

app.listen(4000, () => {
  console.log('Server running on: http://localhost:4000');
  console.log('                   http://localhost:4000/index');
});