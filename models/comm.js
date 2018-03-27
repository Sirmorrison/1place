let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let likesFields = require('./userId');
let likesSchema = new Schema(likesFields, {timestamps: true});

module.exports = {
    comment: {
        type: String,
        required: true
    },
    commentedBy: {
        type: mongoose.Schema.Types.String,
        ref: 'User',
        required: true
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    },
    likes: [likesSchema]
};