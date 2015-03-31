var username = '';
var avatar = '/public/images/nico_yds.jpg';
if(localStorage.getItem("avatar") != null) {
    avatar = localStorage.getItem("avatar");
}

if(localStorage.getItem("username") != null) {
    username = localStorage.getItem("username");
}
else {
    setUsername();
}


var socket = io.connect('http://localhost:3132');
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
        localStorage.setItem("avatar", avat);
    }
}

function setUsername() {
    usern = prompt("Enter your username :");
    
    if(usern === "Poxymyr" || usern === "Vega"){
        passwd = prompt("This username is reserved ;) \n enter the password :");
        if(CryptoJS.MD5(passwd) === "e86eb3868e5cb0e27f4822d1b30213e1"){
            username = usern;
        }
        else {
            alert("Wrong password bitch!");
            setUsername();
        }
    }
    else if (!isEmptyOrSpaces(usern)) {
        username = usern;
        localStorage.setItem("username", usern);
    }
    else {
        username = 'I suck';
    }
}

function isEmptyOrSpaces(str) {
    return str === null || str.match(/^ *$/) !== null;
}