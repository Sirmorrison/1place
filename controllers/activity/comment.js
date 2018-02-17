var express = require('express');
var router = express.Router();

var Comments = require('../../models/comments');

router.get('/', function (req,res) {

    Comments.find({})
        .populate({
            path: 'commentBy',
            select:'name photo'
        })
        .sort({date: -1})
        .exec(function(err, comment) {
            if (err){
                return res.serverError("Something unexpected happened");
            }

            res.success(comment);
        });
});

router.post('/', function (req, res) {
    var comment = req.body.comment,
        postId = req.body.postId;

    if (typeof(comment) !== 'string'){
        return res.badRequest('comment is required');
    }
    if (typeof(postId) !== 'string'){
        return res.badRequest('postId is required');
    }

    var values ={
        comment: comment,
        commentBy: req.user.id,
        postId: postId
    };

    Comments.create(values, function (err, comment) {
        if (err){
            console.log(err);
            return res.serverError("Something unexpected happened");
        }

        res.success({postId: comment._id});
    });
});

router.get('/:commentId', function (req,res) {
    Comments.findById(req.params.commentId)
        .populate({
            path: 'commentedBy',
            select:'name photo'
        })
        .exec(function(err, comment) {
            if (err){
                return res.serverError("Something unexpected happened");
            }

            var info = {
                comment: comment.comment,
                commentedBy: comment.commentedBy,
                likes: comment.likes.length
            };

            res.success(info);
        });
});

router.put('/:commentId', function (req, res) {

    var comment = req.body.comment,
        postId = req.body.postId;


    if (typeof(comment) !== 'string'){
        return res.badRequest('comment is required');
    }
    if (typeof(postId) !== 'string'){
        return res.badRequest('postId is required');
    }

    var values ={
        comment: comment,
        commentBy: req.user.id,
        postId: postId
    };

    Comments.findByIdAndUpdate({_id: req.params.commentId, commentedBy: req.user.id} , {$set: values}, {new: true}, function (err, comment) {

        if (err) {
            return res.serverError("Something unexpected happened");
        }
        // if (comment.commentedBy !== req.user.id) {
        //     return res.unauthorized("YOU ARE NOT AUTHORIZED TO PERFORM THIS ACTION");
        // }

        res.success(comment);
    });
});

router.delete('/:commentId', function (req, res) {
    Comments.findById(req.params.commentId, function (err, comment) {

        if (err){
            return res.serverError("Something unexpected happened");
        }
        if (comment.commentedBy !== req.user.id){
            return res.unauthorized("YOU ARE NOT AUTHORIZED TO PERFORM THIS ACTION");
        }

        comment.remove(function (err) {
            if (err){
                return res.serverError("Something unexpected happened");
            }

            res.success("Post was deleted Successfully");
        });
    });
});

router.post('/:commentId/like', function (req, res) {
    var updateOperation = {
        '$pull': {
            'likes': {
                'userId': req.user.id
            }
        }
    };

    Comments.update({_id: req.params.commentId}, updateOperation, function (err, pullResult) {
        if (err){
            console.log(err);
            return res.badRequest("Some error occurred");
        }

        Comments.findById(req.params.commentId, function (err, comment) {
            if (err){
                return res.serverError("Something unexpected happened");
            }

            comment.likes.push({userId: req.user.id});
            comment.save(function (err) {
                if (err) {
                    return res.serverError("Something unexpected happened");
                }

                res.success({liked: true});
            })
        });
    });
});

router.delete('/:commentId/like', function (req, res) {
    var updateOperation = {
        '$pull': {
            'likes': {
                'userId': req.user.id
            }
        }
    };

    Comments.update({_id: req.params.commentId}, updateOperation, function (err) {
        if (err) {
            console.log(err);
            return res.badRequest("Some error occurred");
        }

        res.success({liked: false});
    });
});

module.exports = router;