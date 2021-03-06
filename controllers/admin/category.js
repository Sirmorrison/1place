let express = require('express');
let router = express.Router();

let User = require('../../models/user');
let BizCat = require('../../models/bizCategories');
let Ids = require('../../utils/id_gen');
const validator = require('../../utils/validator');

/*** END POINT FOR GETTING BUSINESS CATEGORIES BY USER */
router.get('/biz', function (req, res) {

    BizCat.find({}, {title:1},function (err, result) {
        if (err) {
            console.log(err);
            return res.badRequest("Something unexpected happened");
        }

        res.success(result);
    })
});

/*** END POINT FOR CREATING BUSINESS CATEGORIES BY ADMIN USER */
router.post('/biz', function (req, res) {
    let userId = req.user.id,
        title = req.body.title.toLowerCase();

    let validated = validator.isWord(res, title);
        if(!validated) return;

    let data = {
        title : title,
        postedBy: userId
    };

    // User.findById(userId, function (err, user) {
    //     if (err) {
    //         console.log("This is weeks error: ", err);
    //         return res.badRequest("Something unexpected happened");
    //     }
    //     if (!user) {
    //         return res.badRequest("no user found with this id");
    //     }
    //     if (user.admin !== true) {
    //         return res.notAllowed("You are not Authorized Perform this Action");
    //     }
    userVerify(userId, function (err, user) {
        if (err) {
            console.log(err);
            return res.badRequest(err);
        }

        BizCat.findOne({title : title},function (err, result) {
            if (err) {
                console.log(err);
                return res.badRequest("Something unexpected happened");
            }
            if (result) {
                return res.badRequest("A category already exist with this category Name: " + title);
            } else {
                BizCat.create(data, function (err, cate) {
                    if (err) {
                        console.log(err);
                        return res.badRequest("Something unexpected happened");
                    }

                    let info = {
                        categoryId: cate._id,
                        Category: cate.title,
                        success: true
                    };
                    res.success(info);
                })
            }
        });
    })
});

/*** END POINT FOR EDITING BUSINESS CATEGORIES BY ADMIN USER */
router.post('/biz/:catId', function (req, res) {
    let userId = req.user.id,
        title = req.body.title,
        catId = req.params.catId;

    let validated = validator.isWord(res, title);
    if(!validated) return;

    let data = {
        _id : Ids.id,
        title : title,
        postedBy: userId
    };

    // User.findById(userId, function (err, user) {
    //     if (err) {
    //         console.log("This is weeks error: ", err);
    //         return res.badRequest("Something unexpected happened");
    //     }
    //     if (!user) {
    //         return res.badRequest("no user found with this id");
    //     }
    //     if (user.admin !== true) {
    //         return res.notAllowed("You are not Authorized Perform this Action");
    //     }
    userVerify(userId, function (err, user) {
        if (err) {
            console.log(err);
            return res.badRequest(err);
        }
        BizCat.findOneAndUpdate(
            {postedBy: req.user.id, _id: catId},
            {$set: data},
            {new: true}, function (err, cat) {
                if (err) {
                    console.log(err);
                    return res.serverError("Something unexpected happened");
                }
                if (cat === null) {
                    console.log(err);
                    return res.notAllowed("you are not allowed to make modifications to this profile");
                }
                let info = {
                    categoryId: cat._id,
                    Category: cat.title,
                    success: true
                };

            res.success(info);
        })
    })
});

/*** END POINT FOR EDITING BUSINESS CATEGORIES BY ADMIN USER */
router.post('/biz/:catId', function (req, res) {
    let userId = req.user.id,
        catId = req.params.catId;

    userVerify(userId, function (err, user) {
        if (err) {
            console.log(err);
            return res.badRequest(err);
        }
        BizCat.remove({_id: catId}, function (err, cat) {
            if (err) {
                console.log(err);
                return res.serverError("Something unexpected happened");
            }
            if (!cat) {
                console.log(err);
                return res.badRequest("no category found");
            }

            res.success(cat);
        })
    })
});

function userVerify(userId, callback) {
    User.findById(userId, function (err, user) {
        if (err) {
            console.log(err);
            return callback("Something unexpected happened");
        }
        if (!user) {
            return callback("no user found with this id");
        }
        if (user.admin !== true) {
            return callback("You are not Authorized Perform this Action");
        }

        return callback(null, user)
    })
}

module.exports = router;