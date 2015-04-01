var fs = require("fs");
var path = require('path');
var express = require("express");

var port = parseInt(process.argv[2]) || 3131;

var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Define static folders
app.use('/', express.static(__dirname, '/public'));

app.get("/", function (req, res) {
    res.render('index');
});

app.get('/nsa', function (req, res) {
    res.render('nsa');
});

// This handler is a catch-all for 404s
app.use(function (req, res) {
    res.status(404).sendFile(__dirname + "/public/images/404_leo.jpg");
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
    	socket.broadcast.emit('sysmessage', data);
    })
});

http.listen(port, function() {
    console.log('Listening on %s', port);
});
