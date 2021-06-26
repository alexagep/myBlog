const passport = require('passport');
const bcrypt = require('bcryptjs');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');


module.exports = function(passport){
    
    passport.use(new LocalStrategy({usernameField: 'email'}, async(email, password, done)=>{
    try {
        console.log(email);
        console.log(password);
        const user = await User.findOne({ email })
        if(!user){
            return done(null, false, {message: "Email or password is incorrect"})
         }
        
        const isMatch = await bcrypt.compare(password, user.password)
        if(isMatch){
            return done(null, user); //req.user
        } else {
            return done(null, false, {message: "Email or password is incorrect"})
        } 
    } catch (err) {
        console.log(err);
    }
}))

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user)
    });
  });
};