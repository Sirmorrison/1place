const express = require('express');
let router = express.Router();

const Business = require('../../models/business');
const validator = require('../../utils/validator');
const Ids = require('../../utils/id_gen');
let arrayUtils = require('../../utils/array');

/*** END POINT FOR CREATING BUSINESS BY A REGISTERED LOGGED IN USER*/
router.post('/', function(req, res){

    let biz_name = req.body.biz_name,
        country = req.body.country,
        state = req.body.state,
        city = req.body.city,
        cate_tags = req.body.cate_tags;

    let validated = validator.isName(res, biz_name)&&
                    validator.isWord(res, country)&&
                    validator.isWord(res, state)&&
                    validator.isCategory(res, cate_tags)&&
                    validator.isWord(res, city);

    if (!validated)
        return;

    //remove duplicates before proceeding
    arrayUtils.removeDuplicates(cate_tags);

    let categoryTags = []; //new empty array
    for (let i = 0; i < cate_tags.length ; i++){
        let cateId = cate_tags[i];

        if (typeof(cateId) !== "string"){
            return res.badRequest("category IDs in tagged array must be string");
        }
        categoryTags.push({categoryId: cateId});
    }

    let data = {
        biz_name: req.body.biz_name.toLowerCase(),
        country: req.body.country,
        state: req.body.state,
        city: req.body.city,
        createdBy: req.user.id,
        categoryTags: categoryTags
    };

    Business.findOne({biz_name: data.biz_name}, function (err, result) {
        if (err) {
            console.log(err);
            return res.badRequest("Something unexpected happened");
        }
        if (result) {
            return res.badRequest("A Business already exist with this Business Name: "+ data.biz_name);
        }
        if (!result) {
            Business.create(data, function (err, business) {
                if (err){
                    console.log(err);
                    return res.badRequest("Something unexpected happened");
                }

                let info = {
                    BusinessId: business._id,
                    Business_Name: business.biz_name,
                    Business_category: business.category,
                    success : true,
                };
                res.success(info);
            })
        }
    })
});

module.exports = router;