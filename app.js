const express = require('express')
const app = express()
const configRoutes = require('./routes')
const configListener = require('./listener')
//
const path = require("path");
//parse data into gethint
const bodyParser = require("body-parser");
const routes = require("./routes/petRoutes.js");
const { engine } = require("express-handlebars");
//

const session = require('express-session')
const exphbs = require('express-handlebars')

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

app.use((req, res, next) => {
    const timestamp = new Date().toUTCString();
    const method = req.method;
    const route = req.originalUrl;
    let authenticated = 'Non-Authenticated User';
    if (req.session.user){
        authenticated = 'Authenticated User';
    }
    console.log(`[${timestamp}]: ${method} ${route} (${authenticated})`);
    next();
});

//games 
app.use(express.static(path.join(__dirname, "public")));
// view engine setup
app.set("views", path.join(__dirname, "views"));

app.engine(
  "handlebars",
  engine({
    extname: ".handlebars",
    defaultLayout: "main",
    helpers: {
      times: function (n, block) {
        var accum = "";
        for (var i = 0; i < n; ++i) accum += block.fn(i);
        return accum;
      },
    },
  })
);
app.set("view engine", "handlebars");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/", routes);
//

configRoutes(app);
configListener();

app.listen(4000, () => {
    console.log('Server running on: http://localhost:4000');
});

