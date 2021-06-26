const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController')
const {isAuth} =  require('../middlewares/auth');

//desc: Weblog index page
router.get('/', blogController.getIndex);

//Weblog Post Page
router.get("/post/:id", blogController.getSinglePost);

router.post('/do-comment', isAuth, blogController.postComment);


//router.get('/contact', blogController.getContactPage); 


module.exports = router;