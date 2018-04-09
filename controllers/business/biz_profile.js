const express = require('express');
let router = express.Router();
const moment = require('moment');

let cloudinary = require('cloudinary');
const config = require("../../config.js");
cloudinary.config(config.cloudinary);

const Business = require('../../models/business');
const validator = require('../../utils/validator');
let User = require('../../models/user');
let Rating = require('../../models/ratings');
let arrayUtils = require('../../utils/array');

/*** END POINT FOR GETTING BUSINESSES BY THEIR CATEGORIES LOGGED IN USER */
router.get('/', function (req, res) {

    Business.aggregate([
            {$unwind: "$categoryTags"},
            {$group: {
                _id: "$categoryTags",
                total: {$sum:1}
                }
            }
        ]
        , function (err, user) {
            if (err) {
                console.log(err);

                return res.badRequest("Something unexpected happened");
            }

            // Rating.populate(user, {
            //             path: 'rating'
            //             // select:'name photo email coverImageUrl'
            // ,function(err, user) {
            //
            //             if (err) {
            //                 console.log(err)
            //                 return res.badRequest("Something unexpected happened");
            //             }
            //         console.log(user)
            res.success(user);

        }

        // Business.findById(bizId)
        //     .populate({
        //         path: 'followers.userId',
        //         select:'name photo email coverImageUrl'
        //     })
        //     .populate({
        //         path: 'following.userId',
        //         select:'name photo email coverImageUrl'
        //     })
        //     .populate({
        //         path:'rating.userId',
        //         select:'name photo email coverImageUrl'
        //     })
        //     .exec(function(err, user) {
        //
        //         if (err) {
        //             return res.badRequest("Something unexpected happened");
        //         }
        //         if (!user) {
        //             return res.badRequest("YOU NEED TO BE A REGISTERED USER TO VIEW GET ACCESS");
        //         }
        //
        //         let info = {
        //             coverImageUrl: user.coverImageUrl,
        //             photo: user.photoUrl,
        //             name: user.name,
        //             email: user.email,
        //             username: user.username,
        //             phone_number: user.phone_number,
        //             address: user.address,
        //             bio: user.bio,
        //             status: user.status,
        //             nFollowers: user.followers.length,
        //             nFollowing: user.following.length,
        //             followers: user.followers,
        //             following: user.following,
        //             rating: user.rating
        //         };
        //
        //         res.success(info);
        //     });
    )
});

/*** END POINT FOR GETTING PERSONAL PROFILE BY CURRENTLY LOGGED IN USER */
router.get('/:catId', function (req, res) {

    let catId = req.params.catId;

    Business.aggregate([
            {$unwind: "$categoryTags"},
            {$match: {"categoryTags.categoryId": catId}},
            {$project: {createdBy:1,following:1,followers:1,biz_name:1,categoryTags:1}},
            {
                $lookup: {
                    from: "ratings",
                    localField: "_id",
                    foreignField:"businessId",
                    as: "Rating"
                }
            }

        ]
        , function (err, user) {
            if (err) {
                console.log(err);
                return res.badRequest("Something unexpected happened");
            }

            Business.populate(user, {
                    'path': 'following.userId createdBy categoryTags.categoryId',
                    'select': 'name photoUrl email coverImageUrl title'
                }, function (err, user) {

                if (err) {
                    console.log(err);
                    return res.badRequest("Something unexpected happened");
                }
                if (!user) {
                    return res.badRequest("YOU NEED TO BE A REGISTERED USER TO VIEW GET ACCESS");
                }

                res.success(user);
            })
        })
});

