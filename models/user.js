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
    username: String,
    country: String,
    State: String,
    city: String,
    gender: String,
    status: String,
    bio: String,
    photoUrl: String,
    occupation: String,
    profession: String,
    coverImageUrl: String,
    followers:[userIdSchema],
    following:[userIdSchema],
    dob_count: Number, //number of dob changing per month
    dob_next: Date //time to next dob changing
};

let User = new Schema(fields, { timestamps: true });

module.exports = mongoose.model('User', User);