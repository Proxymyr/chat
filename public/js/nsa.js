function sendFreedom() {
	// Create message content
	var freedom = 'GET SOME FREEDOM !!<br /><video preload="auto" style="min-height:336.52173913043px;width: 600px;;display:block;margin:0 auto;" width="400" loop="" autoplay="autoplay"><source src="http://img-9gag-ftw.9cache.com/photo/azEqe2b_460sv.mp4" type="video/mp4"></video>';
	
	// Create message data and send it
	var data = { 'username': 'MURICA', 'avatar': 'http://fc04.deviantart.net/fs70/f/2012/134/d/7/profile_picture_by_freedomeagleplz-d4zr8rl.jpg', 'content': freedom, 'time' : Date.now() };
	sendMessage(data);
}

function feelFreedom() {
	// Create message content	
	var freedom = "<img src='http://www.reactiongifs.com/r/freedom.gif'/>";
	
	// Create message data and send it
	var data = { 'username': 'MURICA', 'avatar': 'http://fc04.deviantart.net/fs70/f/2012/134/d/7/profile_picture_by_freedomeagleplz-d4zr8rl.jpg', 'content': freedom, 'time' : Date.now() };
	sendMessage(data);
}