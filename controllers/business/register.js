const express = require('express');
var router = express.Router();

const business = require('../../models/register');
const validator = require('../../utils/validator');

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
router.post('/', function(req, res){

    var biz_name = req.body.biz_name,
        admin = req.body.admin,

        validated = validator.isBusiness(res, biz_name);

    if (!validated)
        return;
    business.findOne({biz_name: biz_name}, function (err, result) {
        if (err) {
            console.log(err);
            return res.badRequest("Something unexpected happened");
        }
        if (result) {
            return res.badRequest("A user already exist with this phone number: "+ phone_number);
        }
        if (!result) {
            business.create({biz_name: biz_name}, function (err, business) {
                if (err){
                    return res.badRequest("Something unexpected happened");
                }
                var info = {
                    coverImageUrl: business._id,
                    photo: business.biz_name
                };
                res.success(info);
            })
        }
    })
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

/*** END POINT FOR UPDATING SOCIAL LINKS OF CURRENTLY LOGGED IN USER */
router.post('/social', function(req, res){

    var facebookUrl = req.body.facebookUrl,
        twitterUrl = req.body.twitterUrl,
        instagramUrl = req.body.instagramUrl,
        websiteUrl = req.body.websiteUrl,
        pinterestUrl = req.body.pinterestUrl,
        dribbleUrl = req.body.dribbleUrl,
        behanceUrl = req.body.behanceUrl;

    if (!(behanceUrl || dribbleUrl || pinterestUrl || websiteUrl || instagramUrl || twitterUrl || facebookUrl)){
        return res.badRequest('Please input the value to the field you would love to update');
    }
    if (facebookUrl){
        if(typeof(facebookUrl) !== 'string' || (facebookUrl.trim().length <= 0 )) {
            return res.badRequest('facebook link must be a string and cannot be empty');
        }
    }
    if (twitterUrl){
        if(typeof(twitterUrl) !== 'string' || (twitterUrl.trim().length <= 0 )) {
            return res.badRequest('twitter link must be a string and cannot be empty');
        }
    }
    if (instagramUrl){
        if (typeof(instagramUrl) !== 'string' || instagramUrl.trim().length <= 0) {
            return res.badRequest('instagram link is required');
        }
    }
    if (websiteUrl){
        if (typeof(websiteUrl) !== 'string' || websiteUrl.trim().length <= 0) {
            return res.badRequest('website link is required');
        }
    }
    if (pinterestUrl){
        if (typeof(pinterestUrl) !== 'string' || pinterestUrl.trim().length <= 0) {
            return res.badRequest('pinterest Url is required');
        }
    }
    if (dribbleUrl){
        if (typeof(dribbleUrl) !== 'string' || dribbleUrl.trim().length <= 0) {
            return res.badRequest('dribble Url is required');
        }
    }
    if (behanceUrl){
        if (typeof(behanceUrl) !== 'string' || behanceUrl.trim().length <= 0) {
            return res.badRequest('behance Url is required');
        }
    }

    var profileUrl = {};
    if (behanceUrl)
        profileUrl.behanceUrl = behanceUrl;
    if (dribbleUrl)
        profileUrl.dribbleUrl = dribbleUrl;
    if (pinterestUrl)
        profileUrl.pinterestUrl = pinterestUrl;
    if (websiteUrl)
        profileUrl.websiteUrl = websiteUrl;
    if (instagramUrl)
        profileUrl.instagramUrl = instagramUrl;
    if (twitterUrl)
        profileUrl.twitterUrl = twitterUrl;
    if (facebookUrl)
        profileUrl.facebookUrl = facebookUrl;

    User.findByIdAndUpdate(req.user.id, {$set: profileUrl}, {new: true})
        .populate({
            path: 'rating.ratedBy',
            select:'name photo email coverImageUrl'
        })
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
router.post('/address', function(req, res){

    var street_name = req.body.street_name,
        house_number = req.body.house_number,
        city = req.body.city,
        state = req.body.state,
        country = req.body.country,
        landmark = req.body.landmark,
        geo_location = req.body.geo_location;

    if(typeof(street_name) !== 'string' || street_name.trim().length <=0){
        return res.badRequest('street name must be a string and must not be empty');
    }
    if(typeof(house_number) !== 'number'){
        return res.badRequest('house number must be a string and must not be empty');
    }
    if(typeof(geo_location) !== 'string' || geo_location.trim().length <=0 ){
        return res.badRequest('street name must be a string and must not be empty');
    }
    if(typeof(landmark) !== 'string' || landmark.trim().length <=0 ){
        return res.badRequest('landmark must be a string and must not be empty');
    }
    if(typeof(state) !== 'string' || state.trim().length <=0 ){
        return res.badRequest('state must be a string and must not be empty');
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
    User.findById(req.user.id, function (err, user) {
        if (err) {
            console.log(err);
            return res.serverError("Something unexpected happened");
        }
        if (!user) {
            return res.badRequest("User profile not found please be sure you are still logged in");
        }

        var address = {
            street_name: street_name,
            house_number : house_number,
            city : city,
            state : state,
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

            res.success(user.address[user.address.length-1]._id);
        });
    })
});

/*** END POINT FOR UPDATING ADDRESS BY THE ADDRESSS ID OF CURRENTLY LOGGED IN USER */
router.put('/address/:addressId', function(req, res){

    var street_name = req.body.street_name,
        house_number = req.body.house_number,
        city = req.body.city,
        state = req.body.state,
        country = req.body.country,
        landmark = req.body.landmark,
        geo_location = req.body.geo_location;

    if(typeof(street_name) !== 'string' || street_name.trim().length <=0){
        return res.badRequest('street name must be a string and must not be empty');
    }
    if(typeof(house_number) !== 'number'){
        return res.badRequest('house number must be a string and must not be empty');
    }
    if(typeof(geo_location) !== 'string' || geo_location.trim().length <=0 ){
        return res.badRequest('street name must be a string and must not be empty');
    }
    if(typeof(landmark) !== 'string' || landmark.trim().length <=0 ){
        return res.badRequest('landmark must be a string and must not be empty');
    }
    if(typeof(state) !== 'string' || state.trim().length <=0 ){
        return res.badRequest('state must be a string and must not be empty');
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
    User.findById(req.user.id, function (err, user) {
        if (err) {
            console.log(err);
            return res.serverError("Something unexpected happened");
        }
        if (!user) {
            return res.badRequest("User profile not found please be sure you are still logged in");
        }

        var address = {
            _id: req.params.addressId,
            street_name: street_name,
            house_number : house_number,
            city : city,
            state : state,
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

            res.success(user.address[user.address.length-1]._id);
        });
    })
});

/*** END POINT FOR UPDATING PROFILE MEASUREMENT OF CURRENTLY LOGGED IN USER */
router.post('/measurement', function(req, res){

    var name = req.body.name;
    var value = req.body.value;
    var unit = req.body.unit;

    if (typeof(name) !== 'string'){
        return res.badRequest('Name  required');
    }
    if (typeof(value) !== 'number') {
        return res.badRequest('value is required');
    }
    if (typeof(unit) !== 'string'){
        return res.badRequest('unit  required');
    }

    var measurement = {
        name: name,
        value: value,
        unit: unit
    };

    User.findById(req.user.id, function(err, user) {

        if (err){
            return res.serverError("Something unexpected happened");
        }
        if (!user) {
            return res.badRequest("To perform this operation u need to be a registered and logged in user");
        }

        user.measurement.push(measurement);
        user.save(function (err, measurement) {
            if (err){
                return res.serverError("Something unexpected happened");
            }

            res.success(user.measurement[user.measurement.length-1]._id);
        });
    });
});

/*** END POINT FOR UPDATING MEASUREMENT BY THE MEASUREMENT ID OF CURRENTLY LOGGED IN USER */
router.put('/measurement/:measurementId', function(req, res){

    var name = req.body.name;
    var value = req.body.value;
    var unit = req.body.unit;

    if (typeof(name) !== 'string'){
        return res.badRequest('Name  required');
    }
    if (typeof(value) !== 'number') {
        return res.badRequest('value is required');
    }
    if (typeof(unit) !== 'string'){
        return res.badRequest('unit  required');
    }

    var measurement = {
        _id: req.params.measurementId,
        name: name,
        value: value,
        unit: unit
    };

    var currentMeasurement = {
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
router.delete('/measurement/:measurementId', function(req, res){

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

module.exports = router;