/*** END POINT FOR GETTING PERSONAL PROFILE BY CURRENTLY LOGGED IN USER */
// router.get('/:id', function (req, res) {
//
//     let bizId = req.params.id,
//         id = req.user.id;
//     Business.aggregate([
//         {$match: {"id": bizId}},
//             {
//                 $lookup: {
//                     from: "ratings",
//                     localField: "bizId",
//                     foreignField: "bizId",
//                     as: "Rating"
//                 }
//             },
//             {$unwind: {path: "$Rating", preserveNullAndEmptyArrays: true}}
//         ], function (err, user) {
//             if (err) {
//                 return res.badRequest("Something unexpected happened");
//             }
//         Business.populate(user, {
//             'path': 'following.userId createdBy categoryTags.categoryId',
//             'select': 'name photoUrl email coverImageUrl title'
//         }, function (err, user) {
//
//             if (err) {
//                 console.log(err);
//                 return res.badRequest("Something unexpected happened");
//             }
//             if (!user) {
//                 return res.badRequest("YOU NEED TO BE A REGISTERED USER TO VIEW GET ACCESS");
//             }
//
//             res.success(user);
//         })
//     })
// });

/*** END POINT FOR GETTING PERSONAL PROFILE BY CURRENTLY LOGGED IN USER */
router.get('/:id', function (req, res) {

    let bizId = req.params.id,
        id = req.user.id;
    Business.aggregate([
            {
                $match: {
                    _id: "id"
                }
            },
            {
                $lookup: {
                    from: "ratings",
                    localField: "bizId",
                    foreignField: "bizId",
                    as: "Rating"
                }
            },
            {$unwind: {path: "$Rating", preserveNullAndEmptyArrays: true}}
        ]
        , function (err, user) {
            if (err) {
                return res.badRequest("Something unexpected happened");
            }
            console.log(user);

            // Rating.populate(user, {
            //             path: 'rating'
            //             // select:'name photo email coverImageUrl'
            // ,function(err, user) {
            //
            //             if (err) {
            //                 console.log(err)
            //                 return res.badRequest("Something unexpected happened");
            //             }
            //         console.log(user)
            res.success(user);

        }

        // Business.findById(bizId)
        //     .populate({
        //         path: 'followers.userId',
        //         select:'name photo email coverImageUrl'
        //     })
        //     .populate({
        //         path: 'following.userId',
        //         select:'name photo email coverImageUrl'
        //     })
        //     .populate({
        //         path:'rating.userId',
        //         select:'name photo email coverImageUrl'
        //     })
        //     .exec(function(err, user) {
        //
        //         if (err) {
        //             return res.badRequest("Something unexpected happened");
        //         }
        //         if (!user) {
        //             return res.badRequest("YOU NEED TO BE A REGISTERED USER TO VIEW GET ACCESS");
        //         }
        //
        //         let info = {
        //             coverImageUrl: user.coverImageUrl,
        //             photo: user.photoUrl,
        //             name: user.name,
        //             email: user.email,
        //             username: user.username,
        //             phone_number: user.phone_number,
        //             address: user.address,
        //             bio: user.bio,
        //             status: user.status,
        //             nFollowers: user.followers.length,
        //             nFollowing: user.following.length,
        //             followers: user.followers,
        //             following: user.following,
        //             rating: user.rating
        //         };
        //
        //         res.success(info);
        //     });
    )
});

