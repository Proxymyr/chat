var username = '';
var avatar = '/public/images/nico_yds.jpg';

setUsername();

var socket = io.connect('http://192.168.0.15:3132');
socket.on('message', function (data) {
    document.getElementById("chat").innerHTML = constructMessage(data.avatar, data.username, data.message) + document.getElementById("chat").innerHTML;
});

function send() {
    document.getElementById('submit').disabled = true;
    setTimeout(function () { document.getElementById('submit').disabled = false; }, 500);
    
    socket.emit('message', { 'username': username, 'avatar': avatar, 'message': document.getElementById("message").value });
    document.getElementById("message").value = "";
}

function constructMessage(avatar, username, content) {
    var html = '';
    html += '<br />';
    html += '<div><a href=\'' + avatar + '\' target="_blank" ><img class=\'avatar\' src=\'' + avatar + '\'/></a></div>';
    html += '<div><b>' + username + '</b><br />';
    html += content + '</div></div>';
    html += '<hr class=\'endmessage\'/>';
    
    return html;
}

function setAvatar() {
    avat = prompt("Enter your avatar's url :");
    
    if (isEmptyOrSpaces(avat)) {
        avatar = '/public/images/nico_yds.jpg';
    }
    else {
        avatar = avat;
    }
}

function setUsername() {
    usern = prompt("Enter your username :");
    
    if (isEmptyOrSpaces(usern)) {
        username = 'I suck';
    }
    else {
        username = usern;
    }
}

function isEmptyOrSpaces(str) {
    return str === null || str.match(/^ *$/) !== null;
}