const Yup = require('yup');
const captchapng = require('captchapng');
const Blog = require('../models/Blog');
const { formatDate } = require('../utils/jalali')
const { truncate } = require("../utils/helper");
const { sendEmail } = require('../utils/mailer');
const { get500 } = require("./errorController");
const Comment = require('../models/comments');

let CAPTCHA_NUM;


exports.getIndex = async(req, res) => {
    const page = +req.query.body || 1;
    const postPerPage = 5;
    
    try{
        const numberOfPosts = await Blog.find({
            status: "public"
        }).countDocuments();


        const posts = await Blog.find({ status: "public" })
        
            .sort({ createdAt: 'desc'})
            .skip((page - 1) * postPerPage)
            .limit(postPerPage)
            .populate("user").exec();
        
            //console.log(posts);
    
        res.render('home', {
            pageTitle: "Home",
            path: "/home",
            posts,
           
            formatDate,
            truncate,
            currentPage: page,
            nextPage: page + 1,
            previousPage: page - 1,
            hasNextPage: postPerPage * page < numberOfPosts,
            hasPreviousPage: page > 1,
            lastPage: Math.ceil(numberOfPosts / postPerPage)
        });
    } catch(err){
        get500(req, res);
    }
}


exports.getSinglePost = async(req, res) => {
    try{
        const post = await Blog.findOne({_id: req.params.id}).populate("user");
        const comments = await Comment.find({blog: post._id}).populate("user")
        // console.log(comments);
        // console.log('not comment')

        if(!post) return res.redirect('/404')

        res.render('post', {
            pageTitle: post.title,
            path: "/home/post",
            post,
            comments,
            formatDate,
        });
    } catch (err) {
        get500(req, res);
        console.log(1);
    }
}

exports.postComment = (req, res) => {
    console.log("err here");
   const comments = new Comment({
       user: req.user._id,
       text: req.body.comment,
       blog: req.body.postId
   })
   comments.save();
}


exports.getContactPage = (req, res) => {
    res.render('contact', {
        pageTitle: 'Contact us',
        path: "/contact",
        message: req.flash("success_msg"),
        error: req.flash("error"),
        errors: [],
    });
};


exports.handleContactPage = async(req, res) => {
    const errorArr = [];

    const { firstName, email, message, captcha } = req.body;

    const schema = Yup.object().shape({
        firstName: Yup.string().required("Name is required"),
        email: Yup.string().email("Email Address is not correct").required('email address is required'),
        message: Yup.string().required("Write your message please!")
    });

    try{
        await schema.validate(req.body, {abortEarly: false});

        //captcha validation
        if(parseIn(captcha) === CAPTCHA_NUM){
            sendEmail(
                email, 
                firstName, 
                'message from FundMan', 
                `${message} <br/> User Email: ${email}`
            );

            req.flash("success_msg", "your message has been sent")
    
            return res.render('contact', {
                pageTitle: 'Contact us',
                path: '/contact',
                message: req.flash("success_msg"),
                error: req.flash("error"),
                errors: errorArr
            });
        }

        req.flash("error", "incorrect CAPTCHA");

        res.render('contact', {
            pageTitle: 'Contact us',
            path: '/contact',
            message: req.flash("success_msg"),
            error: req.flash("error"),
            errors: errorArr
        });
    }catch(err){
        err.inner.forEach((e)=> {
            errorArr.push({
                name: e.path,
                message: e.message
            });
        });
        res.render('contact', {
            pageTitle: 'Contact us',
            path: '/contact',
            message: req.flash("success_msg"),
            error: req.flash("error"),
            errors: errorArr
        })
    }
}


exports.getCaptcha = (req, res) => {
    CAPTCHA_NUM = parseInt(Math.random() * 9000 + 1000);

    const p = new captchapng(80, 30, CAPTCHA_NUM);

    p.color(0, 0, 0, 0);
    p.color(80, 80, 80, 255);

    const img = p.getBase64();
    const imgBase64 = Buffer.from(img, "base64");

    res.send(imgBase64);
};


// exports.postComment = async(req, res) => {
//     try {
//         const comments = await Blog.updateMany({ _id : req.body.id , $push: { "comments": {username: req.user.username, comment: req.body.comment } }})
//             .sort({ createdAt: 'desc'})
        
//         res.render('post', {
//             pageTitle: post.title,
//             path: "/home/do-comment",
//             comments,
//             formatDate
//         });
//     } catch (err) {
//         res.render("errors/500", {
//             pageTitle: " Server Error | 500",
//             path: "/500",
//         });
//     }
// }


exports.handleSearch = async(req, res) => {
    const page = +req.query.body || 1;
    const postPerPage = 5;
    
    try{
        const numberOfPosts = await Blog.find({
            status: "public",
            $text: { $search: req.body.search }, 
        }).countDocuments();

        const posts = await Blog.find({ status: "public", $text: { $search: req.body.search } })
            .sort({ createdAt: 'desc'})
            .skip((page - 1) * postPerPage)
            .limit(postPerPage);

        res.render('home', {
            pageTitle: "Your Search Result",
            path: "/home",
            posts,
            formatDate,
            truncate,
            currentPage: page,
            nextPage: page + 1,
            previousPage: page - 1,
            hasNextPage: postPerPage * page < numberOfPosts,
            hasPreviousPage: page > 1,
            lastPage: Math.ceil(numberOfPosts / postPerPage)
        });
    } catch(err){
        res.render("errors/500", {
            pageTitle: " Server Error | 500",
            path: "/500",
        });
    }
}