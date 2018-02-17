var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var eventFields = {
    event_type: {
        type: String,
        required: true
    },
    event_date: {
        type: String,
        required: true
    },
    frequency: {
        type: String,
        required: true
    },
    event_time: {
        type: String,
        required: true
    },
    about_event: {
        type: String,
        required: true
    }
};


var Comment = new Schema(eventFields,{timestamps: true});
module.exports = mongoose.model('Comment', Comment);