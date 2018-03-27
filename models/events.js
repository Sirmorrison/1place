let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let Event = new Schema({
    event_type: {
        type: String,
        required: true
    },
    postedBy: {
        type: mongoose.Schema.Types.String,
        ref: 'User',
        required: true
    }
},{
    timestamps: true
});
module.exports = mongoose.model('Event', Event);