let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let fields = {
    postedBy: {
        type: mongoose.Schema.Types.String,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    }
};

let bizCategories = new Schema(fields, { timestamps: true });
module.exports = mongoose.model('bizCategories', bizCategories);