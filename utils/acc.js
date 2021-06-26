const acc = {};

acc.userManagement = (req, res, next) => {
    
    if(req.user.role !== 'admin') return res.status(403).json({msg: "Permission Denied!"})
    else next();
};

acc.editUser = (req, res, next) => {
    if(req.session.user.role === 'admin') return next();
    if(req.session.user._id === req.body.userId) return next();
    else res.status(403).json({msg: "Permission Denied!"});
};

acc.sessionChecker = (req, res, next) => {
    if (req.session.user && req.cookies.user_sid) {
        console.log(req.session.user);
        res.redirect('/dashboard');
    } else {
        next();
    }
};

module.exports = acc;