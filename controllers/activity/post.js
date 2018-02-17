var express = require('express');
var router = express.Router();

var Posts = require('../../models/posts');
var arrayUtils = require('../../utils/array');

/*** END POINT FOR GETTING POST OF A USER BY CURRENTLY LOGGED IN USER */
router.get('/', function(req, res) {

    Post.find({postedBy: req.user.id})
        .populate({
            path: 'likes.userId',
            select: 'name photo email coverImageUrl'
        })
        .populate({
            path: 'tagged.userId',
            select:'name photo email coverImageUrl'
        })

        .exec(function (err, post) {

            if (err) {
                return res.badRequest("Something unexpected happened");
            }
            if (!post) {
                return res.success([]);
            }

            var nPost = post.length,
                data ={
                    no_post: nPost,
                    post: post
                };

            res.success(data);
        });
});

/*** END POINT FOR GETTING PROFILE POST OF A USER BY ANOTHER CURRENTLY LOGGED IN USER */
router.get('/:userId', function(req, res) {

    Post.find({postedBy: req.params.userId})
        .populate({
            path: 'likes.userId',
            select: 'name photo email coverImageUrl'
        })
        .populate({
            path: 'tagged.userId',
            select:'name photo email coverImageUrl'
        })

        .exec(function (err, post) {

            if (err) {
                return res.badRequest("Something unexpected happened");
            }
            if (!post) {
                return res.success([]);
            }

            res.success(post);
        });
});

/*** END POINT FOR GETTING PROFILE POST OF A USER BY ANOTHER CURRENTLY LOGGED IN USER */
router.get('/:postId', function (req,res) {
    Posts.findById(req.params.postId)
        .populate({
            path: 'postedBy',
            select:'name photo'
        })
        .exec(function(err, post) {
            if (err){
                return res.serverError("Something unexpected happened");
            }

            var info = {
                message: post.message,
                mediaUrl: post.mediaUrl,
                mediaType: post.mediaType,
                tags: post.tagged,
                share: post.shares,
                postedBy: post.postedBy,
                likes: post.likes.length,
                comments: post.comments.length
            };

            res.success(info);
        });
});

/*** END POINT FOR GETTING PROFILE POST OF A USER BY ANOTHER CURRENTLY LOGGED IN USER */
router.post('/', function (req, res) {
    var message = req.body.message;
    var mediaUrl = req.body.mediaUrl;
    var mediaType = req.body.mediaType;
    var tags = req.body.tagged;

    if (message && typeof(message) !== 'string'){
        return res.badRequest('message is required');
    }
    if (typeof(mediaUrl) !== 'string'){
        return res.badRequest('mediaUrl is required');
    }
    if (typeof(mediaType) !== 'string'){
        return res.badRequest('mediaType is required');
    }
    if (tags && !Array.isArray(tags)){
        return res.badRequest('Tagged should be a json array of user Ids (string)')
    }

    var values = {
        mediaUrl: mediaUrl,
        mediaType: mediaType,
        postedBy:  req.user.id
};

    if (message){
        values.message = message;
    }

    if (tags){
        //remove duplicates before proceeding
        arrayUtils.removeDuplicates(tags);

        values.tagged = []; //new empty array
        for (var i = 0; i < tags.length ; i++){
            var userId = tags[i];

            if (typeof(userId) !== "string"){
                return res.badRequest("User IDs in tagged array must be string");
            }

            values.tagged.push({userId: userId});
        }
    }

    Posts.create(values, function (err, post) {
        if (err){
            console.log(err);
            return res.serverError("Something unexpected happened");
        }

        res.success({postId: post._id});
    });
});

/*** END POINT FOR GETTING PROFILE POST OF A USER BY ANOTHER CURRENTLY LOGGED IN USER */
router.put('/:postId', function (req, res) {

    var message = req.body.message,
        postedBy =  req.user.id,
        tags = req.body.tagged;

    if (!(message || tags)){
        return res.badRequest("please enter values to fields you will love to be updated");
    }
    if (message && typeof(message) !== 'string') {
        return res.badRequest('message is required');
    }
    if (tags && !Array.isArray(tags)){
        return res.badRequest('Tagged should be a json array of user Ids (string)')
    }

    var values = {};
    values.postedBy = postedBy;

    if (message){
        values.message = message;
    }
    if (tags) {
        //remove duplicates before proceeding
        arrayUtils.removeDuplicates(tags);

        values.tagged = []; //new empty array
        for (var i = 0; i < tags.length; i++) {
            var userId = tags[i];

            if (typeof(userId) !== "string") {
                return res.badRequest("User IDs in tagged array must be string");
            }

            values.tagged.push({userId: userId});
        }
    }

    var currentPost = {
        _id: req.params.postId ,
        "post.postedBy": req.user.id
    };

    User.update(currentPost, {$set: {'post.$': values}}, function (err, result) {
        if (err) {
            console.log(err);
            return res.serverError("Something unexpected happened");
        }

        res.success(result);
    });
    // Posts.findAndModify({query: {_id: req.params.postId, postedBy: req.user.id}}, {$set: values}, function (err, post) {
    //
    //     if (err) {
    //         return res.serverError("Something unexpected happened");
    //     }
    //
    //     res.success(post);
    // });
});

/*** END POINT FOR GETTING PROFILE POST OF A USER BY ANOTHER CURRENTLY LOGGED IN USER */
router.post('/:postId/like', function (req, res) {
    var updateOperation = {
        '$pull': {
            'likes': {
                'userId': req.user.id
            }
        }
    };

    Posts.update({_id: req.params.postId}, updateOperation, function (err, pullResult) {
        if (err){
            console.log(err);
            return res.badRequest("Some error occurred");
        }

        Posts.findById(req.params.postId, function (err, post) {
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
router.post('/:postId/like', function (req, res) {
    var updateOperation = {
        $addToSet: {
            likes: {
                userId: req.user.id
            }
        }
    };

    Posts.update({_id: req.params.postId}, updateOperation, function (err, pullResult) {
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
router.delete('/:postId/like', function (req, res) {
    var updateOperation = {
        '$pull': {
            'likes': {
                'userId': req.user.id
            }
        }
    };

    Posts.update({_id: req.params.postId}, updateOperation, function (err) {
        if (err) {
            console.log(err);
            return res.badRequest("Some error occurred");
        }

        res.success({liked: false});
    });
});

module.exports = router;