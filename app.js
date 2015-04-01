var addr = process.argv[2];
var port = parseInt(process.argv[3]);

var fs = require("fs");
var http = require("http");
var path = require('path');
var express = require("express");
var io = require("socket.io").listen(port+1);

var app = express();

var users = new Array();

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

io.sockets.on('connection', function (socket, client) {
    var id = socket.id;
    socket.on('newUser', function (data) {
        console.log(id);
        users.push({ 'id': id, 'username': data.username, 'avatar': data.avatar});
        console.log(users);
        socket.emit('userConn');
        socket.broadcast.emit('userConn');
    });
 //socket.emit('conn');
 //   socket.on('message', function (data) {
 //       socket.emit('message', data);
 //       socket.broadcast.emit('message', data);
 //   })
 //   socket.on('conn', function(username) {
 //   	var data = {
 //   		type: "connexion",
 //   		username: username
 //   	}
 //   	socket.emit('sysmessage', data);
 //   	socket.broadcast.emit('sysmessage', data);
 //   })
});

app.listen(port);
