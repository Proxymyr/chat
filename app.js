//============================
//====== Server Setup ========
//============================

var addr = process.argv[2];
var port = parseInt(process.argv[3]);

var fs = require("fs");
var http = require("http");
var path = require('path');
var express = require("express");
var bodyParser = require("body-parser");
var io = require("socket.io").listen(port + 1);

var app = express();

var users = new Array();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Define static folders
app.use('/', express.static(__dirname, '/public'));
app.use(bodyParser.json({ extended: true }));

//=============================
//======= Urls Handling =======
//=============================

app.get("/", function (req, res) {
    res.render('index', { ip : addr, port : port + 1 });
});

app.get('/nsa', function (req, res) {
    res.render('nsa', { ip : addr, port : port + 1 });
});

app.put('/api/user/:username', function (req, res) {
    var oldUsername = req.params.username;
    var user = getUserByPropertyValue('username', oldUsername)[0];
    
    // Username not found in list
    if (typeof user == 'undefined') {
        res.writeHead(404, { 'Content-type': 'application/json' });
        res.end(JSON.stringify({ 'errors': ['Username not found'] }));
    }
    // Sender ip not user's ip
    else if (user.ip != req.connection.remoteAddress) {
        res.writeHead(403, { 'Content-type': 'application/json' });
        res.end(JSON.stringify({ 'errors': ['No rights to change user\'s data'] }));
    }
    // Empty username
    else if (req.body.username == null || req.body.username.isEmptyOrWhitespace()) {
        res.writeHead(400, { 'Content-type': 'application/json' });
        res.end(JSON.stringify({ 'errors': ['Can\'t use an empty username'] }));
    }
    // Empty avatar
    else if (req.body.avatar == null || req.body.avatar.isEmptyOrWhitespace()) {
        res.writeHead(400, { 'Content-type': 'application/json' });
        res.end(JSON.stringify({ 'errors': ['Can\'t use an empty avatar'] }));
    }
    // OK
    else {
        var oldAvatar = user.avatar;
        
        user.username = req.body.username;
        user.avatar = req.body.avatar;
        
        res.writeHead(200, { 'Content-type': 'application/json' });
        res.end(JSON.stringify({ 'oldUsername': oldUsername, 'newUsername': user.username, 'oldAvatar': oldAvatar, 'newAvatar': user.avatar }));

        io.sockets.emit('message', {'type': 'usernameChanged', 'user': { 'oldUsername': oldUsername, 'newUsername': user.username }, 'time': Date.now() });
    }
});

app.all('/*', function (req, res) {
    res.status(404).send("<img src='/public/images/404_leo.jpg' />");
});

//=============================
//========= Socket.IO =========
//=============================

io.sockets.on('connection', function (socket) {
    
    // Store socket id and ip
    var ip = socket.handshake.address;
    var socketId = socket.id;
    
    // User first connection
    socket.on('userConnect', function (data) {
        
        // Store user data
        users.push({ 'ip': ip, 'socket': socketId, 'username': data.username, 'avatar': data.avatar });
        
        // Alert all users of the connection
        connData = { 'type': 'userConnection', 'user': { 'username': data.username, 'avatar': data.avatar }, 'time': Date.now() };
        io.sockets.emit('message', connData);
    });
    
    socket.on('disconnect', function (data) {
        
        var user = getUserByPropertyValue('socket', socketId)[0];
        
        if (typeof user != 'undefined') {
            var oldUsername = user.username;
            var oldAvatar = user.avatar;
            
            users.splice(users.indexOf(user), 1);
            
            disconnData = { 'type': 'userDisconnection', 'user': { 'username': oldUsername, 'avatar': oldAvatar }, 'time': Date.now() };
            socket.broadcast.emit('message', disconnData);
        }
    });
    
    socket.on('userMessage', function (messageData) {
        
        var user = getUserByPropertyValue('socket', socketId)[0];
        
        if (typeof user != 'undefined') {
            messageData = { 'type': 'userMessage', 'user': { 'username': messageData.username, 'avatar': messageData.avatar }, 'message': { 'content': messageData.content, 'time': messageData.time } };
            io.sockets.emit('message', messageData);
        }
    });
});

//=============================
//===== Helpers Functions =====
//=============================

// Add isEmptyOrWhitespace function to String
if (typeof String.prototype.isEmptyOrWhitespace != 'function') {
    String.prototype.isEmptyOrWhitespace = function () {
        return this === null || this.match(/^ *$/) !== null;
    }
}

// Filter users in the list by a property
function getUserByPropertyValue(propertyName, value) {
    return users.filter(function (value) {
        if (value[propertyName] === value[propertyName]) {
            return value;
        }
    });
}

// Start server
app.listen(port);