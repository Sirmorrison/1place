var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var userIdField = require('./userId');
var userIdSchema = new Schema(userIdField,{timestamps: true});

var commentField = require('./comm');
var commentSchema = new Schema(commentField,{timestamps: true});

var postFields = {
    message: String,
    mediaUrl: {
        type: String,
        required: true
    },
    mediaType: {
        type: String,
        required: true,
        enums:(['video', 'picture'])
    },
    likes: [userIdSchema],
    tagged: [userIdSchema],
    comments: [commentSchema],
    postedBy: {
        type: mongoose.Schema.Types.String,
        ref: 'User'
    },
    originalPostId: {
        type: String,
        ref: 'post'
    }
};
var Post = new Schema(postFields, { timestamps: true });

module.exports = mongoose.model('Post', Post);