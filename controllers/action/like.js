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

/*** END POINT FOR GETTING PROFILE POST OF A USER BY ANOTHER CURRENTLY LOGGED IN USER */
// router.post('/post', function (req, res) {
//
//     let userId = req.user.id;
//     let postId = req.params.postId;
//
//     Post.findAndModify({
//         query:{_id: postId},
//         update: {
//             $set: {
//                 likes: {
//                     "userId": userId
//                 }
//             }
//         },
//         arrayFilters:{
//             "likes": {
//                 "userId": userId
//             }
//         },
//         upsert: true,
//         remove: true
//     },function (err) {
//         if (err) {
//             return res.badRequest("Something unexpected happened");
//         }
//         res.success({following: true});
//     });
// });

module.exports = router;