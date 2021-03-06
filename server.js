 const express = require('express');
const fs = require('fs');
const path = require('path')
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const hb = require('express-handlebars');
const db = require('./config/database');
const util = require("./config/utilities");
const router = require('./routes/router')


// const cookieSession = require('cookie-session');
var session = require('express-session');
var Store = require('connect-redis')(session);

app.use(session({
    store: new Store( process.env.REDIS_URL ? {
        url : process.env.REDIS_URL
    }: {
        host : 'localhost',
        port: 6379
    }),
    resave: false,
    saveUninitialized: true,
    secret: 'my super fun secret'
}));

// app.use(cookieSession({
//     secret: 'a really hard to guess secret',
//     maxAge: 1000 * 60 * 60 * 24 * 14
// }));

app.engine('handlebars', hb({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');



app.use(require('body-parser').urlencoded({
    extended: false
}));

app.use(require('cookie-parser')());



app.use(express.static(__dirname + `/public`));



app.use(function(req, res, next) {
    if(!req.session.user && req.url != "/register"  && req.url != "/login"){
        res.redirect('/register');
        return
    }else{
        if (req.session.user && req.url == "/register") {
            res.redirect("/signed");
            return
        }
    }
    next();
})


app.use('/', router);



// if the process.env.PORT  (on heroku) doesn't work, use 8080
app.listen(process.env.PORT || 8080, function() {
    console.log("listening");
})
