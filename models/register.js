var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var userIdField = require('./userId');
var userIdSchema = new Schema(userIdField,{timestamps: true});

var addressFields = require('./address');
var addressSchema = new Schema(addressFields);

var phoneFields = require('./address');
var phoneSchema = new Schema(phoneFields);

var ratingFields = require('./ratings');
var ratingSchema = new Schema(ratingFields, {timestamps: true});

var emailFields = require('./emails');
var emailSchema = new Schema(emailFields, {timestamps: true});

var fields = {
    _id: {
        type: String,
        required: true
    },
    biz_name: {
        type: String,
        required: true,
        unique: true
    },
    admin: {
        type: Boolean,
        default: false,
        required: true
    },
    country: String,
    city: String,
    status: String,
    bio: String,
    biz_logo: String,
    coverImageUrl: String,
    email: [emailSchema],
    biz_numbers:[phoneSchema],
    rating:[ratingSchema],
    address:[addressSchema],
    followers:[userIdSchema],
    following:[userIdSchema]
};

var User = new Schema(fields, { timestamps: true });

module.exports = mongoose.model('User', User);