/*** END POINT FOR UPDATING PROFILE INFORMATION OF CURRENTLY LOGGED IN USER */
router.post('/:bizId', function (req, res) {

    let about_biz = req.body.about_biz,
        bio = req.body.bio,
        country = req.body.country,
        city = req.body.city,
        state = req.body.state,
        status = req.body.status,
        bizId = req.params.bizId,
        cate_tags = req.body.cate_tags;

    if (!(about_biz ||cate_tags || bio || country || city || status || state )) {
        return res.badRequest('Please input the value to the field you would love to update');
    }
    let profile = {};

    if (bio) {
        let vBio = validator.isSentence(res, bio);
        if (!vBio)
            return;
        profile.bio = bio;
    }
    if (country) {
        let vCountry = validator.isWord(res, country);
        if (!vCountry)
            return;
        profile.country = country;
    }
    if (city) {
        let vCity = validator.isWord(res, city);
        if (!vCity)
            return;
        profile.city = city;
    }
    if (state) {
        let vstate = validator.isWord(res, state);
        if (!vstate)
            return;
        profile.state = state;
    }
    if (status) {
        let vStatus = validator.isSentence(res, status);
        if (!vStatus)
            return;
        profile.status = status;
    }
    if (about_biz) {
        let fullName = validator.isSentence(res, about_biz);
        if (!fullName)
            return;
        profile.about_biz = about_biz;
    }
    if (cate_tags) {
        let fullName = validator.isCategory(res, cate_tags);
        if (!fullName)
            return;
        arrayUtils.removeDuplicates(cate_tags);

        let categoryTags = []; //new empty array
        for (let i = 0; i < cate_tags.length ; i++){
            let cateId = cate_tags[i];

            if (typeof(cateId) !== "string"){
                return res.badRequest("category IDs in tagged array must be string");
            }
            categoryTags.push({categoryId: cateId});
        }

        profile.categoryTags = categoryTags;
    }

    Business.findOneAndUpdate(
        {createdBy: req.user.id, _id: bizId},
        {$set: profile},
        {new: true})
        .populate({
            path: 'followers.userId',
            select: 'name photo email coverImageUrl'
        })
        .populate({
            path: 'following.userId',
            select: 'name photo email coverImageUrl'
        })
        .populate({
            path: 'categoryTags.categoryId',
            select: 'title'
        })
        .populate({
            path: 'createdBy',
            select: 'name photo'
        })
        .exec(function (err, biz) {
            if (err) {
                console.log(err);
                return res.serverError("Something unexpected happened");
            }
            if (biz === null) {
                console.log(err);
                return res.notAllowed("you are not allowed to make modifications to this profile");
            }

            let data = {
                biz_name: biz.biz_name,
                about_biz: biz.about_biz,
                country: biz.country,
                state: biz.state,
                city: biz.city,
                following: biz.following,
                followers: biz.followers,
                category: biz.categoryTags,
                address: biz.address,
                biz_numbers: biz.biz_numbers,
                createdBy: biz.createdBy,
                email: biz.email,
            };
            res.success(data);
        });
});

/*** END POINT FOR UPDATING PROFILE USERNAME OF CURRENTLY LOGGED IN USER */
router.post('/bName/:bizId', function (req, res) {

    let biz_name = req.body.biz_name.toLowerCase(),
        bizId = req.params.bizId,
        id = req.user.id;

    let valid = validator.isWord(res, biz_name);
    if (!valid) return;

    Business.findOne({biz_name: biz_name}, function (err, result) {
        if (err) {
            console.log(err);
            return res.serverError("Something unexpected happened");
        }
        if (result && result.createdBy !== req.user.id) {
            return res.badRequest("A Business already exist with this Business Name: " + biz_name);
        }
        if (result && result.createdBy === req.user.id) {
            return res.badRequest("you are already using this name chose a new name");
        }
        nameUpdate(bizId, biz_name, id, function (err, result) {
            if (err) {
                res.badRequest(err);
            } else {
                let data = {
                    biz_name: result.biz_name,
                    about_biz: result.about_biz,
                    country: result.country,
                    state: result.state,
                    city: result.city,
                    following: result.following,
                    followers: result.followers,
                    category: result.categoryTags,
                    address: result.address,
                    biz_numbers: result.biz_numbers,
                    createdBy: result.createdBy,
                    email: result.email,
                };
                res.success(data);
            }
        })
    });
});

