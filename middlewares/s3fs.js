// var AWS = require('aws-sdk');
var config = require('../tsconfig.json');
var fs = require('fs'),
    S3FS = require('s3fs'),
    bucketName = "rudigo";
    /** Load Config File */
// AWS.config.loadFromPath('tsconfig.json');

/** After config file load, create object for s3*/
// var s3fsImpl = new AWS.S3({region: 'us-west-2'});

s3fsImpl = new S3FS('bucketName', config);

// Create our bucket if it doesn't exist
s3fsImpl.create(function(err, data) {
    if (err) {
        console.log("Error", err);
        callback(err, null)
    } else {
        callback(null, data)
    }
});

exports.upload = function (req, res) {
    var file = req.files.file;
    var stream = fs.createReadStream(file.path);
    return s3fsImpl.writeFile(file.originalFilename, stream).then(function () {
        fs.unlink(file.path, function (err) {
            if (err) {
                console.error(err);
            }
        });
        res.status(200).end();
    });
};