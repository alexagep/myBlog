const Blog = require("../models/Blog");
const {formatDate} = require("../utils/jalali")
const { storage, fileFilter } = require('../utils/multer')
const multer = require('multer');
const sharp = require("sharp");
const { get500 } = require('../controllers/errorController')
const shortId = require('shortId');
const appRoot = require('app-root-path');
const fs = require('fs');


exports.getDashboard = async(req, res) => {
    //+(plus) converts a string to number
    const page = +req.query.body || 1;
    const postPerPage = 5;
    
    try {
        const numberOfPosts = await Blog.find({
            user: req.user._id 
        }).countDocuments();
        const blogs = await Blog.find({ user: req.user.id })
            .skip((page - 1) * postPerPage)
            .limit(postPerPage);

        res.set(
        "cache-Control",
        "no-cache, private, no-store, must-revalidate, max-scale=0, post-check=0, pre-check=0"
        );

        res.render('dashboard', {
            pageTitle: "dashboard | user panel",
            path: "/dashboard",
            blogs,
            formatDate,
            currentPage: page,
            nextPage: page + 1,
            previousPage: page - 1,
            hasNextPage: postPerPage * page < numberOfPosts,
            hasPreviousPage: page > 1,
            lastPage: Math.ceil(numberOfPosts / postPerPage)
        })
    } catch (err) {
        console.log(err);
        get500(req, res);
    }
}

exports.getAddPost = (req, res) => {
    res.render('private/addPost', {
        pageTitle: "Add post",
        path: "/dashboard/addPost"
    })
}

exports.getEditPost = async(req, res) => {
    const post = await Blog.findOne({ _id: req.params.id });

    if(!post) {
        return res.redirect("errors/404");
    }

    if(post.user.toString() != req.user._id) {
        return res.redirect("/dashboard")
    }else{
        res.render('private/editPost', {
            pageTitle: "Edit post",
            path: "/dashboard/addPost",
            username: req.user.username,
            post
        });
    }
}

exports.PostEditPost = async(req, res) =>{
    const errorArr = [];

    const thumbnail = req.files ? req.files.thumbnail : {};
    const fileName = `${shortId.generate()}_${thumbnail.name}`
    const uploadPath = `${appRoot}/public/uploads/thumbnails/${fileName}`;
    

    const post = await Blog.findOne({ _id: req.params.id })

    try {
        if(thumbnail.name){
            await Blog.postValidation({...req.body, thumbnail});
        }else {
            await Blog.postValidation({...req.body, thumbnail: {name: 'placeholder', size: 0, mimeType: 'image/jpeg' || 'image/jpg' || 'image/png'}})
        }
            

        if(!post) {
            return res.redirect('/404');
        }

        if(post.user.toString() != req.user._id){
            return res.redirect('/dashboard')
        }else{
            if(thumbnail.name){
                fs.unlink(`${appRoot}/public/uploads/thumbnail/${post.thumbnail}`, async (err) => {
                    if(err) throw err;
                    else{
                        await sharp(thumbnail.data)
                            .toFile({uploadPath})
                            .catch((err) => console.log(err))
                    }
                })
            }

            const { title, status, body } = req.body;
            post.title = title;
            post.status = status;
            post.body = body;
            post.thumbnail = thumbnail.name ? fileName : post.thumbnail

            await post.save();
            return res.redirect('/dashboard')
        }
    } catch (err) {
        console.log(err);
        err.inner.forEach((e)=> {
            errorArr.push({
                name: e.path,
                message: e.message
            });
        });
        res.render('private/editPost', {
            pageTitle: "edit post",
            path: "/dashboard/editPost",
            errors: errorArr,
            post
        });
    }
}

exports.postAddPost = async(req, res) => {
    const errorArr = [];

    const thumbnail = req.files ? req.files.thumbnail : {};
    const fileName = `${shortId.generate()}_${thumbnail.name}`;
    const uploadPath = `${appRoot}/public/uploads/thumbnails/${fileName}`;

    try {
        req.body = { ...req.body, thumbnail};

        await Blog.postValidation(req.body);
        await sharp(thumbnail.data)
            .toFile(uploadPath)
            .catch((err) => console.log(err));

        await Blog.create({...req.body, user: req.user.id, thumbnail: fileName});

        res.redirect('/dashboard')
    } catch (err) {
        console.log(err);
        err.inner.forEach((e)=> {
            errorArr.push({
                name: e.path,
                message: e.message
            });
        });
        res.render('private/addPost', {
            pageTitle: "Add post",
            path: "/dashboard/addPost",
            errors: errorArr
        });
    }
};

exports.getDeletePost= async(req, res) => {
    try {
        await Blog.findByIdAndRemove(req.params.id);
        res.redirect('/dashboard')
    } catch (err) {
        get500(req, res);
    }
}

exports.uploadImage = (req, res) => {
    const upload = multer({
        limits: {fileSize: 1000000},
        dest: 'uploads/',
        fileFilter,
        storage
    }).single('image');

    upload(req, res, async(err)=>{
        if(err) {
            if (err.code === "LIMIT_FILE_SIZE") {
                return res.status(400).send("image size must be less than 1MB");
            }
            res.status(400).send(err);
        }else {
            if(req.files){
                const fileName = `${shortId.generate()}_${req.files.image.name}`;
                await sharp(req.files.image.data)
                    .toFile(`./public/uploads/${fileName}`)
                    .catch((err) => console.log(err));

                res.status(200).send(`http://localhost:3000/uploads/${fileName}`);
            }else{
                res.send('for uploading, you should choose an image first')
            }
        }
    });
}

exports.handleDashSearch = async(req, res) => {
     //+(plus) converts a string to number
     const page = +req.query.body || 1;
     const postPerPage = 5;
     
     try {
         const numberOfPosts = await Blog.find({
             user: req.user._id,
             $text: {$search: req.body.search }
         }).countDocuments();
         const blogs = await Blog.find({ 
             user: req.user.id, 
             $text: {$search: req.body.search }
        })
             .skip((page - 1) * postPerPage)
             .limit(postPerPage);
 
         res.render('dashboard', {
             pageTitle: "dashboard | user panel",
             path: "/dashboard",
             blogs,
             formatDate,
             currentPage: page,
             nextPage: page + 1,
             previousPage: page - 1,
             hasNextPage: postPerPage * page < numberOfPosts,
             hasPreviousPage: page > 1,
             lastPage: Math.ceil(numberOfPosts / postPerPage)
         });
     } catch (err) {
         console.log(err);
         get500(req, res);
     }
};