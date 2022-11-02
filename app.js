const express = require('express');
const app = express();
const configRoutes = require('./routes');

app.use(express.json());

app.use( express.static( __dirname + '/res/' ));
configRoutes(app);
app.listen(4000, () => {
  console.log('Server running on: http://localhost:4000');
  console.log('                   http://localhost:4000/index');
});