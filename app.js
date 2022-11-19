const express = require('express');
const app = express();
const configRoutes = require('./routes');

const session = require('express-session')
const exphbs = require('express-handlebars');


app.use(session({
    name: 'AuthCookie',
    secret: 'some secret string!',
    resave: false,
    saveUninitialized: true
}))

app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.use('/public', express.static(__dirname + '/public'));
app.engine('handlebars', exphbs.engine({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.use('/', (req, res, next) => {
    console.log('[' + new Date().toUTCString() + ']: ' + req.method + ' ' + req.originalUrl)
    next()
})

configRoutes(app);

app.listen(4000, () => {
    console.log('Server running on: http://localhost:4000');
});