let express = require('express');
let router = express.Router();

let Post = require('../../models/posts');

/*** END POINT FOR GETTING PROFILE POST OF A USER BY ANOTHER CURRENTLY LOGGED IN USER */
router.post('/post', function (req, res) {

    let userId = req.user.id;
    let postId = req.params.postId;

    Post.update({
        "_id": postId,
        "likes": {
            "$not": {
                "$elemMatch": {
                    "userId": userId
                }
            }
        }
    }, {
        $addToSet: {
            likes: {
                "userId": userId
            }
        }
    },function (err) {
        if (err) {
            return res.badRequest("Something unexpected happened");
        }
        res.success({following: true});
    });
});

/*** END POINT FOR GETTING PROFILE POST OF A USER BY ANOTHER CURRENTLY LOGGED IN USER */
router.delete('/post', function (req, res) {
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

/*** END POINT FOR GETTING PROFILE POST OF A USER BY ANOTHER CURRENTLY LOGGED IN USER */
router.post('/comment', function (req, res) {
    let userId = req.user.id;
    let postId = req.params.postId;

    Post.update({
        "_id": postId,
        "likes": {
            "$not": {
                "$elemMatch": {
                    "userId": userId
                }
            }
        }
    }, {
        $addToSet: {
            likes: {
                "userId": userId
            }
        }
    },function (err) {
        if (err) {
            return res.badRequest("Something unexpected happened");
        }
        res.success({following: true});
    });
});


/*** END POINT FOR GETTING PROFILE POST OF A USER BY ANOTHER CURRENTLY LOGGED IN USER */
router.post('/comment', function (req, res) {
    let updateOperation = {
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
router.delete('/comment', function (req, res) {
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

module.exports = router;