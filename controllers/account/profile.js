const express = require('express');
const router = express.Router();
const moment = require('moment');
let fs = require('fs');

const config = require('../../config'),
      FirebaseAuth = require('firebaseauth'),
      firebase = new FirebaseAuth(config.FIREBASE_API_KEY);

let cloudinary = require('cloudinary');
    cloudinary.config(config.cloudinary);

let validator = require('../../utils/validator'),
    User = require('../../models/user');

/*** END POINT FOR GETTING PERSONAL PROFILE BY CURRENTLY LOGGED IN USER */
router.get('/', function(req, res) {

    let id = req.user.id;

    User.aggregate([
        {$match: {_id: id}},
        {
            $lookup: {
                from: "posts",
                localField: "id",
                foreignField:"postedBy.userId",
                as: "Post"
            }
        },
        {
            $lookup: {
                from: "comments",
                localField: "id",
                foreignField: "commentedBy.userId",
                as: "Comment"
            }
        },
        // {
        //     $lookup: {
        //         from: "Comment",
        //         localField: "postId",
        //         foreignField: "postId",
        //         as: "comment"
        //     }
        // },
        {$unwind: {path: "$post", preserveNullAndEmptyArrays: true}},
        {$unwind: {path: "$comment", preserveNullAndEmptyArrays: true}}
    ], function (err, data) {
        if (err) {
            console.log(err);
            return res.badRequest("Something unexpected happened");
        }
        // res.success(data);

        //noinspection JSDuplicatedDeclaration
        User.populate(data,{
                'path': 'followers.userId following.userId',
                'select': 'name photoUrl email coverImageUrl'
        },
        // User.populate(data, {
        //     'path': 'following.userId',
        //     'select': 'name photoUrl email coverImageUrl'
        // },
        function (err, user) {

            if (err) {
                console.log(err);
                return res.badRequest("Something unexpected happened");
            }
            if (!user) {
                return res.badRequest("YOU NEED TO BE A REGISTERED USER TO VIEW GET ACCESS");
            }

            let info = {$elemMatch: {
                coverImageUrl: user.coverImageUrl,
                photo: user.photoUrl,
                name: user.name,
                email: user.email,
                username: user.username,
                phone_number: user.phone_number,
                address: user.address,
                bio: user.bio,
                status: user.status,
                d_o_b: moment(user.d_o_b),
                nFollowers: user.followers.length,
                nFollowing: user.following.length,
                followers: user.followers.userId,
                following: user.following,
                post: user.post,
                comments: user.comments
            },

            };
            res.success(info);
        });
    });
});

/*** END POINT FOR GETTING PROFILE OF A USER BY ANOTHER CURRENTLY LOGGED IN USER */
router.get('/:userId', function(req, res){

    User.findById(req.params.userId)
        .populate({
            path: 'followers.userId',
            select:'name photo email coverImageUrl'
        })
        .populate({
            path: 'following.userId',
            select:'name photo email coverImageUrl'
        })
        .exec(function(err, user) {
            if (err){
                return res.badRequest("Something unexpected happened");
            }
            if (!user) {
                return res.badRequest("could not find user with id: "+ req.params.userId);
            }

            let d_o_b = moment(user.d_o_b),

                info = {
                    coverImageUrl: user.coverImageUrl,
                    photo: user.photoUrl,
                    name: user.displayName,
                    email: user.email,
                    username: user.username,
                    phone_number: user.phone_number,
                    address: user.address,
                    bio: user.bio,
                    status: user.status,
                    d_o_b: d_o_b,
                    nFollowers: user.followers.length,
                    nFollowing: user.following.length,
                    followers: user.followers,
                    following: user.following
                };

        res.success(user);
    });
});

/*** END POINT FOR UPDATING PROFILE INFORMATION OF CURRENTLY LOGGED IN USER */
router.post('/update', function(req, res){

    let name = req.body.name,
        address = req.body.address,
        bio = req.body.bio,
        country = req.body.country,
        city = req.body.city,
        gender = req.body.gender,
        status = req.body.status;

    if (!(name || address || bio || country || city || status || gender )){
        return res.badRequest('Please input the value to the field you would love to update');
    }

    let profile = {};

    if (bio){
        let vBio = validator.isSentence(res, bio);
        if(!vBio)
            return;
        profile.bio = bio;
    }
    if (country){
        let vCountry = validator.isWord(res, country);
        if(!vCountry)
            return;
        profile.country = country;
    }
    if (city){
        let vCity = validator.isWord(res, city);
        if(!vCity)
            return;
        profile.city = city;
    }
    if (gender){
        let vGender = validator.isWord(res, gender);
        if(!vGender)
            return;
        profile.gender = gender;
    }
    if (status){
        let vStatus = validator.isSentence(res, status);
        if(!vStatus)
            return;
        profile.status = status;
    }
    if (name){
        let fullName = validator.isFullname(res, name);
        if(!fullName)
            return;
        profile.name = name;
    }
    if (address){
        let address1 = validator.isSentence(res, address);
        if(!address1)
            return;
        profile.address = address;
    }

    User.findByIdAndUpdate(req.user.id, {$set: profile}, {new: true})
        .populate({
            path: 'followers.userId',
            select:'name photo email coverImageUrl'
        })
        .populate({
            path: 'following.userId',
            select:'name photo email coverImageUrl'
        })
        .exec(function(err, user) {
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

                if (name){
                    let token = req.body.token || req.query.token || req.headers['x-access-token'];
                    firebase.updateProfile(token, name, function (err) {
                        if (err) {
                            console.log(err);
                        }

                        res.success(info);
                    });
                }
                else{
                    res.success(info);
                }
            }
        );
});

