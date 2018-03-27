let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let Todo = new Schema({
    todo_type: {
        type: String,
        required: true
    }
},{
    timestamps: true
});
module.exports = mongoose.model('Todo', Todo);