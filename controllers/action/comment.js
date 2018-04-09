let express = require('express');
let router = express.Router();

// let Comments = require('../../models/comments');
let Post = require('../../models/posts');

/*** END POINT FOR GETTING PROFILE POST OF A USER BY ANOTHER CURRENTLY LOGGED IN USER */
router.post('/', function (req, res) {
    let updateOperation = {
        '$pull': {
            'likes': {
                'userId': req.user.id
            }
        }
    };

    Post.update({_id: req.params.postId}, updateOperation, function (err, pullResult) {
        if (err){
            console.log(err);
            return res.badRequest("Some error occurred");
        }

        Post.findById(req.params.postId, function (err, post) {
            if (err) {
                return res.serverError("Something unexpected happened");
            }

            post.likes.push({userId: req.user.id});
            post.save(function (err, post) {
                if (err) {
                    return res.serverError("Something unexpected happened");
                }
                res.success(post);
                // res.success({liked: true});
            });
        });
    });
});

/*** END POINT FOR GETTING PROFILE POST OF A USER BY ANOTHER CURRENTLY LOGGED IN USER */
router.post('/', function (req, res) {
    let updateOperation = {
        $addToSet: {
            likes: {
                userId: req.user.id
            }
        }
    };

    Post.update({_id: req.params.postId}, updateOperation, function (err, pullResult) {
        if (err){
            console.log(err);
            return res.badRequest("Some error occurred");
        }

        console.log(pullResult);

        res.success({liked: false});

        // Posts.findById(req.params.postId, function (err, post) {
        //     if (err) {
        //         return res.serverError("Something unexpected happened");
        //     }
        //
        //     post.likes.push({userId: req.user.id});
        //     post.save(function (err, post) {
        //         if (err) {
        //             return res.serverError("Something unexpected happened");
        //         }
        //         res.success(post);
        //         // res.success({liked: true});
        //     });
        // });
    });
});

/*** END POINT FOR GETTING PROFILE POST OF A USER BY ANOTHER CURRENTLY LOGGED IN USER */
router.delete('/', function (req, res) {
    let updateOperation = {
        '$pull': {
            'likes': {
                'userId': req.user.id
            }
        }
    };

    Post.update({_id: req.params.postId}, updateOperation, function (err) {
        if (err) {
            console.log(err);
            return res.badRequest("Some error occurred");
        }

        res.success({liked: false});
    });
});

// router.get('/', function (req,res) {
//
//     Comments.find({})
//         .populate({
//             path: 'commentBy',
//             select:'name photo'
//         })
//         .sort({date: -1})
//         .exec(function(err, comment) {
//             if (err){
//                 return res.serverError("Something unexpected happened");
//             }
//
//             res.success(comment);
//         });
// });
//
// router.post('/', function (req, res) {
//     let comment = req.body.comment,
//         postId = req.body.postId;
//
//     if (typeof(comment) !== 'string'){
//         return res.badRequest('comment is required');
//     }
//     if (typeof(postId) !== 'string'){
//         return res.badRequest('postId is required');
//     }
//
//     let values ={
//         comment: comment,
//         commentBy: req.user.id,
//         postId: postId
//     };
//
//     Comments.create(values, function (err, comment) {
//         if (err){
//             console.log(err);
//             return res.serverError("Something unexpected happened");
//         }
//
//         res.success({postId: comment._id});
//     });
// });
//
// router.get('/:commentId', function (req,res) {
//     Comments.findById(req.params.commentId)
//         .populate({
//             path: 'commentedBy',
//             select:'name photo'
//         })
//         .exec(function(err, comment) {
//             if (err){
//                 return res.serverError("Something unexpected happened");
//             }
//
//             let info = {
//                 comment: comment.comment,
//                 commentedBy: comment.commentedBy,
//                 likes: comment.likes.length
//             };
//
//             res.success(info);
//         });
// });
//
// router.put('/:commentId', function (req, res) {
//
//     let comment = req.body.comment,
//         postId = req.body.postId;
//
//
//     if (typeof(comment) !== 'string'){
//         return res.badRequest('comment is required');
//     }
//     if (typeof(postId) !== 'string'){
//         return res.badRequest('postId is required');
//     }
//
//     let values ={
//         comment: comment,
//         commentBy: req.user.id,
//         postId: postId
//     };
//
//     Comments.findByIdAndUpdate({_id: req.params.commentId, commentedBy: req.user.id} , {$set: values}, {new: true}, function (err, comment) {
//
//         if (err) {
//             return res.serverError("Something unexpected happened");
//         }
//         // if (comment.commentedBy !== req.user.id) {
//         //     return res.unauthorized("YOU ARE NOT AUTHORIZED TO PERFORM THIS ACTION");
//         // }
//
//         res.success(comment);
//     });
// });
//
// router.delete('/:commentId', function (req, res) {
//     Comments.findById(req.params.commentId, function (err, comment) {
//
//         if (err){
//             return res.serverError("Something unexpected happened");
//         }
//         if (comment.commentedBy !== req.user.id){
//             return res.unauthorized("YOU ARE NOT AUTHORIZED TO PERFORM THIS ACTION");
//         }
//
//         comment.remove(function (err) {
//             if (err){
//                 return res.serverError("Something unexpected happened");
//             }
//
//             res.success("Post was deleted Successfully");
//         });
//     });
// });
//
// router.post('/:commentId/like', function (req, res) {
//     let updateOperation = {
//         '$pull': {
//             'likes': {
//                 'userId': req.user.id
//             }
//         }
//     };
//
//     Comments.update({_id: req.params.commentId}, updateOperation, function (err, pullResult) {
//         if (err){
//             console.log(err);
//             return res.badRequest("Some error occurred");
//         }
//
//         Comments.findById(req.params.commentId, function (err, comment) {
//             if (err){
//                 return res.serverError("Something unexpected happened");
//             }
//
//             comment.likes.push({userId: req.user.id});
//             comment.save(function (err) {
//                 if (err) {
//                     return res.serverError("Something unexpected happened");
//                 }
//
//                 res.success({liked: true});
//             })
//         });
//     });
// });
//
// router.delete('/:commentId/like', function (req, res) {
//     let updateOperation = {
//         '$pull': {
//             'likes': {
//                 'userId': req.user.id
//             }
//         }
//     };
//
//     Comments.update({_id: req.params.commentId}, updateOperation, function (err) {
//         if (err) {
//             console.log(err);
//             return res.badRequest("Some error occurred");
//         }
//
//         res.success({liked: false});
//     });
// });

module.exports = router;