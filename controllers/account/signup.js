var express = require('express');
var router = express.Router();
var moment = require('moment');

const config = require('../../config');
var FirebaseAuth = require('firebaseauth');
var firebase = new FirebaseAuth(config.FIREBASE_API_KEY);

const protector = require('../../middlewares/protector');
const validator = require('../../utils/validator');

var User = require('../../models/user');

/*** END POINT FOR SIGNUP WITH EMAIL */
router.post('/', function(req, res){

    var email = req.body.email,
        password = req.body.password,
        name = req.body.name,
        admin = req.body.admin,
        date_o_b = req.body.d_o_b,
        phone_number = req.body.phone_number;

    var d_o_b = moment(date_o_b, ["DD-MM-YYYY", "YYYY-MM-DD"]).add(1, 'h').valueOf();

    if (admin === 0 || admin === '0' || admin === 'f' || admin === 'false' || admin === 'no')
        admin = false;
    else if (admin === 1 || admin === '1' || admin === 't' || admin === 'true' || admin === 'yes')
        admin = true;

    if (admin && typeof(admin) !== 'boolean'){
        return res.badRequest('Admin flag is required');
    }

    //chain validation checks, first one to fail will cause the code to break instantly
    var validated = validator.isValidEmail(res, email) &&
                    validator.isValidPassword(res, password) &&
                    validator.isValidPhoneNumber(res, phone_number) &&
                    validator.isOverMinimumAge(res, d_o_b) &&
                    validator.isFullname(res, name);

    if (!validated)
        return;

    var extras = {
        name: name,
        requestVerification: true
    };
    User.findOne({phone_number: phone_number}, function (err, result) {
        if (err) {
            console.log(err);
            return res.badRequest("Something unexpected happened");
        }
        if (result) {
            return res.badRequest("A user already exist with this phone number: "+ phone_number);
        }
        if (!result) {
            firebase.registerWithEmail(email, password, extras, function (err, firebaseResponse) {
                if (err) {
                    //firebase errors come as object {code, message}, return only message
                    return res.badRequest(err.message);
                }

                var info = {
                    _id: firebaseResponse.user.id,
                    name: firebaseResponse.user.displayName,
                    email: firebaseResponse.user.email,
                    d_o_b: d_o_b,
                    phone_number: phone_number,
                    admin: admin
                };
                User.create(info, function (err, user) {
                    if (err) {
                        console.log(err);

                        return res.badRequest("Something unexpected happened");
                    }

                    var info = {
                        name: user.name,
                        d_o_b: user.d_o_b,
                        token: firebaseResponse.token,
                        refreshToken: firebaseResponse.refreshToken,
                        expiryMilliseconds: firebaseResponse.expiryMilliseconds
                    };
                    res.success(info);
                });
            });
        }
    })
});


module.exports = router;