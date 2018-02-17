var express = require('express');
var router = express.Router();

var User = require('../../models/user');

router.post('/:userId', function (req,res) {

    var rating = req.body.rating,
        userId = req.params.userId,
        ratedBy = req.user.id;

    if (typeof(rating) !== 'number' || (rating < 1 || rating > 5)){
        return res.badRequest('Rating is required and must be between 1 to 5');
    }

    var info = {
        rating: rating,
        ratedBy: ratedBy
    };

    User.findById(userId, function (err, user) {
        if (err) {
            console.log(err);
            return res.badRequest("Something unexpected happened");
        }

        user.rating.push(info);
        user.save(function (err) {
            if (err){
                return res.serverError("Something unexpected happened");
            }

            res.success({rated: true});
        });
    });
});

router.post('/:userId/1', function (req, res) {

    var rating = req.body.rating;

    if (typeof(rating) !== 'number' || (rating < 1 || rating > 5)) {
        return res.badRequest('Rating is required and must be between 1 to 5');
    }

    var newRating = {
        rating: rating,
        ratedBy: req.user.id
    };

    var currentRating = {
        _id: req.params.userId
    };

    User.update(currentRating, {$pull : {"rating.ratedBy": "req.user.id"}}, function (err, pullResult) {
        if (err) {
            console.log(err);
            return res.badRequest("Some error occurred");
        }

        User.findById(req.params.userId, function (err, user) {
            if (err) {
                return res.serverError("Something unexpected happened");
            }

            user.rating.push(newRating);
            user.save(function (err) {
                if (err) {
                    return res.serverError("Something unexpected happened");
                }

                res.success({rated: true});
            })
        });
    });
});

router.post('/:userId/rat', function (req, res) {

    var rating = req.body.rating;

    if (typeof(rating) !== 'number' || (rating < 1 || rating > 5)) {
        return res.badRequest('Rating is required and must be between 1 to 5');
    }

    var newRating = {
        rating: rating,
        ratedBy: req.user.id
    };
    var updateOperation = {
        '$pull': {
            'rating': {
                $elemMatch: {
                    'ratedBy': req.user.id
                }
            }
        }
    };

    User.update({_id: req.params.userId}, updateOperation, function (err, pullResult) {
        if (err){
            console.log(err);
            return res.badRequest("Some error occurred");
        }

        User.findById(req.params.userId, function (err, user) {
            if (err) {
                return res.serverError("Something unexpected happened");
            }

            user.rating.push(newRating);
            user.save(function (err, post) {
                if (err) {
                    return res.serverError("Something unexpected happened");
                }
                res.success(post);
                // res.success({liked: true});
            });
        });
    });
});

module.exports = router;