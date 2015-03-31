function sendFreedom(){
    var freedom = '<video preload="auto" style="min-height:336.52173913043px;width: 600px;;display:block;margin:0 auto;" width="400" loop="" autoplay="autoplay"><source src="http://img-9gag-ftw.9cache.com/photo/azEqe2b_460sv.mp4" type="video/mp4"></video>';

    var time = Date.now();
    var data = { 'username': username, 'avatar': avatar, 'message': freedom, 'time' : time };
    sendMessage(data);
}