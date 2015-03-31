var username = '';
var avatar = '/public/images/nico_yds.jpg';

setUsername();

var socket = io.connect('http://10.17.245.232:3132');
socket.on('message', function (data) {
    document.getElementById("chat").innerHTML = constructMessage(data.avatar, data.username, data.message, data.time) + document.getElementById("chat").innerHTML;
});

function send() {
    var time = Date.now();
    var data = { 'username': username, 'avatar': avatar, 'message': document.getElementById("message").value, 'time' : time };

    document.getElementById('submit').disabled = true;
    setTimeout(function () { document.getElementById('submit').disabled = false; }, 500);

    socket.emit('message', data);
    document.getElementById("message").value = "";
}

function constructMessage(avatar, username, content, time) {
    var date = new Date(time);

    var html = '';
    html += '<br />';
    html += '<div>';
    html += '<a href=\'' + avatar + '\' target="_blank" ><img class=\'avatar\' src=\'' + avatar + '\'/></a>';
    html += '<div><b class=\'pseudo\'>' + username + '</b>  ';
    html += '<span class=\'messageTime\'>' + date.getHours() + 'h' + date.getMinutes() + '</span><br />';
    html += '<span class=\'messageContent\' >' + content + '</span></div></div>';
    html += '</div>'
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