const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController')
// const blog = require('./blog')
// const user = require('./user')
const {isAuth} =  require('../middlewares/auth');
const blogController = require('../controllers/blogController');


router.get('/contact', blogController.getContactPage); 
router.post('/contact', blogController.handleContactPage); 
router.get('/captcha.png', blogController.getCaptcha); 
router.post('/search', blogController.handleSearch); 
// router.post('/do-comment', isAuth, blogController.postComment);


router.get('/', userController.welcome)

router.get('/login', userController.login_get)
router.post('/login', userController.login_post, userController.rememberMe)

router.get('/logout',isAuth, userController.logout)

router.get('/register', userController.register_get)
router.post('/register', userController.register_post)



module.exports= router;