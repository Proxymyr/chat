function sendFreedom() {
    if (username == 'Vega' || username == 'Poxymyr') {
        var freedom = 'GET SOME FREEDOM !!<br /><video preload="auto" style="min-height:336.52173913043px;width: 600px;;display:block;margin:0 auto;" width="400" loop="" autoplay="autoplay"><source src="http://img-9gag-ftw.9cache.com/photo/azEqe2b_460sv.mp4" type="video/mp4"></video>';
        
        var time = Date.now();
        var data = { 'username': 'MURICA', 'avatar': 'http://fc04.deviantart.net/fs70/f/2012/134/d/7/profile_picture_by_freedomeagleplz-d4zr8rl.jpg', 'message': freedom, 'time' : time };
        sendMessage(data);
    }
}