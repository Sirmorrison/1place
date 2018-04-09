let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let userIdField = require('./userId');
let userIdSchema = new Schema(userIdField,{timestamps: true});

let catIdField = require('./cate_tags');
let categorySchema = new Schema(catIdField);

let addressFields = require('./address');
let addressSchema = new Schema(addressFields);

let phoneFields = require('./phone_numbers');
let phoneSchema = new Schema(phoneFields);

let linkFields = require('./links');
let linkSchema = new Schema(linkFields);

// let ratingFields = require('./ratings');
// let ratingSchema = new Schema(ratingFields, {timestamps: true});

let emailFields = require('./emails');
let emailSchema = new Schema(emailFields, {timestamps: true});

let fields = {
    biz_name: {
        type: String,
        required: true,
        unique: true
    },
    country: {
        type: String,
        required: true,
    },
    state: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    categoryTags:[categorySchema],
    createdBy: {
        type: mongoose.Schema.Types.String,
        ref: 'User',
        required: true
    },
    about_biz: String,
    status: String,
    bio: String,
    biz_logo: String,
    coverImageUrl: String,
    email: [emailSchema],
    biz_numbers:[phoneSchema],
    social_links:[linkSchema],
    // rating:[ratingSchema],
    address:[addressSchema],
    followers:[userIdSchema],
    following:[userIdSchema],
    biz_name_count: Number, //number of name changing per month
    biz_name_next: Date //time to next name changing
};

let Business = new Schema(fields, { timestamps: true });

module.exports = mongoose.model('Business', Business);