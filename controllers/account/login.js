const express = require('express');
let router = express.Router();

const config = require('../../config');
const FirebaseAuth = require('firebaseauth');
const firebase = new FirebaseAuth(config.FIREBASE_API_KEY);

const validate = require('../../utils/validator');
const  validator = require('validator');
const User = require('../../models/user');

/*** END POINT FOR LOGIN WITH EMAIL */
router.post('/', function(req, res){
    let email = req.body.email;
    let password = req.body.password;

    let validatedPassword = validate.isValidPassword(res, password);

    if (!validatedPassword)
        return;

    if (validator.isEmail(email)) {
        emailLogin(email, password, function(err, firebaseResponse){

            if (err){
                console.log(err);
                return res.badRequest(err.message);
            }

            User.findById(firebaseResponse.user.id, function (err, user) {

                if (err) {
                    console.log(err);
                    return res.badRequest("Something unexpected happened");
                }

                let userInfo = {
                    name: user.name,
                    token: firebaseResponse.token,
                    refreshToken: firebaseResponse.refreshToken,
                    expiryMilliseconds: firebaseResponse.expiryMilliseconds
                };

                res.success(userInfo);
            });
        });
    }
    else if(validator.isMobilePhone(email, 'any')){
        User.findOne({phone_number: email}, function (err, user) {

            if (err) {
                console.log(err);
                return res.badRequest("Something unexpected happened");
            }
            if (!user) {
                return res.badRequest("phone number not found please check and try again or use your email address");
            }

            let email = user.email;

            emailLogin(email, password, function(err, result){
                if (err){
                    return res.badRequest(err.message);
                }

                let info = {
                    name: result.user.displayName,
                    token: result.token,
                    refreshToken: result.refreshToken,
                    expiryMilliseconds: result.expiryMilliseconds
                };

                res.success(info);
            });
        });
    }
    else {
        return res.badRequest("email  or phone number entered is incorrect please check and try again");
    }
});

function emailLogin(email, password, callback){

    firebase.signInWithEmail(email, password, function (err, firebaseResponse) {
        if (err) {
            console.log(err);
            //firebase errors come as object {code, message}, return only message
            return callback(err);
        }

        return callback(null, firebaseResponse);
    });
}

/*** END POINT FOR LOGIN WITH FACEBOOK */
router.post('/facebook', function(req, res){
    let access_token = req.body.access_token;
    firebase.loginWithFacebook(access_token, function(err, firebaseResponse){
        if (err){
            //firebase errors come as object {code, message}, return only message
            return res.badRequest(err.message);
        }

        processFirebaseSocialLogin(firebaseResponse, function(errorMessage, userInfo){
            if (err){
                res.badRequest(errorMessage);
            }
            else {
                res.success(userInfo);
            }
        });
    });
});

/*** END POINT FOR LOGIN WITH INSTAGRAM */
router.post('/google', function(req, res) {
    let access_token = req.body.access_token;
    firebase.loginWithGoogle(access_token, function(err, firebaseResponse){
        if (err){
            //firebase errors come as object {code, message}, return only message
            return res.badRequest(err.message);
        }

        processFirebaseSocialLogin(firebaseResponse, function(errorMessage, userInfo){
            if (err){
                res.badRequest(errorMessage);
            }
            else {
                res.success(userInfo);
            }
        });
    });
});

function processFirebaseSocialLogin(firebaseResponse, callback) {
    User.findOne({_id: firebaseResponse.user.id}, function (err, user) {
        if (err) {
            console.log(err);
            return callback("Something unexpected happened");
        }

        if (!user) {
            let info = {
                _id: firebaseResponse.user.id,
                name: firebaseResponse.user.displayName,
                email: firebaseResponse.user.email,
                photoUrl: firebaseResponse.user.photoUrl,
                // d_o_b: firebaseResponse.rawUserInfo.birthday
            };

            User.create(info, function (err, user) {
                if (err) {
                    console.log(err);
                    return callback("Something unexpected happened");
                }

                let info = {
                    name : user.name,
                    photoUrl : user.photoUrl,
                    token: firebaseResponse.token,
                    refreshToken: firebaseResponse.refreshToken,
                    expiryMilliseconds: firebaseResponse.expiryMilliseconds
                };
                return callback(null, info);
            });
        }
        else {
            let userInfo = {
                name : user.name,
                photoUrl : user.photoUrl,
                token: firebaseResponse.token,
                refreshToken: firebaseResponse.refreshToken,
                expiryMilliseconds: firebaseResponse.expiryMilliseconds
            };
            return callback(null, userInfo);
        }
    });
}

module.exports = router;