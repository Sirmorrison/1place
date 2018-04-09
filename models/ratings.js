let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let fields = {
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    ratedBy: {
        type: mongoose.Schema.Types.String,
        ref: 'User',
        required: true
    },
    businessId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business',
        required: true
    }
};

let Rating = new Schema(fields, { timestamps: true });
module.exports = mongoose.model('Rating', Rating);