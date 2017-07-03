'use strict';
var express = require('express');

var mongoose = require('mongoose');
var session = require('express-session');
var bodyParser = require('body-parser');

var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var routes = require('./app/routes/index.js')(io, app);


app.use('/public', express.static(process.cwd() + '/public'));


var port = process.env.PORT || 8080;
http.listen(port,  function () {
	console.log('Node.js listening on port ' + port + '...');
});
io = io.listen(http);



