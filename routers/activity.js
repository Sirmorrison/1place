var express = require('express');
var router = express.Router();

const protector = require('../middlewares/protector');

//all activity endpoints

var post = require('../controllers/activity/post');
router.use('/post', protector.protect, post);

var follow = require('../controllers/activity/follow');
router.use('/follow', protector.protect, follow);

var event = require('../controllers/activity/event');
router.use('/event', protector.protect, event);

var rating = require('../controllers/activity/rating');
router.use('/rating', protector.protect, rating);

var comment = require('../controllers/activity/comment');
router.use('/comment', protector.protect, comment);

module.exports = router;