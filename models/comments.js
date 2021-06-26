const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
    text: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        maxlength: 200
    }, 
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastUpdate: {
        type: Date,
        default: Date.now
    },
    user: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    blog: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Blog'
    }
});



module.exports = mongoose.model('Comment', CommentSchema);