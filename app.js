var http = require("http");
var fs = require("fs");
var path = require('path');
var express = require("express");

var port = parseInt(process.argv[3]);
var io = require("socket.io").listen(port+1);

var app = express();
var addr = process.argv[2];

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Define static folders
app.use('/', express.static(__dirname, '/public'));

app.get("/", function (req, res) {
    res.render('index', {ip : addr, port : port+1});
});

app.get('/nsa', function (req, res) {
    res.render('nsa', {ip : addr, port : port+1});
});

app.all('/*', function (req, res) {
    res.status(404).send("<img src='/public/images/404_leo.jpg' />");
});

io.sockets.on('connection', function (socket) {
	socket.emit('conn');
    socket.on('message', function (data) {
        socket.emit('message', data);
        socket.broadcast.emit('message', data);
    })
    socket.on('conn', function(username) {
    	var data = {
    		type: "connexion",
    		username: username
    	}
    	socket.emit('sysmessage', data);
    })
});

app.listen(port);