/*** END POINT FOR UPDATING PROFILE PHONE NUMBER OF CURRENTLY LOGGED IN USER */
router.post('/bNumber/:bizId', function (req, res) {

    let data = {
        phone_number: req.body.phone_number,
        number_type: req.body.number_type
    };

    let bizId = req.params.bizId,
        id = req.user.id;
    let validPnum = validator.isValidPhoneNumber(res, data.phone_number) &&
                    validator.isWord(res, data.number_type);
    if (!validPnum) return;

    // Business.findById(bizId, function (err, result) {
    //     if (err) {
    //         console.log(err);
    //         return res.serverError("Something unexpected happened");
    //     }
    //     if (result && result.createdBy !== id) {
    //         return res.badRequest("You are not authorised and can not make modification to this profile");
    //     }
    mongoQuery(bizId, id, function (err, result) {
        if (err) {
            console.log(err);
            return res.serverError(err);
        }
        result.biz_numbers.push(data);
        result.save(function (err, result) {
            if (err) {
                console.log(err);
                return res.serverError("Something unexpected happened");
            }

            res.success({numberId: result.biz_numbers[result.biz_numbers.length - 1]._id, success: true});
        });
    })
});

/*** END POINT FOR UPDATING PHONE NUMBER BY THE PHONE NUMBER ID OF CURRENTLY LOGGED IN USER */
// router.put('/bNumber/:bizId/:numberId', function (req, res) {
//
//     let phone_number = req.body.phone_number,
//         number_type = req.body.number_type,
//         bizId = req.params.bizId,
//         numberId = req.params.numberId,
//         id = req.user.id;
//
//     let update = {};
//
//     // update.numberId = numberId;
//
//     if (phone_number) {
//         let validPnum = validator.isValidPhoneNumber(res, phone_number);
//         if (!validPnum) return;
//         update.phone_number = phone_number;
//     }
//     if (number_type) {
//         let validnumber_type = validator.isWord(res, number_type);
//         if (!validnumber_type) return;
//         update.number_type = number_type;
//     }
//     Business.update({
//         "_id": bizId,
//         "createdBy": id,
//         'biz_numbers._id': numberId
//     },
//      {$set: {'biz_numbers.$.phone_number': phone_number}}, function (err, result) {
//         if (err) {
//             console.log(err);
//             return res.serverError("Something unexpected happened");
//         }
//
//         res.success(result, {success: true});
//     });
// });
router.put('/bNumber/:bizId/:numberId', function (req, res) {

    let phone_number = req.body.phone_number,
        number_type = req.body.number_type,
        bizId = req.params.bizId,
        numberId = req.params.numberId,
        id = req.user.id;

    let update = {};

    // update.numberId = numberId;

    if (phone_number) {
        let validPnum = validator.isValidPhoneNumber(res, phone_number);
        if (!validPnum) return;
        update.phone_number = phone_number;
    }
    if (number_type) {
        let validnumber_type = validator.isWord(res, number_type);
        if (!validnumber_type) return;
        update.number_type = number_type;
    }
    Business.updateOne({
            "_id": bizId,
            "createdBy": id,
            "biz_numbers": {
                "$elemMatch": {
                    "_id": numberId
                }
            }
            // 'biz_numbers._id': numberId
        }, {$set: {'biz_numbers.$': update}}, function (err, result) {
            if (err) {
                console.log(err);
                return res.serverError("Something unexpected happened");
            }

            res.success(result, {success: true});
        });
});

/*** END POINT FOR DELETING PHONE NUMBER BY THE PHONE NUMBER ID OF CURRENTLY LOGGED IN USER */
router.delete('/bNumber/:bizId/:numberId', function (req, res) {

    let bizId = req.params.bizId,
        numberId = req.params.numberId,
        id = req.user.id;

    mongoQuery(bizId, id, function (err, result) {
        if (err) {
            console.log(err);
            return res.serverError("Something unexpected happened");
        }
        if (!result) {
            return res.badRequest("Business not found");
        }
        result.biz_numbers.id(numberId).remove();
        result.save(function (err, result) {
            if (err) {
                return res.serverError("Something unexpected happened");
            }
            res.success("Measurement deleted successfully");
        });
    });
});

