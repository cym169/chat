var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    users = [],
    io = require('socket.io').listen(server),
    emoji = require('./emoji.json');

app.use('/', express.static(__dirname + '/src'));

app.get('/api/iconLength', function(req, res) {
    res.json({
        code: 200,
        data: emoji
    })
});
io.sockets.on('connection', function(socket) {
	// 登录
	socket.on('login',function(username){
		if(users.indexOf(username) > -1){
			socket.emit('existed');
		}else{
			socket.username = username;
			users.push(username);
			socket.emit('success');
			io.sockets.emit('system', username, users.length, 0);
		}
	});

	// 退出
	socket.on('disconnect', function() {
        if (socket.username != null) {
            //users.splice(socket.userIndex, 1);
            users.splice(users.indexOf(socket.username), 1);
            socket.broadcast.emit('system', socket.username, users.length, 1);
        }
    });

    //获得新消息并发送给其他人
    socket.on('postMsg', function(msg) {
        socket.broadcast.emit('newMsg', socket.username, msg);
    });

    //获得图片消息并发送给其他人
    socket.on('img', function(imgData) {
        socket.broadcast.emit('newImg', socket.username, imgData);
    });


});

var mm = server.listen(2333,'172.16.2.64');

