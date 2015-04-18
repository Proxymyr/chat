//=============================
//======= Server Setup ========
//=============================
var fs = require("fs");
var path = require('path');
var express = require("express");
var socket = require("socket.io");
var bodyParser = require("body-parser");
var userModel = require("./database.js").User;

// Loggers files
var morgan = require("morgan");
var logger = require("./logger");

// Get port
var port = parseInt(process.argv[2]) || 4141;

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

// GET /
app.get("/", function (req, res) {
	res.render('index');
});

// GET /nsa
app.get('/nsa', function (req, res) {
	res.render('nsa');
});

// PUT /api/user/MyUsername
app.put('/api/user/:username', function (req, res) {
	var oldUsername = req.params.username;
	var user = getUserByPropertyValue('username', oldUsername)[0];
	
	if (!checkUserConnection(user, req, res)) return;
	
	if (!checkUserData(req, res)) return;
	
	if (isNewUsername && !checkPassword(user, req, res)) return;
	
	var newUsername = HTMLToPlainText(req.body.username);
	var isNewUsername = oldUsername != newUsername;
	
	// All checks passed, change the user's data
	var oldAvatar = user.avatar;
	var newAvatar = HTMLToPlainText(req.body.avatar);
	
	user.username = newUsername;
	user.avatar = newAvatar;
	
	res.writeHead(200, { 'Content-type': 'application/json' });
	res.end(JSON.stringify({ 'oldUsername': oldUsername, 'newUsername': newUsername, 'oldAvatar': oldAvatar, 'newAvatar': newAvatar }));
	
	if (isNewUsername) {
		io.sockets.emit('message', { 'type': 'usernameChanged', 'user': { 'oldUsername': oldUsername, 'newUsername': newUsername }, 'time': Date.now() });
	}
});

logger.debug("Overriding 'Express' logger");
app.use(morgan("combined", { "stream": logger.stream }));

// Avoid leaking stacktrace to user
app.use(function (err, req, res, next) {
	logger.error('ERROR', err.stack);
	next();
});

// This handler is a catch-all for 404 errors
app.use(function (req, res) {
	res.status(404).sendFile(__dirname + "/public/images/404_leo.jpg");
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
		
		var userAvatar = '/public/images/nico_yds.jpg';
		
		// Get user from database with its username	
		userModel.findOne({ username: data.username }).exec(function (err, foundUser) {
			
			// Add the user to the database if it doesn't exists
			if (foundUser == null) {
				foundUser = new userModel({
					username: data.username,
					avatar: userAvatar,
					level: 'user',
					password: ''
				});
				foundUser.save();
				
				logger.info('USER CREATED', data.username);
			}
			
			// Store user data
			var user = { 'ip': ip, 'socket': socketId, 'username': data.username, 'avatar': foundUser.avatar };
			users.push(user);
			
			logger.info('CONNECT', user);
			
			// Alert all users of the connection
			connData = { 'type': 'userConnection', 'user': { 'username': HTMLToPlainText(user.username), 'avatar': user.avatar }, 'time': Date.now() };
			io.sockets.emit('message', connData);
		});
	});
	
	// User disconnection
	socket.on('disconnect', function (data) {
		
		var user = getUserByPropertyValue('socket', socketId)[0];
		
		if (user !== undefined) {
			var oldUsername = user.username;
			var oldAvatar = user.avatar;
			
			users.splice(users.indexOf(user), 1);
			
			// Alert all users of the disconnection
			disconnData = { 'type': 'userDisconnection', 'user': { 'username': oldUsername, 'avatar': oldAvatar }, 'time': Date.now() };
			socket.broadcast.emit('message', disconnData);
		}
	});
	
	// User sending message
	socket.on('userMessage', function (messageData) {
		
		var user = getUserByPropertyValue('socket', socketId)[0];
		
		logger.info('MESSAGE', messageData);
		
		if (user.username != HTMLToPlainText(messageData.username) && user.username != "Vega" && user.username != "Poxymyr") {
			socket.emit('message', { 'type': 'sysMessage', 'message': 'Can\'t use this function without rights' });
			return;
		}
		
		// Send message to all users
		if (user !== undefined) {
			messageData = { 'type': 'userMessage', 'user': { 'username': HTMLToPlainText(messageData.username), 'avatar': HTMLToPlainText(messageData.avatar) }, 'message': { 'content': HTMLToPlainText(messageData.content), 'time': messageData.time } };
			socket.broadcast.emit('message', messageData);
			
			messageData.type = 'ownMessage';
			socket.emit('message', messageData);
		}
	});
});

//=============================
//========== Checks ===========
//=============================

// Check the user identity based on ip and username
function checkUserConnection(user, request, response) {
	// Username not found in list
	if (user === undefined) {
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
	if (request.body.username === undefined || request.body.username == null || request.body.username.isEmptyOrWhitespace()) {
		response.writeHead(400, { 'Content-type': 'application/json' });
		response.end(JSON.stringify({ 'errors': ['Can\'t use an empty username'] }));
		return false;
	}
    // Empty avatar
	else if (request.body.avatar === undefined || request.body.avatar == null || request.body.avatar.isEmptyOrWhitespace()) {
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
		if (request.body.password === undefined || request.body.password.isEmptyOrWhitespace()) {
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

// Convert HTML markup to plain text to avoid interpretation client-side
function HTMLToPlainText(string) {
	string = string.replace(/</g, "&lt;");
	string = string.replace(/>/g, "&gt;");
	return string;
}