/*** END POINT FOR UPDATING PROFILE PICTURE OF CURRENTLY LOGGED IN USER */
router.post('/photo', function (req, res) {

    let file = req.files.null;
    console.log(file.path);

    let validated = validator.isFile(res, file);
    if (!validated)
        return;

    cloudinary.v2.uploader.upload(file.path, function (err, result) {
        if (err) {
            return res.badRequest(err);
        } else {
            let photoUrl = result.url;

            Business.findByIdAndUpdate(req.user.id, {$set: {biz_logo: photoUrl}}, {new: true})
                .populate({
                    path: 'followers.userId',
                    select: 'name photo email coverImageUrl'
                })
                .populate({
                    path: 'following.userId',
                    select: 'name photo email coverImageUrl'
                })
                .exec(function (err, user) {
                        if (err) {
                            console.log(err);
                            return res.serverError("Something unexpected happened");
                        }
                        if (!user) {
                            return res.badRequest("User profile not found please be sure you are still logged in");
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
                            d_o_b: user.d_o_b,
                            followers: user.followers,
                            following: user.following
                        };
                        res.success(info);
                    }
                )
        }
    });
    // fs.unlink(file);
});

/*** END POINT FOR UPDATING SOCIAL LINKS OF CURRENTLY LOGGED IN USER */
router.post('/social', function (req, res) {

    let social_media = req.body.social_media,
        social_handle = req.body.social_handle;

    let validated = validator.isWord(res, social_media) &&
        validator.isWord(res, social_handle);
    if (!validated) return;

    Business.findByIdAndUpdate(req.user.id, {$set: profileUrl}, {new: true})
        .populate({
            path: 'rating.ratedBy',
            select: 'name photo email coverImageUrl'
        })
        .populate({
            path: 'followers.userId',
            select: 'name photo email coverImageUrl'
        })
        .populate({
            path: 'following.userId',
            select: 'name photo email coverImageUrl'
        })
        .exec(function (err, user) {
                if (err) {
                    console.log(err);
                    return res.serverError("Something unexpected happened");
                }
                if (!user) {
                    return res.badRequest("User profile not found please be sure you are still logged in");
                }

                let info = {
                    coverImageUrl: user.coverImageUrl,
                    photo: user.photoUrl,
                    name: user.name,
                    email: user.email,
                    username: user.username,
                    designer: user.designer,
                    phone_number: user.phone_number,
                    address: user.address,
                    bio: user.bio,
                    status: user.status,
                    measurement: user.measurement,
                    d_o_b: user.d_o_b,
                    followers: user.followers,
                    following: user.following,
                    rating: user.rating
                };

                res.success(info);
            }
        )
});

/*** END POINT FOR UPDATING ADDRESS INFORMATION OF CURRENTLY LOGGED IN USER */
router.post('/address', function (req, res) {

    let street_name = req.body.street_name,
        house_number = req.body.house_number,
        city = req.body.city,
        state = req.body.state,
        country = req.body.country,
        landmark = req.body.landmark,
        geo_location = req.body.geo_location;

    if (typeof(street_name) !== 'string' || street_name.trim().length <= 0) {
        return res.badRequest('street name must be a string and must not be empty');
    }
    if (typeof(house_number) !== 'number') {
        return res.badRequest('house number must be a string and must not be empty');
    }
    if (typeof(geo_location) !== 'string' || geo_location.trim().length <= 0) {
        return res.badRequest('street name must be a string and must not be empty');
    }
    if (typeof(landmark) !== 'string' || landmark.trim().length <= 0) {
        return res.badRequest('landmark must be a string and must not be empty');
    }
    if (typeof(state) !== 'string' || state.trim().length <= 0) {
        return res.badRequest('state must be a string and must not be empty');
    }
    if (country) {
        let vCountry = validator.isCountry(res, country);
        if (!vCountry)
            return;
    }
    if (city) {
        let vCity = validator.isCity(res, city);
        if (!vCity)
            return;
    }
    User.findById(req.user.id, function (err, user) {
        if (err) {
            console.log(err);
            return res.serverError("Something unexpected happened");
        }
        if (!user) {
            return res.badRequest("User profile not found please be sure you are still logged in");
        }

        let address = {
            street_name: street_name,
            house_number: house_number,
            city: city,
            state: state,
            country: country,
            landmark: landmark,
            geo_location: geo_location
        };
        user.address.push(address);
        user.save(function (err, result) {
            if (err) {
                console.log(err);
                return res.serverError("Something unexpected happened");
            }

            res.success(user.address[user.address.length - 1]._id);
        });
    })
});

