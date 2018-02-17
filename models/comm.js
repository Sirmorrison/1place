var mongoose = require("mongoose");

var likesFields = require('./userId');
var likesSchema = new Schema(likesFields,{timestamps: true});

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
    likes: [likesSchema]
};