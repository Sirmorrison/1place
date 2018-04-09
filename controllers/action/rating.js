let express = require('express');
let router = express.Router();

let Rating = require('../../models/ratings');
let User = require('../../models/user');

/*** END POINT FOR GETTING PERSONAL PROFILE BY CURRENTLY LOGGED IN USER */
router.get('/:id', function(req, res) {

    Rating.aggregate([
        {
            $match: {businessId: "$businessId"},
            $order: {
                _id: "$businessId",
                avRating: {$avg: "$rating"},
                totalRating: {$sum: 1},
            }
        }]
    // .populate({
    //     path: 'followers.userId',
    //     select:'name photo email coverImageUrl'
    // })
    // .populate({
    //     path: 'following.userId',
    //     select:'name photo email coverImageUrl'
    // })
        .populate({
            path: 'rating.userId',
            select: 'name photo email coverImageUrl'
        })
        .exec(function (err, user) {

            if (err) {
                return res.badRequest("Something unexpected happened");
            }
            if (!user) {
                return res.badRequest("YOU NEED TO BE A REGISTERED USER TO VIEW GET ACCESS");
            }

            let info = {
                coverImageUrl: user.coverImageUrl,
                photo: user.photoUrl,
                name: user.name,
                email: user.email,
                username: user.username,
                phone_number: user.phone_number,
                address: user.address,
                bio: user.bio,
                status: user.status,
                nFollowers: user.followers.length,
                nFollowing: user.following.length,
                followers: user.followers,
                following: user.following,
                rating: user.rating
            };

            res.success(info);
        })
    )
});

router.post('/:bizId', function (req,res) {

    let rating = req.body.rating,
        businessId = req.params.businessId,
        ratedBy = req.user.id;

    if (typeof(rating) !== 'number' || (rating < 1 || rating > 5)){
        return res.badRequest('Rating is required and must be between 1 to 5');
    }

    let info = {
        rating: rating,
        ratedBy: ratedBy,
        businessId: businessId
    };

    User.findById(ratedBy, function (err, user) {
        if (err) {
            console.log(err);
            return res.badRequest("Something unexpected happened");
        }
        if(!user){
            return res.badRequest("User not found with your ID");
        }
        Rating.create(info, function (err, rating) {
            if (err) {
                console.log(err);
                return res.badRequest("Something unexpected happened");
            }

            res.success(rating);
        // let rating = new Rating();
        //     rating.rating = rating;
        //     rating.ratedBy = ratedBy;
        //     rating.businessId = businessId;
        //     rating.save();
        });
    });
});

// router.post('/:userId/1', function (req, res) {
//
//     let rating = req.body.rating;
//
//     if (typeof(rating) !== 'number' || (rating < 1 || rating > 5)) {
//         return res.badRequest('Rating is required and must be between 1 to 5');
//     }
//
//     let newRating = {
//         rating: rating,
//         ratedBy: req.user.id
//     };
//
//     let currentRating = {
//         _id: req.params.userId
//     };
//
//     User.update(currentRating, {$pull : {"rating.ratedBy": "req.user.id"}}, function (err, pullResult) {
//         if (err) {
//             console.log(err);
//             return res.badRequest("Some error occurred");
//         }
//
//         User.findById(req.params.userId, function (err, user) {
//             if (err) {
//                 return res.serverError("Something unexpected happened");
//             }
//
//             user.rating.push(newRating);
//             user.save(function (err) {
//                 if (err) {
//                     return res.serverError("Something unexpected happened");
//                 }
//
//                 res.success({rated: true});
//             })
//         });
//     });
// });

// router.post('/:userId/rat', function (req, res) {
//
//     let rating = req.body.rating;
//
//     if (typeof(rating) !== 'number' || (rating < 1 || rating > 5)) {
//         return res.badRequest('Rating is required and must be between 1 to 5');
//     }
//
//     let newRating = {
//         rating: rating,
//         ratedBy: req.user.id
//     };
//     let updateOperation = {
//         '$pull': {
//             'rating': {
//                 $elemMatch: {
//                     'ratedBy': req.user.id
//                 }
//             }
//         }
//     };
//
//     User.update({_id: req.params.userId}, updateOperation, function (err, pullResult) {
//         if (err){
//             console.log(err);
//             return res.badRequest("Some error occurred");
//         }
//
//         User.findById(req.params.userId, function (err, user) {
//             if (err) {
//                 return res.serverError("Something unexpected happened");
//             }
//
//             user.rating.push(newRating);
//             user.save(function (err, post) {
//                 if (err) {
//                     return res.serverError("Something unexpected happened");
//                 }
//                 res.success(post);
//                 // res.success({liked: true});
//             });
//         });
//     });
// });

module.exports = router;