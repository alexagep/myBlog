const mongoose = require('mongoose')
const {schema} = require('./secure/postValidation');


const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 30
    }, 
    body: {
        type: String,
        required: true
    },
    user : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    status : {
        type: String,
        enum : ['public', 'private'],
        default: 'public'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    thumbnail:{
        type: String,
        required: true
    }
})

blogSchema.index({ title: "text" });

blogSchema.statics.postValidation = function(body){
    return schema.validate(body, {abortEarly: false});
};


module.exports = mongoose.model('Blog', blogSchema)