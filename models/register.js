let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let userIdField = require('./userId');
let userIdSchema = new Schema(userIdField,{timestamps: true});

let addressFields = require('./address');
let addressSchema = new Schema(addressFields);

let phoneFields = require('./address');
let phoneSchema = new Schema(phoneFields);

let ratingFields = require('./ratings');
let ratingSchema = new Schema(ratingFields, {timestamps: true});

let emailFields = require('./emails');
let emailSchema = new Schema(emailFields, {timestamps: true});

let fields = {
    _id: {
        type: String,
        required: true
    },
    let: {
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

let User = new Schema(fields, { timestamps: true });

module.exports = mongoose.model('User', User);