/*** END POINT FOR UPDATING ADDRESS BY THE ADDRESSS ID OF CURRENTLY LOGGED IN USER */
router.put('/address/:addressId', function (req, res) {

    let street_name = req.body.street_name,
        house_number = req.body.house_number,
        city = req.body.city,
        state = req.body.state,
        country = req.body.country,
        landmark = req.body.landmark,
        geo_location = req.body.geo_location;

    if (typeof(street_name) !== 'string' || street_name.trim().length <= 0) {
        return res.badRequest('street name must be a string and must not be empty');
    }
    if (typeof(house_number) !== 'number') {
        return res.badRequest('house number must be a string and must not be empty');
    }
    if (typeof(geo_location) !== 'string' || geo_location.trim().length <= 0) {
        return res.badRequest('street name must be a string and must not be empty');
    }
    if (typeof(landmark) !== 'string' || landmark.trim().length <= 0) {
        return res.badRequest('landmark must be a string and must not be empty');
    }
    if (typeof(state) !== 'string' || state.trim().length <= 0) {
        return res.badRequest('state must be a string and must not be empty');
    }
    if (country) {
        let vCountry = validator.isCountry(res, country);
        if (!vCountry)
            return;
    }
    if (city) {
        let vCity = validator.isCity(res, city);
        if (!vCity)
            return;
    }
    User.findById(req.user.id, function (err, user) {
        if (err) {
            console.log(err);
            return res.serverError("Something unexpected happened");
        }
        if (!user) {
            return res.badRequest("User profile not found please be sure you are still logged in");
        }

        let address = {
            _id: req.params.addressId,
            street_name: street_name,
            house_number: house_number,
            city: city,
            state: state,
            country: country,
            landmark: landmark,
            geo_location: geo_location
        };
        user.address.push(address);
        user.save(function (err, result) {
            if (err) {
                console.log(err);
                return res.serverError("Something unexpected happened");
            }

            res.success(user.address[user.address.length - 1]._id);
        });
    })
});

/*** END POINT FOR UPDATING PROFILE MEASUREMENT OF CURRENTLY LOGGED IN USER */
router.post('/measurement', function (req, res) {

    let name = req.body.name;
    let value = req.body.value;
    let unit = req.body.unit;

    if (typeof(name) !== 'string') {
        return res.badRequest('Name  required');
    }
    if (typeof(value) !== 'number') {
        return res.badRequest('value is required');
    }
    if (typeof(unit) !== 'string') {
        return res.badRequest('unit  required');
    }

    let measurement = {
        name: name,
        value: value,
        unit: unit
    };

    User.findById(req.user.id, function (err, user) {

        if (err) {
            return res.serverError("Something unexpected happened");
        }
        if (!user) {
            return res.badRequest("To perform this operation u need to be a registered and logged in user");
        }

        user.measurement.push(measurement);
        user.save(function (err, measurement) {
            if (err) {
                return res.serverError("Something unexpected happened");
            }

            res.success(user.measurement[user.measurement.length - 1]._id);
        });
    });
});

