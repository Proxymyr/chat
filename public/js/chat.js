//socket.on('message', function (data) {
//    if(data.message == "/nsa") {
//        sendFreedom(data.username);
//        return;
//    }
//    document.getElementById("chat").innerHTML = constructMessage(data.avatar, data.username, data.message, data.time) + document.getElementById("chat").innerHTML
//});


//=============================
//===== Helpers Functions =====
//=============================

// Add isEmptyOrWhitespace function to String
if (typeof String.prototype.isEmptyOrWhitespace != 'function') {
	String.prototype.isEmptyOrWhitespace = function () {
		return this === null || this.match(/^ *$/) !== null;
	}
}

//=======================================
//===== Connection & User Functions =====
//=======================================

// Connect to server's socket
var socket = io.connect(location.host);

// Get username and avatar
var username = 'I suck';
var avatar = '/public/images/nico_yds.jpg';

if (localStorage.getItem("avatar") != null && localStorage.getItem("username") != null) {
	username = localStorage.getItem("username");
	avatar = localStorage.getItem("avatar");
	
	socket.emit('userConnect', { 'username': username, 'avatar': avatar });
}
else {
	connect();
}

// First connection to the chat
function connect() {
	// Connect to the chat server and set username and avatar
	username = prompt("Enter your username", "I suck");
	avatar = prompt("Enter your avatar's url", "/public/images/nico_yds.jpg");
	
	if (username.isEmptyOrWhitespace()) {
		username = "I suck";
	}
	
	if (avatar.isEmptyOrWhitespace()) {
		avatar = "/public/images/nico_yds.jpg";
	}
	
	localStorage.setItem("username", username);
	localStorage.setItem("avatar", avatar);
	
	// TODO Passez en POST
	socket.emit('userConnect', { 'username': username, 'avatar': avatar });
}

// Change user's name
function setUsername() {
	var newUsername = prompt("Enter your username :", username);
	
	setUserData(newUsername, avatar, "");
}


// Change user's avatar
function setAvatar() {
	var newAvatar = prompt("Enter your avatar's url :");
	
	setUserData(username, newAvatar, "");
}

// Update the user's data on the server
function setUserData(newUsername, newAvatar, password) {
	if (password !== "") {
		var passwdHash = CryptoJS.MD5(password).toString(CryptoJS.enc.Hex);
	}
	
	var request = new XMLHttpRequest();
	request.open('PUT', encodeURI('api/user/' + username), true);
	request.setRequestHeader('Content-Type', 'application/json');
	request.send(JSON.stringify({ 'username': newUsername, 'avatar': newAvatar, 'password': passwdHash }));
	
	request.onload = function () {
		if (this.status >= 200 && this.status < 400) {
			username = JSON.parse(this.response).newUsername;
			avatar = JSON.parse(this.response).newAvatar;
			
			localStorage.setItem("username", username);
			localStorage.setItem("avatar", avatar);
		} else if (this.status == 403) {
			passwd = prompt(JSON.parse(this.response).errors[0], "Password");
			setUserData(newUsername, newAvatar, passwd);
		} else {
			alert(JSON.parse(this.response).errors[0]);
		}
	};
}

//=============================
//========= Socket.IO =========
//=============================

// Displays a message
socket.on('message', function (message) {
	switch (message.type) {
		case 'userConnection':
			displayConnection(message.user, message.time);
			break;

		case 'userDisconnection':
			displayDisconnection(message.user, message.time);
			break;

		case 'usernameChanged':
			displayUsernameChange(message.user, message.time);
			break;

		case 'userMessage':
			displayMessage(message.user, message.message);
			break;
	}
});

//=============================
//====== Message Sending =====
//=============================

// Send an user message
function send() {
	// Get message timestamp
	var time = Date.now();
	
	// Get message content
	var content = document.getElementById("message").value;
	
	// Parse reactiongifs url to send .reac. command
	if (content.startsWith("http://www.reactiongifs.com/")) {
		content = ".reac." + content.substr("http://www.reactiongifs.com/".length, content.length);
	}
	
	// Create message data and send it
	var data = { 'username': username, 'avatar': avatar, 'content': content, 'time' : time };
	sendMessage(data);
	document.getElementById("message").value = "";
	
	// Disable send button to limit spam
	document.getElementById('submit').disabled = true;
	setTimeout(function () { document.getElementById('submit').disabled = false; }, 500);
}

