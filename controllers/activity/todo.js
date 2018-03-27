const express = require('express');
const router = express.Router();

const User = require('../../models/user');

const todo = require('../../models/todos');

/** endpoint for getting event list by users and admin*/
router.get('/', function (req,res) {

    User.findById(req.user.id, function (err, user) {
        if (err) {
            return res.badRequest("Something unexpected happened");
        }
        if (!user){
            return res.badRequest("you not authorized perform this action");
        }

        todo.find({}, function (err, result) {
            if (err) {
                return res.badRequest("Something unexpected happened");
            }
            if (!result) {
                return res.success([]);
            }

            res.success(result);
        });
    });
});

/** endpoint for posting event list by admin*/
router.post('/', function (req,res) {

    let todo_type = req.body.todo_type;

    User.findById(req.user.id, function (err, user) {
        if (err) {
            return res.badRequest("Something unexpected happened");
        }
        if (!user){
            return res.badRequest("you not authorized perform this action");
        }
        if (user.admin !== true){
            return res.badRequest("you not authorized perform this action");
        }
        if (typeof(todo_type) !== 'string' || todo_type.trim().length <= 0) {
            return res.badRequest('Type of Event is required, cannot be empty and must be string');
        }
        let todo = {
            postedBy:  req.user.id,
            todo_type: todo_type
        };

        event.create(todo, function (err, result) {
            if (err){
                console.log(err);
                return res.serverError("Something unexpected happened");
            }

            res.success({todoId: result._id, todo: result.todo_type});
        });
    });
});

/** editing event by admin USING the ID*/
router.post('/:todo_typeId', function (req,res) {

    let todo_type = req.body.todo_type;

    User.findById(req.user.id, function (err, user) {
        if (err) {
            return res.badRequest("Something unexpected happened");
        }
        if (!user){
            return res.badRequest("you not authorized perform this action");
        }
        if (user.admin !== true) {
            return res.badRequest("You are not Authorized Perform this Action");
        }
        if (typeof(todo_type) !== 'string' || todo_type.trim().length <= 0) {
            return res.badRequest('Type of Event is required, cannot be empty and must be string');
        }

        let todo = {
            postedBy:  req.user.id,
            todo_type: todo_type
        };

        event.findByIdAndUpdate({_id : req.params.todo_typeId}, {$set: todo}, {new: true}, function (err, result) {
            if (err) {
                console.log("This is weeks error: ", err);
                return res.badRequest("Something unexpected happened");
            }

            res.success({todo: result.todo_type});
        });
    });
});

/** deleting an event type by admin*/
router.delete('/:todo_typeId', function (req, res) {

    User.findById(req.user.id, function (err, user) {
        if (err) {
            console.log("This is weeks error: ", err);
            return res.badRequest("Something unexpected happened");
        }
        if (user.admin !== true) {
            return res.badRequest("You are not Authorized Perform this Action");
        }

        event.remove({_id: req.params.todo_typeId}, function (err, result) {
            if (err) {
                return res.badRequest("Something unexpected happened");
            }

            res.success("todo type was deleted successfully");
        });
    });
});
