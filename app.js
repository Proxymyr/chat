var http = require("http");
var fs = require("fs");
var express = require("express");
var io = require("socket.io").listen(3132);

var index = fs.readFileSync('index.html');

var app = express();

app.get("/", function(req, res) {
	res.end(index);
});

io.sockets.on('connection', function (socket) {
	//socket.emit("message", {username : "Moobot", message : '<img id="iii" src="http://static2.businessinsider.com/image/509802cb69bedd6209000009/nicolas-cage-will-be-in-the-expendables-3.jpg"></img>'});
	socket.on('message', function(data) {
		if(data.avatar == null) {
			data.avatar = "http://static2.businessinsider.com/image/509802cb69bedd6209000009/nicolas-cage-will-be-in-the-expendables-3.jpg";
		}

		socket.emit('message', data);
		socket.broadcast.emit('message', data);
	})
});


app.listen(3131);