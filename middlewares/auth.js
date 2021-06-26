exports.isAuth = (req, res, next) => {
    if(req.isAuthenticated()) {
        return next();
    }
    console.log('done');
    res.redirect('/login')
}


