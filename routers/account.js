var express = require('express');
var router = express.Router();


const protector = require('../middlewares/protector');

//all login endpoints
var login = require('../controllers/account/login');
router.use('/login', login);

//all signup endpoints
var signup = require('../controllers/account/signup');
router.use('/signup', signup);

//all profile endpoints
var profile = require('../controllers/account/profile');
router.use('/profile',protector.protect, profile);

//all recovery endpoints
var recovery = require('../controllers/account/recovery');
router.use('/recovery', recovery);

//all verification endpoints
var verification = require('../controllers/account/verification');
router.use('/verification', verification);

var token = require('../controllers/account/token');
router.use('/token', token);

module.exports = router;