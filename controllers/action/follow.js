let express = require('express');
let router = express.Router();

let User = require('../../models/user');
let validator = require('../../utils/validator');

router.get('/', function (req,res) {
    User.findById( req.user.id)
        .populate({
            path: 'followers.userId',
            select:'name photoUrl email coverImageUrl'
        })
        .populate({
            path: 'following.userId',
            select:'name photoUrl email coverImageUrl'
        })
        .sort({date: -1})
        .exec(function(err, user) {
            if (err){
                console.log(err);
                return res.serverError("Something unexpected happened");
            }

            let result = {
                followers: user.followers,
                following: user.following
            };

            res.success(result);
        });
});

router.post('/:userId', function (req,res) {

    let followingId = req.params.userId,
        userId = req.user.id;

    if (!followingId) {
        return res.badRequest("Please select a user to follow");
    }
    if (followingId === userId) {
        return res.badRequest("you cannot follow yourself");
    }

    User.update({
        "_id": followingId,
        "followers": {
            "$not": {
                "$elemMatch": {
                    "userId": userId
                }
            }
        }
    }, {
        $addToSet: {
            followers: {
                "userId": userId
            }
        }
    },function (err) {
        if (err) {
            return res.badRequest("Something unexpected happened");
        }
        res.success({following: true});
    });

    User.update({
        "_id": userId,
        "following": {
            "$not": {
                "$elemMatch": {
                    "userId": followingId
                }
            }
        }
    }, {
        $addToSet: {
            following: {
                "userId": followingId
            }
        }
    }, function (err) {
        if (err) {
            return res.badRequest("Something unexpected happened");
        }
        res.success({following: true});
    });
});

router.delete('/unfollow/:userId', function (req,res) {

    let followingId = req.params.userId,
        userId = req.user.id;

    if (!followingId) {
        return res.badRequest("Please select a user to follow");
    }
    if (followingId === userId) {
        return res.badRequest("you cannot follow yourself");
    }

    let updateOperation = {
        '$pull': {
            'followers': {
                'userId': req.user.id
            }
        }
    };

    let updateOperation2 = {
        '$pull': {
            'following': {
                'userId': req.params.userId
            }
        }
    };

    User.update({_id: followingId}, updateOperation, function (err) {
        if (err) {
            console.log(err);
            return res.badRequest("Something unexpected happened");
        }
        res.success({following: false});
    });

    User.update({_id: userId}, updateOperation2, function (err) {
        if (err) {
            return res.badRequest("Something unexpected happened");
        }
        res.success({following: false});
    });
});

module.exports = router;