function sendMessage(data) {
	socket.emit('userMessage', data);
}

//=============================
//===== Message Handling ======
//=============================

// Display a message
function displayMessage(user, message) {
	var date = new Date(message.time);
	
	if (message.content == "/lenny") {
		content = "( ͡° ͜ʖ ͡°)";
	}
	
	var splitted = message.content.split(".");
	switch (splitted[1]) {
		case "reac":
			message.content = "<a href='http://www.reactiongifs.com/" + splitted[2] + ".gif' target='_blank'><img src='http://www.reactiongifs.com/" + splitted[2] + ".gif' /></a>"
			break;
	}
	
	
	/* GENERATED HTML SCHEMA
     * (need to make a template)
     * 
     * <br />
     * <div>
     *   <a><img src='avatar' /></a>  
     *   <div>
     *     <b>Pseudo</b>
     *     <span>20h00</span>
     *     <br />
     *     <div>
     *       <span>Content</span>
     *       <span>EraseButton</span>
     *     </div>
     *   </div>
     * </div>
     * <hr />
     */
    
    var html = '';
	html += '<br />';
	html += '<div>';
	html += '<a href=\'' + user.avatar + '\' target="_blank" ><img class=\'avatar\' src=\'' + user.avatar + '\'/></a>';
	html += '<div><b class=\'pseudo\'>' + user.username + '</b> ';
	html += '<span class=\'messageTime\'>' + (date.getHours() < 10 ? '0' : '') + date.getHours() + 'h' + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes() + '</span><br />';
	html += '<div><span class=\'messageContent\' >' + message.content + '</span>';
	html += '<span style="float: right"><img src=/public/images/delete.jpg width="25px" height="25px" onclick="eraseMessage(this)"></img></span></div>';
	html += '</div></div>'
	html += '<hr class=\'endmessage\'/>';
	
	document.getElementById("chat").innerHTML = html + document.getElementById("chat").innerHTML;
}

// Display an user connection message
function displayConnection(user, time) {
	var date = new Date(time);
	
	var html = '';
	html += '<br />';
	html += '<div>';
	html += '<span class=\'sysMessageContent\'>' + (date.getHours() < 10 ? '0' : '') + date.getHours() + 'h' + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes() + ' : ';
	html += '<b>' + user.username + '</b> entered the chat</span></div></div>';
	html += '</div>'
	html += '<hr class=\'endmessage\'/>';
	
	document.getElementById("chat").innerHTML = html + document.getElementById("chat").innerHTML;
}

// Display an user disconnection message
function displayDisconnection(user, time) {
	var date = new Date(time);
	
	var html = '';
	html += '<br />';
	html += '<div>';
	html += '<span class=\'sysMessageContent\'>' + (date.getHours() < 10 ? '0' : '') + date.getHours() + 'h' + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes() + ' : ';
	html += '<b>' + user.username + '</b> leaved the chat</span></div></div>';
	html += '</div>'
	html += '<hr class=\'endmessage\'/>';
	
	document.getElementById("chat").innerHTML = html + document.getElementById("chat").innerHTML;
}

// Display an user username change message
function displayUsernameChange(user, time) {
	var date = new Date(time);
	
	var html = '';
	html += '<br />';
	html += '<div>';
	html += '<span class=\'sysMessageContent\'>' + (date.getHours() < 10 ? '0' : '') + date.getHours() + 'h' + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes() + ' : ';
	html += '<b>' + user.oldUsername + '</b>\'s name changed to <b>' + user.newUsername + '</b></span></div></div>';
	html += '</div>'
	html += '<hr class=\'endmessage\'/>';
	
	document.getElementById("chat").innerHTML = html + document.getElementById("chat").innerHTML;
}

//=============================
//====== Chat Commands ========
//=============================

// Remove message's content
function eraseMessage(context) {
	var divnumber = context.parentElement.parentElement;
	var html = '<div><span class=\'messageContent\'><dfn>"Message Deleted"</dfn></span></div>';
	divnumber.innerHTML = html;
}