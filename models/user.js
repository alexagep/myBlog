const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs')


const UserSchema = new Schema({
    firstName: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 30
    }, 
    email: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 30
    }, 
    username: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        minlength: 3,
        maxlength: 30
    },
    password : {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 30
    },
    gender : {
        type: String,
        enum : ['male', 'female'],
        default: 'male'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    mobile: {
        type: String,
        required: true
    },
    lastUpdate: {
        type: Date,
        default: Date.now
    },
    role: {
        type: String,
        enum: ['admin', 'blogger'],
        default: 'blogger'
    },
    avatar: {
        type: String
    }
})



UserSchema.pre('save', function(next){
    const user = this;

    if(!this.isNew || !this.isModified('password')) return next();

    bcrypt.hash(user.password, 10, function(err, hash){
        if(err) return next(err);
        user.password = hash;
        return next();
    });
});



module.exports = mongoose.model('User', UserSchema)