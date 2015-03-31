var http = require("http");
var fs = require("fs");
var express = require("express");
var io = require("socket.io").listen(3132);

var index = fs.readFileSync('index.html');

var app = express();

// Define static folders
app.use('/' , express.static(__dirname, '/public'));

app.get("/", function (req, res) {
    res.end(index);
});

app.all('/*', function (req, res) {
    res.status(404).send("<img src='/public/images/404_leo.jpg' />");
});

io.sockets.on('connection', function (socket) {
    socket.on('message', function (data) {
        socket.emit('message', data);
        socket.broadcast.emit('message', data);
    })
});

app.listen(3131);