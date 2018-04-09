let mongoose = require("mongoose");

module.exports = {
    categoryId: {
        type: mongoose.Schema.Types.String,
        ref: 'bizCategories',
        required: true
    }
};