let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let userIdField = require('./userId');
let userIdSchema = new Schema(userIdField,{timestamps: true});

let postFields = {
    message: String,
    mediaUrl: {
        type: String,
        required: true
    },
    mediaType: {
        type: String,
        required: true,
    },
    likes: [userIdSchema],
    tagged: [userIdSchema],
    postedBy: {
        type: mongoose.Schema.Types.String,
        ref: 'User'
    },
    comments: {

    }
};

let Post = new Schema(postFields, { timestamps: true });
module.exports = mongoose.model('Post', Post);