var AWS = require('aws-sdk');
var async = require('async');
var bucketName = "rudigo";
var path = require('path');
var fs = require('fs');
var pathParams, image, imageName;


/** Load Config File */
AWS.config.loadFromPath('tsconfig.json');

/** After config file load, create object for s3*/
var s3 = new AWS.S3({region: 'us-west-2'});
var createMainBucket = function (callback) {
    // Create the parameters for calling createBucket
    var bucketParams = {
        Bucket : bucketName
    };
    s3.headBucket(bucketParams, function(err, data) {
        if (err) {
            console.log("ErrorHeadBucket", err);
            s3.createBucket(bucketParams, function(err, data) {
                if (err) {
                    console.log("Error", err);
                    callback(err, null)
                } else {
                    callback(null, data)
                }
            });
        } else {
            callback(null, data)
        }
    })
};

var createItemObject = function(callback) {
    var params = {
        Bucket: bucketName,
        Key: imageName,
        ACL: 'public-read',
        Body:image
    };

    s3.putObject(params, function (err, data) {
        if (err) {
            console.log("Error uploading image: ", err);
            callback(err)
        } else {
            console.log("Successfully uploaded image on S3", data);
            callback(null, data)
        }
    })
};

exports.upload = function(tmp_path, name, callback){

    image = fs.createReadStream(tmp_path);
    imageName = name;
    async.series([
        createMainBucket,
        createItemObject
    ], function (err, result) {
        if(err){
            console.log('there was an error ' + err);
            callback(err, null)
        } else {
            console.log("Successfully uploaded image on S3", result);
            callback(null, result)
        }
    });
    fs.unlink (tmp_path, function(err){
        if(err){
            console.log('there was an error ' + err);
            callback(err, null)
        }
    });
};

exports.displayForm = function(req, res){
    res.writeHead(200, {
        "Content-Type": "text/html"
    });
    res.write(
        '<form action="/upload" method="post" enctype="multipart/form-data">' +
        '<input type="file" name="file">' +
        '<input type="submit" value="Upload">' +
        '</form>'
    );
    res.end();
};