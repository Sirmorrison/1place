var express = require('express');
var router = express.Router();

const config = require('../../config');
var FirebaseAuth = require('firebaseauth');
var firebase = new FirebaseAuth(config.FIREBASE_API_KEY);

const validator = require('../../utils/validator');

/*** END POINT FOR REQUESTING PASSWORD CHANGE USING EMAIL */
router.post('/password', function(req, res){
    var email = req.body.email;

    var validatedEmail = validator.isValidEmail(res, email);
    if (!validatedEmail)
        return;

    firebase.sendPasswordResetEmail(email, function(err){
        if (err){
            return res.badRequest(err.message); //user error
        }

        res.success('An email has been sent to '+ email+ ' with further instructions.');
    })
});

/*** END POINT FOR UPDATING PASSWORD ONCE THE PASSWORD RESET EMAIL HAS BEEN SENT **MAY NOT BE NECESSARY** */
router.post('/password/change', function(req, res) {

    var oobCode = req.body.oobCode;
    var newPassword = req.body.newPassword;

    if (typeof(newPassword) !== 'string' || newPassword.length < 6){
        return res.badRequest('newPassword is required and must be 6 characters or more');
    }
    if (typeof(oobCode) !== 'string'){
        return res.badRequest('oobCode is required');
    }

    firebase.resetPassword(oobCode, newPassword, function(err){
        if (err){
            return res.badRequest(err.message); //user error
        }

        res.success('Password changed successfully. You can now login with your new password.');
    })
});

module.exports = router;