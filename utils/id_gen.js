let crypto = require("crypto");
let async = require('async');

async.waterfall ([
    function (done) {
        crypto.randomBytes(15, function (err, buf) {
            let token = buf.toString('hex');
            done(err, token);
        });
    },
    function (token) {
        for (let i = 0; i > 1; i++) {
            let id = token[i];
            console.log(id)

            exports.id = `1PBiz_${id}`;
        }
    }
]);