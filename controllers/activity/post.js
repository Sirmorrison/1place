let express = require('express');
let router = express.Router();

const config = require('../../config');
let cloudinary = require('cloudinary');
    cloudinary.config(config.cloudinary);

let Post = require('../../models/posts');
let arrayUtils = require('../../utils/array');
let validator = require('../../utils/validator');

/*** END POINT FOR GETTING POST OF A USER BY CURRENTLY LOGGED IN USER */
router.get('/', function(req, res) {

    Post.find({postedBy: req.user.id})
        .populate({
            path: 'likes.userId',
            select: 'name photoUrl email coverImageUrl'
        })
        .populate({
            path: 'tagged.userId',
            select:'name photoUrl email coverImageUrl'
        })
        .exec(function (err, post) {
            if (err) {
                return res.badRequest("Something unexpected happened");
            }
            if (!post) {
                return res.success([]);
            }

            let nPost = post.length,
                data ={
                    no_post: nPost,
                    post: post
                };

            res.success(data);
        });
});

/*** END POINT FOR GETTING PROFILE POST OF A USER BY ANOTHER CURRENTLY LOGGED IN USER */
router.get('/:userId', function(req, res) {

    Post.find({postedBy: req.params.userId})
        .populate({
            path: 'likes.userId',
            select: 'name photo email coverImageUrl'
        })
        .populate({
            path: 'tagged.userId',
            select:'name photo email coverImageUrl'
        })

        .exec(function (err, post) {

            if (err) {
                return res.badRequest("Something unexpected happened");
            }
            if (!post) {
                return res.success([]);
            }

            res.success(post);
        });
});

/*** END POINT A POST BY ITS ID BY CURRENTLY LOGGED IN USERS */
router.get('/:postId', function (req,res) {

    Post.findById(req.params.postId)
        .populate({
            path: 'postedBy',
            select:'name photo'
        })
        .exec(function(err, post) {
            if (err){
                return res.serverError("Something unexpected happened");
            }

            let info = {
                message: post.message,
                mediaUrl: post.mediaUrl,
                mediaType: post.mediaType,
                tags: post.tagged,
                postedBy: post.postedBy,
                likes: post.likes.length,
                comments: post.comments.length
            };

            res.success(info);
        });
});

/*** END POINT FOR POST CREATION BY A CURRENTLY LOGGED IN USER */
router.post('/', function (req, res) {
    let message = req.body.message;
    let mediaUrl = req.body.mediaUrl;
    let mediaType = req.body.mediaType;
    let tags = req.body.tagged;

    let values = {};

    if (message){
        let vmess = validator.isSentence(res, message);
        if(!vmess)
            return;
            values.message = message;
    }
    let validate = validator.isWord(res, mediaUrl) &&
                    validator.isWord()
    if (typeof(mediaUrl) !== 'string'){
        return res.badRequest('mediaUrl is required');
    }
    if (typeof(mediaType) !== 'string'){
        return res.badRequest('mediaType is required');
    }
    if (tags && !Array.isArray(tags)){
        return res.badRequest('Tagged should be a json array of user Ids (string)')
    }


    if (tags){
        //remove duplicates before proceeding
        arrayUtils.removeDuplicates(tags);

        values.tagged = []; //new empty array
        for (let i = 0; i < tags.length ; i++){
            let userId = tags[i];

            if (typeof(userId) !== "string"){
                return res.badRequest("User IDs in tagged array must be string");
            }

            values.tagged.push({userId: userId});
        }
    }

    Post.create(values, function (err, post) {
        if (err){
            console.log(err);
            return res.serverError("Something unexpected happened");
        }

        res.success({postId: post._id});
    });
});

/*** END POINT FOR POST CREATION BY A CURRENTLY LOGGED IN USER */
router.post('/', function (req, res) {
    let file = req.files.null;
    console.log(file.path);

    let validated = validator.isFile(res, file);
    if(!validated)
        return;

    cloudinary.v2.uploader.upload(file.path, function(err, result) {
        if (err) {
            return res.badRequest(err);
        }else {
            let photoUrl = result.url;

            User.findByIdAndUpdate(req.user.id, {$set: {photoUrl: photoUrl}}, {new: true})
                .populate({
                    path: 'followers.userId',
                    select: 'name photo email coverImageUrl'
                })
                .populate({
                    path: 'following.userId',
                    select: 'name photo email coverImageUrl'
                })
                .exec(function (err, user) {
                        if (err) {
                            console.log(err);
                            return res.serverError("Something unexpected happened");
                        }
                        if (!user) {
                            return res.badRequest("User profile not found please be sure you are still logged in");
                        }

                        let info = {
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
        }
    });
    // fs.unlink(file);
});

/*** END POINT FOR EDITING POST BY A CURRENTLY LOGGED IN USER */
router.post('/:postId', function (req, res) {

    let message = req.body.message,
        postedBy =  req.user.id,
        tags = req.body.tagged;

    if (!(message || tags)){
        return res.badRequest("please enter values to fields you will love to be updated");
    }
    if (message && typeof(message) !== 'string') {
        return res.badRequest('message is required');
    }
    if (tags && !Array.isArray(tags)){
        return res.badRequest('Tagged should be a json array of user Ids (string)')
    }

    let values = {};
    values.postedBy = postedBy;

    if (message){
        values.message = message;
    }
    if (tags) {
        //remove duplicates before proceeding
        arrayUtils.removeDuplicates(tags);

        values.tagged = []; //new empty array
        for (let i = 0; i < tags.length; i++) {
            let userId = tags[i];

            if (typeof(userId) !== "string") {
                return res.badRequest("User IDs in tagged array must be string");
            }

            values.tagged.push({userId: userId});
        }
    }

    // let currentPost = {
    //     _id: req.params.postId ,
    //     "post.postedBy": req.user.id
    // };

    Post.findAndModify({query: {_id: req.params.postId, postedBy: req.user.id}}, {$set: values}, {new: true}, function (err, post) {

        if (err) {
            return res.serverError("Something unexpected happened");
        }

        res.success(post);
    });
});

/*** END POINT FOR DELETING A POST BY A CURRENTLY LOGGED IN USER */
router.delete('/:postId', function (req, res) {

    Post.delete({_id: req.params.postId}, function (err) {
        if (err) {
            console.log(err);
            return res.badRequest("Some error occurred");
        }

        res.success({deleted: true});
    });
});

module.exports = router;