/*** END POINT FOR UPDATING PROFILE USERNAME OF CURRENTLY LOGGED IN USER */
router.post('/username', function(req, res){

    let username = req.body.username,
        validatedUsername = validator.isUsername(res, username);

    if (!validatedUsername)
        return;

    User.findOne({username: username}, function (err, user) {
        console.log(user);

        if (err) {
            console.log(err);
            return res.serverError("Something unexpected happened");
        }
        if (user && user._id !== req.user.id){
            return res.badRequest('username: '+ username+' is not available');
        }
        if (user && user._id === req.user.id){
            return res.badRequest('Username already used by You. select a new username you will love to change to');
        }

        User.findByIdAndUpdate(req.user.id, {$set: {username: username}}, {new: true})
            .populate({
                path: 'followers.userId',
                select:'name photo email coverImageUrl'
            })
            .populate({
                path: 'following.userId',
                select:'name photo email coverImageUrl'
            })
            .exec(function(err, user) {
                if (err) {
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
    })
});

/*** END POINT FOR UPDATING PROFILE PICTURE OF CURRENTLY LOGGED IN USER */
router.post('/photo', function(req, res){

    let file = req.files.null;
    console.log(file.path);

    let validated = validator.isFile(res, file);
    if(!validated)
        return;

    cloudinary.v2.uploader.upload(file.path, function(err, result) {
        if (err) {
            return res.badRequest(err);
        }else {
            let photoUrl = result.url;

            User.findByIdAndUpdate(req.user.id, {$set: {photoUrl: photoUrl}}, {new: true})
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

/*** END POINT FOR UPDATING PROFILE PHONE NUMBER OF CURRENTLY LOGGED IN USER */
router.post('/phoneNumber', function(req, res){

    let phone_number = req.body.phone_number,
        validatedPhoneNumber = validator.isValidPhoneNumber(res, phone_number);

    if (!validatedPhoneNumber)
        return;

    User.findOne({phone_number: phone_number}, function (err, user) {
        if (err) {
            console.log(err);
            return res.serverError("Something unexpected happened");
        }
        if (user && user._id !== req.user.id){
            return res.badRequest('A user already Exist with Phone Number: '+ phone_number);
        }
        if (user && user._id === req.user.id){
            return res.badRequest('Phone number already used by You. select a new Phone number you will love to change to');
        }

        User.findByIdAndUpdate(req.user.id, {$set: {phone_number: phone_number}}, {new: true})
            .populate({
                path: 'followers.userId',
                select:'name photo email coverImageUrl'
            })
            .populate({
                path: 'following.userId',
                select:'name photo email coverImageUrl'
            })
            .exec(function(err, user) {
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
    })
});

/*** END POINT FOR UPDATING PROFILE DATE OF BIRTH OF CURRENTLY LOGGED IN USER */
router.post('/dob', function(req, res){

    let date_o_b = req.body.d_o_b,
        d_o_b = moment(date_o_b, ["DD-MM-YYYY", "YYYY-MM-DD"]).add(1, 'h').valueOf(),
        id = req.user.id;

    let valid = validator.isWord(res, biz_name);
    if(!valid) return;

    dobUpdate(d_o_b, id, function (err, result) {
        if (err){
            res.badRequest(err);
        }else {
            res.success(result);
        }
    })
});

/*** END POINT FOR FOR REQUESTING PASSWORD CHANGE BY LOGGED IN USER */
router.post('/edit_password', function(req, res){

    let password = req.body.password;

    let validatedPassword = validator.isValidPassword(res, password);

    if (!validatedPassword)
        return;

    let token = req.body.token || req.query.token || req.headers['x-access-token'];
    firebase.changePassword(token, password, function(err, authData){
        if (err){
            return res.serverError(err.message);
        }

        let info = {
            token: authData.token,
            refreshToken: authData.refreshToken
        };

        res.success(info);
    });
});

function dobUpdate(d_o_b, id, callback){
    User.findById(id, function (err, data) {
        if (err) {
            console.log(err);
            return callback("Something unexpected happened");
        }
        if (!data) {
            return callback("User not found");
        }
        if(data.dob_count === 2 && data.dob_next != {$gt: Date.now()}){
            console.log('im here 2');
            return callback("You have reached the maximum allowable name changes of 2 per month");
        }
        if(data.dob_count === 2 && data.dob_next != {$lt: Date.now()}){
            data.d_o_b = d_o_b;
            data.dob_count = 1;
            data.dob_next = undefined;
            data.save(function (err, result) {
                if (err) {
                    console.log(err);
                    return callback("Something unexpected happened");
                }
                console.log(result);

                return callback(null, result)
            })
        }
        if(data.biz_name_count === 1){
            data.d_o_b = d_o_b;
            data.dob_count = 2;
            data.dob_next = Date.now() + 2592000000;
            data.save(function (err, result) {
                if (err) {
                    console.log(err);
                    return callback("Something unexpected happened");
                }
                console.log(result);

                return callback(null, result)
            })
        }else {
            data.d_o_b = d_o_b;
            data.dob_count = 1;
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

module.exports = router;