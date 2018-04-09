let express = require('express');
let router = express.Router();


const protector = require('../middlewares/protector');

//all register endpoints
let register = require('../controllers/business/register');
router.use('/register',protector.protect, register);

//all signup endpoints
// let categories = require('../controllers/account/signup');
// router.use('/signup', signup);

//all profile endpoints
let biz_profile = require('../controllers/business/biz_profile');
router.use('/biz_profile',protector.protect, biz_profile);

module.exports = router;