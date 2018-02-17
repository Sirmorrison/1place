var express = require('express');
var router = express.Router();
var moment = require('moment');

const config = require('../../config');
var FirebaseAuth = require('firebaseauth');
var firebase = new FirebaseAuth(config.FIREBASE_API_KEY);

const validator = require('../../utils/validator');
var User = require('../../models/user');

/*** END POINT FOR GETTING PERSONAL PROFILE BY CURRENTLY LOGGED IN USER */
router.get('/', function(req, res){

    User.findById(req.user.id)
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
                return res.badRequest("Something unexpected happened");
            }
            if (!user) {
                return res.badRequest("YOU NEED TO BE A REGISTERED USER TO VIEW GET ACCESS");
            }

            var d_o_b = moment(user.d_o_b),
                info = {
                coverImageUrl: user.coverImageUrl,
                photo: user.photoUrl,
                name: user.name,
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

        res.success(info);
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

            var d_o_b = moment(user.d_o_b),

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

        res.success(info);
    });
});

/*** END POINT FOR UPDATING PROFILE INFORMATION OF CURRENTLY LOGGED IN USER */
router.post('/update', function(req, res){

    var name = req.body.name,
        address = req.body.address,
        bio = req.body.bio,
        country = req.body.country,
        city = req.body.city,
        gender = req.body.gender,
        status = req.body.status,
        date_o_b = req.body.d_o_b,
        d_o_b = moment(date_o_b, ["DD-MM-YYYY", "YYYY-MM-DD"]).add(1, 'h').valueOf();

    if (!(name || d_o_b || address || bio || country || city || status || gender )){
        return res.badRequest('Please input the value to the field you would love to update');
    }
   
    if (bio){
        var vBio = validator.isBio(res, bio);
        if(!vBio)
            return;
    }
    if (country){
        var vCountry = validator.isCountry(res, country);
        if(!vCountry)
            return;
    }
    if (city){
        var vCity = validator.isCity(res, city);
        if(!vCity)
            return;
    }
    if (gender){
        var vGender = validator.isGender(res, gender);
        if(!vGender)
            return;
    }
    if (status){
        var vStatus = validator.isStatus(res, status);
        if(!vStatus)
            return;
    }
    if (name){
        var fullname = validator.isFullname(res, name);
        if(!fullname)
            return;
    }
    if (address){
        var address1 = validator.isAddress(res, address);
        if(!address1)
            return;
    }
    if (d_o_b){
        var date = validator.isOverMinimumAge(res, d_o_b);
        if(!date)
            return;
    }

    var profile = {};
    if (name)
        profile.name = name;
    if (d_o_b)
        profile.d_o_b = d_o_b;
    if (address)
        profile.address = address;
    if (bio)
        profile.bio = bio;
    if (country)
        profile.country = country;
    if (city)
        profile.city = city;
    if (gender)
        profile.gender = gender;
    if (status)
        profile.status = status;

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

            var info = {
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
                var token = req.body.token || req.query.token || req.headers['x-access-token'];
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
    )
});

/*** END POINT FOR UPDATING PROFILE USERNAME OF CURRENTLY LOGGED IN USER */
router.post('/username', function(req, res){

    var username = req.body.username,
        validatedUsername = validator.isUsername(res,username);

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
                    console.log(err);
                    return res.serverError("Something unexpected happened");
                }
                if (!user) {
                    return res.badRequest("User profile not found please be sure you are still logged in");
                }

                var info = {
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

/*** END POINT FOR UPDATING PROFILE PHONE NUMBER OF CURRENTLY LOGGED IN USER */
router.post('/phoneNumber', function(req, res){

    var phone_number = req.body.phone_number,
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

                var info = {
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

/*** END POINT FOR FOR REQUESTING PASSWORD CHANGE BY LOGGED IN USER */
router.post('/edit_password', function(req, res){

    var password = req.body.password;

    var validatedPassword = validator.isValidPassword(res, password);

    if (!validatedPassword)
        return;

    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    firebase.changePassword(token, password, function(err, authData){
        if (err){
            return res.serverError(err.message);
        }
        else
            var info = {
                token: authData.token,
                refreshToken: authData.refreshToken
            };

        res.success(info);
    });
});

module.exports = router;