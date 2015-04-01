//// Add startsWith(str) to string
//if (typeof String.prototype.startsWith != 'function') {
//    String.prototype.startsWith = function (str) {
//        return this.substring(0, str.length) === str;
//    }
//};

//var username = '';
//var avatar = '/public/images/nico_yds.jpg';
//if(localStorage.getItem("avatar") != null) {
//    avatar = localStorage.getItem("avatar");
//}

//if(localStorage.getItem("username") != null) {
//    username = localStorage.getItem("username");
//}
//else {
//    setUsername();
//}

//var socket = io.connect('http://'+ip+':'+port);

//socket.on('conn', function() {
//    socket.emit('conn', username);
//})

//socket.on('message', function (data) {
//    if(data.message == "/nsa") {
//        sendFreedom(data.username);
//        return;
//    }
//    document.getElementById("chat").innerHTML = constructMessage(data.avatar, data.username, data.message, data.time) + document.getElementById("chat").innerHTML
//});

//socket.on('sysmessage', function (data) {
//    document.getElementById("chat").innerHTML = sysMessage(data) + document.getElementById("chat").innerHTML;
//});

//function send() {
//    var time = Date.now();
//    var content = document.getElementById("message").value;

//    if (content.startsWith("http://www.reactiongifs.com/")) {
//        content = ".reac." + content.substr("http://www.reactiongifs.com/".length, content.length);
//        console.log(content);
//    }

//    var data = { 'username': username, 'avatar': avatar, 'message': content, 'time' : time };
//    sendMessage(data);
//    document.getElementById("message").value = "";

//    document.getElementById('submit').disabled = true;
//    setTimeout(function () { document.getElementById('submit').disabled = false; }, 500);
//}

//function sendMessage(data) {
//    socket.emit('message', data);
//}

//function constructMessage(avatar, username, content, time) {
//    var date = new Date(time);
//    if(content == "/lenny") {
//        content = "( ͡° ͜ʖ ͡°)";
//    }
    
//    var splitted = content.split(".");
//    switch (splitted[1]) {
//        case "reac":
//            content = "<a href='http://www.reactiongifs.com/" + splitted[2] + ".gif' target='_blank'><img src='http://www.reactiongifs.com/" + splitted[2] + ".gif' /><a/>"
//            break;
//    }
//    var html = '';
//    html += '<br />';
//    html += '<div>';
//    html += '<a href=\'' + avatar + '\' target="_blank" ><img class=\'avatar\' src=\'' + avatar + '\'/></a>';
//    html += '<div><b class=\'pseudo\'>' + username + '</b>  ';
//    html += '<span class=\'messageTime\'>' + (date.getHours() < 10 ? '0' : '') + date.getHours() + 'h' + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes() + '</span><br />';
//    html += '<span class=\'messageContent\' >' + content + '</span></div></div>';
//    html += '</div>'
//    html += '<hr class=\'endmessage\'/>';

//    return html;
//}

//function sysMessage(data) {
//    var date = new Date(Date.now());

//    var html = '';
//    html += '<br />';
//    html += '<div>';
//    html += '<span class=\'sysMessageContent\'>' + (date.getHours() < 10 ? '0' : '') + date.getHours() + 'h' + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes() + ' : ';
//    html += data.username + ' entered the chat</span></div></div>';
//    html += '</div>'
//    html += '<hr class=\'endmessage\'/>';

//    return html;
//}

//function setAvatar() {
//    avat = prompt("Enter your avatar's url :");
    
//    if (isEmptyOrSpaces(avat)) {
//        avatar = '/public/images/nico_yds.jpg';
//    }
//    else {
//        avatar = avat;
//        localStorage.setItem("avatar", avat);
//    }
//}

// Add isEmptyOrSpaces function to String
if (typeof String.prototype.isEmptyOrSpaces != 'function') {
    String.prototype.isEmptyOrSpaces = function () {
        return this === null || this.match(/^ *$/) !== null;
    }
}

var username = 'I suck';
var avatar = '/public/images/nico_yds.jpg';
var socket = io.connect('http://' + ip + ':' + port);

connect();

function connect () {
    var username = prompt("Enter your username", "I suck");
    var avatar = prompt("Enter your avatar's url", "/public/images/nico_yds.jpg");

    socket.emit('newUser', { 'username': username, 'avatar': avatar } );
}

function setUsername() {
    var newUsername = prompt("Enter your username :", username);

    if(newUsername === "Poxymyr" || newUsername === "Vega"){
        passwd = prompt("This username is reserved ;) \nEnter the password :", "012345");
        if(CryptoJS.MD5(passwd) == "e86eb3868e5cb0e27f4822d1b30213e1"){
            username = newUsername;
            localStorage.setItem("username", newUsername);
        }
        else {
            alert("Wrong password biyotch!");
            setUsername();
        }
    }
    else if (newUsername.isEmptyOrSpaces()) {
        username = newUsername;
        localStorage.setItem("username", newUsername);
    }
    else {
        username = 'I suck';
    }

    socket.emit('setUsername', username);
}

function setAvatar() {
    var newAvatar = prompt("Enter your avatar's url :");

    if (isEmptyOrSpaces(newAvatar)) {
        avatar = '/public/images/nico_yds.jpg';
    }
    else {
        avatar = newAvatar;
        localStorage.setItem("avatar", newAvatar);

        socket.emit('setAvatar', newAvatar);
    }
}