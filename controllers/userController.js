const User = require('../models/user')
const passport = require('passport');
const url = require('url');
const { sendEmail } = require("../utils/mailer");
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs');


exports.welcome = (req, res) => {
    res.render('welcome', {
        pageTitle: "Welcome",
        path: "/welcome",
        message: req.flash("success_msg"),
        error: req.flash("error")
    });
};


exports.login_get = (req, res) => {
    res.set(
        "cache-Control",
        "no-cache, private, no-store, must-revalidate, max-scale=0, post-check=0, pre-check=0"
    );

    res.render('auth/login', {
        pageTitle: "Login",
        path: "/login",
        message: req.flash("success_msg"),
        error: req.flash("error")
    });
};


exports.register_get = (req, res) => {
    res.render('auth/register', {
        pageTitle: "Register",
        path: "/register",
        message: req.flash("success_msg"),
        error: req.flash("error")
    });
};


exports.login_post = (req, res, next) => {    
    passport.authenticate("local", {
        successRedirect: "/dashboard",
        failureRedirect: "/login",
        failureFlash: true,
    })(req, res, next)
};    


// exports.login_post = (req, res) => {    
//     if (!req.body.email || !req.body.password) {
//         console.log(1);
//         return res.redirect(url.format({
//             pathname:"/login",
//             query: {
//                "msg": 'Empty Field :('
//              }
//         }));
//     };

//     User.findOne({email: req.body.email}, (err, user) => {
//         if (err) {
//             console.log(2);
//             return res.redirect(url.format({
//                 pathname:"/login",
//                 query: {
//                    "msg": 'Server Error :('
//                  }
//             }));
//         };

//         if (!user) {
//             console.log(3);
//             return res.redirect(url.format({
//                 pathname:"/login",
//                 query: {
//                    "msg": 'User Not Found :('
//                  }
//             }));
//         };

//         bcrypt.compare(req.body.password, user.password, function(err, isMatch) {
//             if (err) {
//                 console.log(4);
//                 return res.redirect(url.format({
//                     pathname:"/login",
//                     query: {
//                        "msg": 'Server Error :('
//                      }
//                 }));
//             };

//             if (!isMatch){
//                 console.log(5);
//              return res.redirect(url.format({
//                 pathname:"/login",
//                 query: {
//                    "msg": 'User Not Found :('
//                  }
//             }))};
//             console.log(6);
//             console.log(user);

//             req.session.user = user;

//             res.redirect("/dashboard");
//         });
//     });
// };   
  

exports.logout = (req, res) => {
    req.session = null;
    req.logout();
    //req.flash("success_msg", " logged out successfully ");
    res.set(
        "cache-Control",
        "no-cache, private, no-store, must-revalidate, max-scale=0, post-check=0, pre-check=0"
    );
    res.redirect("/login");
};


exports.rememberMe = (req, res) => {
    if(req.body.remember){
        req.session.cookie.originalMax = 24*60*60*1000*7; //7days
    }else{
        req.session.cookie = null;
    }
    res.redirect('/dashboard')
}

