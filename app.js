//=============================
//======= Server Setup ========
//=============================
var fs = require("fs");
var path = require('path');
var express = require("express");
var socket = require("socket.io");
var bodyParser = require("body-parser");
var entities = require("entities");

// Loggers files
var morgan = require("morgan");
var logger = require("./logger");

// Get port
var port = parseInt(process.argv[2]) || 3131;

// Start server
var app = express();
var server = app.listen(port, function () {
	console.log('Listening on %s', port);
});
var io = socket(server);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Define static folders
app.use('/', express.static(__dirname, '/public'));
app.use(bodyParser.json({ extended: true }));

// Users list
var users = new Array();

//=============================
//======= Urls Handling =======
//=============================

app.get("/", function (req, res) {
	res.render('index');
});

app.get('/nsa', function (req, res) {
	res.render('nsa');
});

app.put('/api/user/:username', function (req, res) {
	var oldUsername = req.params.username;
	var newUsername = HTMLToPlainText(req.body.username);
	var isNewUsername = oldUsername != newUsername;
	var user = getUserByPropertyValue('username', oldUsername)[0];
	
	if (!checkUserConnection(user, req, res)) return;
	
	if (!checkUserData(req, res)) return;
	
	if (isNewUsername && !checkPassword(user, req, res)) return;
	
	// All checks passed, change the user's data
	var oldAvatar = user.avatar;
	var newAvatar = HTMLToPlainText(req.body.avatar);
	
	user.username = newUsername;
	user.avatar = newAvatar;
	
	res.writeHead(200, { 'Content-type': 'application/json' });
	res.end(JSON.stringify({ 'oldUsername': oldUsername, 'newUsername': user.username, 'oldAvatar': oldAvatar, 'newAvatar': user.avatar }));
	
	if (isNewUsername) {
		io.sockets.emit('message', { 'type': 'usernameChanged', 'user': { 'oldUsername': oldUsername, 'newUsername': user.username }, 'time': Date.now() });
	}
});

logger.debug("Overriding 'Express' logger");
app.use(morgan("default", { "stream": logger.stream }));

// Avoid leaking stacktrace to user
app.use(function(err, req, res) {
	logger.error('error %s', err.message);
});

// This handler is a catch-all for 404 errors
app.use(function (req, res) {
	res.status(404).sendFile(__dirname + "/public/images/404_leo.jpg");
});

io.sockets.on('connection', function (socket) {
	
	// Store socket id and ip
	var ip = socket.handshake.address;
	var socketId = socket.id;
	
	// User first connection
	socket.on('userConnect', function (data) {
		
		// Store user data
		users.push({ 'ip': ip, 'socket': socketId, 'username': data.username, 'avatar': data.avatar });

		data.username = entities.encodeHTML(data.username);
		data.avatar = entities.encodeHTML(data.avatar);

		// Alert all users of the connection
		connData = { 'type': 'userConnection', 'user': { 'username': data.username, 'avatar': data.avatar }, 'time': Date.now() };
		io.sockets.emit('message', connData);
	});
	
	// User disconnection
	socket.on('disconnect', function (data) {
		
		var user = getUserByPropertyValue('socket', socketId)[0];
		
		if (typeof user != 'undefined') {
			var oldUsername = user.username;
			var oldAvatar = user.avatar;
			
			users.splice(users.indexOf(user), 1);

			oldUsername = entities.encodeHTML(oldUsername);
			oldAvatar = entities.encodeHTML(oldAvatar);

			// Alert all users of the disconnection
			disconnData = { 'type': 'userDisconnection', 'user': { 'username': oldUsername, 'avatar': oldAvatar }, 'time': Date.now() };
			socket.broadcast.emit('message', disconnData);
		}
	});
	
	// User sendind message
	socket.on('userMessage', function (messageData) {
		
		var user = getUserByPropertyValue('socket', socketId)[0];

		logger.info('message %s', messageData);

		messageData.username = entities.encodeHTML(messageData.username);
		messageData.avatar = entities.encodeHTML(messageData.avatar);
		messageData.content = entities.encodeHTML(messageData.content);
		messageData.time = new Date(messageData.time);

		// Send message to all users
		if (typeof user != 'undefined') {
			messageData = { 'type': 'userMessage', 'user': { 'username': messageData.username, 'avatar': messageData.avatar }, 'message': { 'content': messageData.content, 'time': messageData.time } };
			io.sockets.emit('message', messageData);
		}
	});
});

//=============================
//========== Checks ===========
//=============================

// Check the user identity based on ip and username
function checkUserConnection(user, request, response) {
	// Username not found in list
	if (typeof user == 'undefined') {
		response.writeHead(404, { 'Content-type': 'application/json' });
		response.end(JSON.stringify({ 'errors': ['Username not found'] }));
		return false;
	}
	// Sender ip is not user's ip
	else if (user.ip != request.connection.remoteAddress) {
		response.writeHead(403, { 'Content-type': 'application/json' });
		response.end(JSON.stringify({ 'errors': ['No rights to change user\'s data'] }));
		return false;
	}
	
	return true;
}

// Check the user's name and avatar
function checkUserData(request, response) {
	// Empty username
	if (typeof request.body.username == 'undefined' || request.body.username.isEmptyOrWhitespace()) {
		response.writeHead(400, { 'Content-type': 'application/json' });
		response.end(JSON.stringify({ 'errors': ['Can\'t use an empty username'] }));
		return false;
	}
	// Empty avatar
	else if (typeof request.body.avatar == 'undefined' || request.body.avatar.isEmptyOrWhitespace()) {
		response.writeHead(400, { 'Content-type': 'application/json' });
		response.end(JSON.stringify({ 'errors': ['Can\'t use an empty avatar'] }));
		return false;
	}
	
	return true;
}

// Check the user's password if needed
function checkPassword(user, request, response) {
	if (request.body.username == "Vega" || request.body.username == "Poxymyr") {
		// No password
		if (typeof request.body.password == 'undefined' || request.body.password.isEmptyOrWhitespace()) {
			response.writeHead(403, { 'Content-type': 'application/json' });
			response.end(JSON.stringify({ 'errors': ['This username is reserved ;) \nEnter the password :'] }));
			return false;
		}
		// Wrong password
		else if (request.body.password != "e86eb3868e5cb0e27f4822d1b30213e1") {
			response.writeHead(403, { 'Content-type': 'application/json' });
			response.end(JSON.stringify({ 'errors': ['Wrong password biatch !'] }));
			return false;
		}
	}
	
	return true;
}

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
	})
};
