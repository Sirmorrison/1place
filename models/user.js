var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var userIdField = require('./userId');
var userIdSchema = new Schema(userIdField,{timestamps: true});

var fields = {
    _id: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    d_o_b: {
        type: Number,
        required: true
    },
    username: {
        type: String,
        unique: true
    },
    admin: {
        type: Boolean,
        default: false,
        required: true
    },
    phone_number: {
        type: String,
        unique: true,
        required: true
    },
    country: String,
    city: String,
    email: String,
    gender: String,
    status: String,
    bio: String,
    photo: String,
    coverImageUrl: String,
    address:String,
    followers:[userIdSchema],
    following:[userIdSchema]
};

var User = new Schema(fields, { timestamps: true });

module.exports = mongoose.model('User', User);