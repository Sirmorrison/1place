let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let userIdField = require('./userId');
let userIdSchema = new Schema(userIdField,{timestamps: true});

let fields = {
    _id: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    username: String,
    phone_number: {
        type: String,
        unique: true
    },
    email: {
        type: String,
        unique: true
    },
    d_o_b: {
        type: Number,
        // required: true
    },
    admin: {
        type: Boolean,
        default: false,
        required: true
    },
    country: String,
    city: String,
    gender: String,
    status: String,
    bio: String,
    photoUrl: String,
    coverImageUrl: String,
    address:String,
    followers:[userIdSchema],
    following:[userIdSchema],
};

let User = new Schema(fields, { timestamps: true });

module.exports = mongoose.model('User', User);