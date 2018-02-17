var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var likesFields = require('./userId');
var likesSchema = new Schema(likesFields,{timestamps: true});

var commentFields = {
    comment: {
        type: String,
        required: true
    },
    commentedBy: {
        type: mongoose.Schema.Types.String,
        ref: 'User',
        required: true
    },
    postId: {
        type: String,
        required: true
    },
    likes: [likesSchema]
};


var Comment = new Schema(commentFields,{timestamps: true});
module.exports = mongoose.model('Comment', Comment);