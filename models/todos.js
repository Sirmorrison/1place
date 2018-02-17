var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var Todo = new Schema({
    todo_type: {
        type: String,
        required: true
    }
},{
    timestamps: true
});
module.exports = mongoose.model('Todo', Todo);