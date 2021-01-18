const constants = require('./constants.js');
const express = require('express');
const mongoose = require('mongoose');
const exphbs = require('express-handlebars');
const _handlebars = require('handlebars');
const appRoutes = require('./routes/stories');
const authRoutes = require('./routes/auth');
const path = require('path');
const passport = require('passport')
const flash = require('connect-flash');
const session = require('express-session');

const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access')

const PORT = 3000;

const app = express();
const hbs = exphbs.create({
    defaultLayout: 'main',
    extname: 'hbs',
    handlebars: allowInsecurePrototypeAccess(_handlebars)
});

//Passport Auth
require('./config/passport')(passport);

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', 'views');

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({secret:'werINGsegn1224AGnsk',
            resave: true,
            saveUninitialized: true}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(authRoutes, appRoutes);

async function start()
{
    try
    {
        await mongoose.connect(constants.mongoUrl, 
        {
            useNewUrlParser: true,
            useFindAndModify: false
        });
        app.listen(PORT, () => 
        {
            console.log("Server has been started...");
        });
    }
    catch(e)
    {
        console.log(e);
    }
}

start();