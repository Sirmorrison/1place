let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let likesFields = require('./userId');
let likesSchema = new Schema(likesFields,{timestamps: true});

let commentFields = {
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
        type: mongoose.Schema.Types.String,
        ref: 'Post',
        required: true
    },
    likes: [likesSchema]
};

let Comment = new Schema(commentFields,{timestamps: true});
module.exports = mongoose.model('Comment', Comment);