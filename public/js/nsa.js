function sendFreedom(){
    var frameElements = document.getElementById('frame').contentWindow;
    console.log(frameElements);
    console.log(frameElements.username);

    var time = Date.now();
    var data = { 'username': username, 'avatar': avatar, 'message': "<img src='http://img-9gag-ftw.9cache.com/photo/azEqe2b_460sv.mp4'/>", 'time' : time };
    frameElements.sendMessage(data);
}