/*** END POINT FOR UPDATING MEASUREMENT BY THE MEASUREMENT ID OF CURRENTLY LOGGED IN USER */
router.put('/measurement/:measurementId', function (req, res) {

    let name = req.body.name;
    let value = req.body.value;
    let unit = req.body.unit;

    if (typeof(name) !== 'string') {
        return res.badRequest('Name  required');
    }
    if (typeof(value) !== 'number') {
        return res.badRequest('value is required');
    }
    if (typeof(unit) !== 'string') {
        return res.badRequest('unit  required');
    }

    let measurement = {
        _id: req.params.measurementId,
        name: name,
        value: value,
        unit: unit
    };

    let currentMeasurement = {
        _id: req.user.id,
        "measurement._id": req.params.measurementId
    };

    User.update(currentMeasurement, {$set: {'measurement.$': measurement}}, function (err, result) {
        if (err) {
            console.log(err);
            return res.serverError("Something unexpected happened");
        }

        res.success(result);
    });
});

/*** END POINT FOR DELETING MEASUREMENT BY THE MEASUREMENT ID OF CURRENTLY LOGGED IN USER */
router.delete('/measurement/:measurementId', function (req, res) {

    User.findById(req.user.id, function (err, user) {

        if (err) {
            console.log(err);
            return res.serverError("Something unexpected happened");
        }
        if (!user) {
            return res.badRequest("User profile not set up. Call '/account/signup/complete' to set up profile");
        }

        user.measurement.id(req.params.measurementId).remove();
        user.save(function (err) {
            if (err) {
                return res.serverError("Something unexpected happened");
            }

            res.success("Measurement deleted successfully");
        });
    });
});

function nameUpdate(bizId, biz_name, id, callback) {
    Business.findById(bizId, function (err, data) {

        if (err) {
            console.log(err);
            return callback("Something unexpected happened");
        }
        if (!data) {
            return callback("Business not found");
        }
        if (data.createdBy !== id) {
            return callback("You are not authorised and can not make modification to this profile");
        }
        if (data.biz_name_count === 2 && data.biz_name_next != {$gt: Date.now()}) {
            console.log('im here 2');
            return callback("You have reached the maximum allowable name changes of 2 per month");
        }
        if (data.biz_name_count === 2 && data.biz_name_next != {$lt: Date.now()}) {
            data.biz_name = biz_name;
            data.biz_name_count = 1;
            data.biz_name_next = undefined;
            data.save(function (err, result) {
                if (err) {
                    console.log(err);
                    return callback("Something unexpected happened");
                }
                console.log(result);

                return callback(null, result)
            })
        }
        // if (data.biz_name_count === 1) {
        //     data.biz_name = biz_name;
        //     data.biz_name_count = 2;
        //     data.biz_name_next = Date.now() + 2592000000;
        //     data.save(function (err, result) {
        //         if (err) {
        //             console.log(err);
        //             return callback("Something unexpected happened");
        //         }
        //         console.log(result);
        //
        //         return callback(null, result)
        //     })
        // }
        else {
            data.biz_name = biz_name;
            data.biz_name_count = 1;
            data.save(function (err, result) {
                if (err) {
                    console.log(err);
                    return callback("Something unexpected happened");
                }
                return callback(null, result)
            })
        }
    });
}

function mongoQuery(bizId, id, callback) {
    Business.findOne({_id: bizId, createdBy: id})
        .populate({
            path: 'followers.userId',
            select: 'name photo email coverImageUrl'
        })
        .populate({
            path: 'following.userId',
            select: 'name photo email coverImageUrl'
        })
        .populate({
            path: 'categoryTags.categoryId',
            select: 'title'
        })
        .populate({
            path: 'createdBy',
            select: 'name photo'
        })
        .exec(function (err, data) {
        if (err) {
            console.log(err);
            return callback("Something unexpected happened");
        }
        if (!data) {
            return callback("User not found");
        }

        return callback(null, data)
    })
}

module.exports = router;