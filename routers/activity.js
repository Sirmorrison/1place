let express = require('express');
let router = express.Router();

const protector = require('../middlewares/protector');

//all activity endpoints

let post = require('../controllers/activity/post');
router.use('/post', protector.protect, post);

let follow = require('../controllers/activity/follow');
router.use('/follow', protector.protect, follow);

// let event = require('../controllers/activity/event');
// router.use('/event', protector.protect, event);
//
// let rating = require('../controllers/activity/rating');
// router.use('/rating', protector.protect, rating);
//
// let comment = require('../controllers/activity/comment');
// router.use('/comment', protector.protect, comment);

module.exports = router;