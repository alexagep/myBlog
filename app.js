const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const config = require('./config/config');
const session = require('express-session');
const connectDB = require('./config/db');
const passport = require('passport');
const dotEnv = require("dotenv");
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const MongoStore = require("connect-mongo");
const fileUpload = require('express-fileupload');

const app = express();
const api = require('./routes/api.js');



// Load Config
dotEnv.config({ path: "./config/config.env" });

//Database connection
connectDB();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//view engine
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//Body Parser
// app.use(express.urlencoded({extended: false}));
app.use(express.json());


//File Upload Middleware
app.use(fileUpload());


//session
app.use(session({
    key: 'user_sid',
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    unset: "destroy",
    store: MongoStore.create({ mongoUrl: 'mongodb://localhost:27017/myOwnBlog' }),
}));

// app.use((req, res, next) => {
//     if (req.cookies.user_sid && !req.session.user) {
//         res.clearCookie('user_sid');        
//     };
//     next();
// });


//* Passport
app.use(passport.initialize());
app.use(passport.session());
require('./config/passport')(passport);

// Connect flash
app.use(flash());


// Global variables
app.use(function(req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
  });

app.use('/', api);
app.use("/dashboard", require("./routes/dashboard"));
app.use('/home', require("./routes/blog"))
app.use('/users', require("./routes/user"))


//* 404 Page
app.use(require("./controllers/errorController").get404);


const PORT = process.env.PORT || 1000;

app.listen(PORT, () =>
    console.log(
        `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
    )
);