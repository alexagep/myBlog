const express = require('express');
const router = express.Router()
const { isAuth } = require('../middlewares/auth');
const adminController = require('../controllers/adminController')
// const acc = require('../utils/acc')



//Dashboard
router.get('/', isAuth , adminController.getDashboard)

//Dashboard/ Add Post
router.get('/addPost', isAuth , adminController.getAddPost)

//Dashboard/ Handle Post Creation
router.post('/addPost', isAuth , adminController.postAddPost)

//Dashboard/ Edit Post
router.get('/editPost/:id', isAuth , adminController.getEditPost)

//Dashboard/ Handle Post Edit
router.post('/editPost/:id', isAuth , adminController.PostEditPost)

//Dashboard/ Delete Post
router.get('/deletePost/:id', isAuth , adminController.getDeletePost)

//Dashboard/ Handle Image Upload
router.post('/uploadImage', isAuth , adminController.uploadImage)


//Dashboard/ Handle search
router.post('/search', isAuth , adminController.handleDashSearch)


module.exports = router