let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let eventFields = {
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


let Comment = new Schema(eventFields,{timestamps: true});
module.exports = mongoose.model('Comment', Comment);