exports.register_post = async(req, res) => {
    const errors = [];
    const { firstName, email } = req.body;

    try {
        if (!req.body.username || !req.body.email || !req.body.password || 
            !req.body.confirmPassword || !req.body.firstName ||
             !req.body.lastName || !req.body.gender || !req.body.mobile) {
    
            errors.push({ msg: 'Please enter all fields' });
            return res.redirect(url.format({
                pathname:"/register",
                pageTitle: "Register",
                errors
            }));
        };
    
        if (req.body.password != req.body.confirmPassword) {
            console.log('error pass')
    
            errors.push({ msg: 'Passwords do not match' });
          }
    
        const user = await User.findOne({email: req.body.email});
        const userSave = await User.findOne({username: req.body.username.trim()})
    
        if(user) {
            console.log('err here')
    
            errors.push({ msg: 'Email already exists' });
            return res.redirect(url.format({
                pageTitle: "Register",
                pathname:"/register",
                errors
            }));
        } else if (userSave) {
            console.log(5)
    
            errors.push({ msg: 'Username Already Exist :(' });
            return res.redirect(url.format({
                pageTitle: "Register",
                pathname:"/register",
                errors
            }));
        } else {
                let createdUser = new User({
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    username: req.body.username.trim(),
                    password: req.body.password,
                    gender: req.body.gender,
                    mobile: req.body.mobile,
                    email: req.body.email
                })
                await createdUser.save();

                //send Welcome Email
                sendEmail(email, firstName, 'Welcome to FUNDMAN', 'we are so lucky to have you in our site')
                req.flash("success_msg", "You Have Signed Up Successfully");
                return res.redirect(url.format({
                    pageTitle: "Login",
                    pathname:"/login",
                    errors
                }));
            }
    } catch (err) {
        console.log(err)
        console.log('save error')
        err.inner.forEach( e => {
            errors.push({
                name: e.path,
                message: e.message
            })
        })
        errors.push({ msg: 'Server Error :(' });
        return res.redirect(url.format({
        pageTitle: "Register",
        pathname:"/register",
        errors
        }))
    }
}

exports.forgetPassword = async(req, res) => {
    return res.render('forgetPass', {
        pageTitle: "Forget Password",
        path: "/login",
        message: req.flash("success_msg"),
        error: req.flash("error")
    })
}

exports.handleForgetPassword = async(req, res) =>{
    const { email } = req.body;

    const user = await User.findOne({ email })

    if(!user){
        req.flash("error", "user with this email doesn't exists")

        return res.render('forgetPass', {
            pageTitle: "Forget Password",
            path: "/login",
            message: req.flash("success_msg"),
            error: req.flash("error")
        });
    }

    const token = jwt.sign({ userId: user._id}, process.env.JWT_SECRET, {expiresIn: "1h"});
    const resetLink = `http://localhost:3000/users/reset-password/${token}`;

    sendEmail(user.email, user.firstName, 'forget password', `for changing current password, click below link: 
        <br>    
        <a href="${resetLink}"> Reset Password's Link</a>
            `);

    req.flash("success_msg", "link of changing password,with an email has been sent to you")

    res.render('forgetPass', {
        pageTitle: "Forget Password",
        path: "/login",
        message: req.flash("success_msg"),
        error: req.flash("error")
    });
}

exports.resetPassword = async(req, res) => {
    const token = req.params.token;
    let decodedToken;

    try{
        decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    }catch(err){
        if(!decodedToken){
            return res.redirect('/404');
        }
    }

    res.render('resetPass', {
        pageTitle: "Reset Password",
        path: "/login",
        message: req.flash("success_msg"),
        error: req.flash("error"),
        userId: decodedToken.userId
    });
}

exports.handleResetPassword = async(req, res) => {
    const { password, confirmPassword } = req.body;

    if(password != confirmPassword){
        req.flash('error', 'passwords are not equal')
        res.render('resetPass', {
            pageTitle: "Reset Password",
            path: "/login",
            message: req.flash("success_msg"),
            error: req.flash("error"),
            userId: req.params.id
        });
    }

    const user = await User.findOne({ _id: req.params.id })
    
    if(!user){
        return res.redirect('/404');
    }

    user.password = password;
    await user.save();

    req.flash("success_msg", "Your password updated successfully")
    res.redirect('/login');
}


exports.createAdmin = async (req, res) => {
    try {
        
        if (req.user.role != "admin"){ 
            res.status(403).send("permission denied")
            return
        }

        let admin = new User({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
            role: 'admin',
            gender: req.body.gender,
            mobile: req.body.mobile
        });
        
        console.log("!createadmin");

        admin = await admin.save();
        console.log("createadmin");

        res.json(admin)
    } catch (err) {
        console.log(err);
        res.status(500).send('err in create admin')
    }
}


exports.allUsers = (req, res) => {

    User.find({role: {$ne: 'admin'}}, (err, users) => {
        if(err) return res.json({err, msg: "something went wrong"});
        res.json(users);
    })
}