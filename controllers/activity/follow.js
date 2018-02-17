var express = require('express');
var router = express.Router();

var User = require('../../models/user');

router.get('/', function (req,res) {
    User.find(req.user.id)
        .populate({
            path: 'followers.userId',
            select:'name photo email coverImageUrl'
        })
        .populate({
            path: 'following.userId',
            select:'name photo email coverImageUrl'
        })
        .sort({date: -1})
        .exec(function(err, user) {
            if (err){
                return res.serverError("Something unexpected happened");
            }
            var result = {
                followers: user.followers,
                following: user.following
            };
            res.success(result);
        });
});

router.post('/:userId', function (req,res) {

    var updateOperation = {
        '$pull': {
            'followers': {
                'userId': req.user.id
            }
        }
    };

    var updateOperation2 = {
        '$pull': {
            'following': {
                'userId': req.params.userId
            }
        }
    };

    User.update({_id: req.params.userId}, updateOperation, function (err) {
        if (err){
            console.log(err);
            return res.badRequest("Some error occurred");
        }

        var followingId = req.params.userId,
            userId = req.user.id;

        if (followingId === userId) {
            return res.badRequest("you cannot follow yourself");
        }

        User.findById(followingId, function (err, user) {
            if (err) {
                console.log(err);
                return res.badRequest("Something unexpected happened");
            }

            user.followers.push({userId: userId});
            user.save(function (err) {
                if (err) {
                    return res.badRequest("Something unexpected happened");
                }
                res.success({following: true});
            });
        });
    });

    User.update({_id: req.user.id}, updateOperation2, function (err, pullResult) {
        if (err){
            console.log(err);
            return res.badRequest("Some error occurred");
        }

        var followingId = req.params.userId,
            userId = req.user.id;

        if (followingId === userId) {
            return res.badRequest("you cannot follow yourself");
        }

        User.findById(userId, function (err, user) {
            if (err) {
                return res.badRequest("Something unexpected happened");
            }

            user.following.push({userId: followingId});
            user.save(function (err) {
                if (err) {
                    return res.badRequest("Something unexpected happened");
                }
            });
        });
    });
});

module.exports = router;