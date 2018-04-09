let express = require('express');
let router = express.Router();

const protector = require('../middlewares/protector');

//all action endpoints

let post = require('../controllers/action/post');
router.use('/post', protector.protect, post);

let follow = require('../controllers/action/follow');
router.use('/follow', protector.protect, follow);

// let event = require('../controllers/action/event');
// router.use('/event', protector.protect, event);
//
// let rating = require('../controllers/action/rating');
// router.use('/rating', protector.protect, rating);
//
// let comment = require('../controllers/action/comment');
// router.use('/comment', protector.protect, comment);

module.exports = router;