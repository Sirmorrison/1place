const express = require('express');
let app = express();

//setup cors to accept requests from everywhere
const cors = require('cors');
app.use(cors());

let path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

//log all requests to the console
const logger = require('morgan');
app.use(logger('dev'));

//parse all incoming parameters to req.body
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const multipart = require('connect-multiparty');
let multipartMiddleware = multipart();
app.use(multipartMiddleware);

//consistent reply functions from all endpoints
let reply = require('./middlewares/reply');
app.use(reply.setupResponder);

let config = require('./config');
let mongoose = require('mongoose');

mongoose.connect(config.mongoUrl);
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', () => console.log('connected to one place database'));

//routers
let account = require('./routers/account');
app.use('/account', account);

let activity = require('./routers/activity');
app.use('/activity', activity);

app.use(function(err, req, res, next){
	res.status(400).json(err);
});

module.exports = app;