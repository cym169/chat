var express = require('express'),
    mysql = require('mysql'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    util = require("./util/util.js"),
    emoji = require('./emoji.json');

var pool = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '3239950',
    database : 'record'
});

pool.connect();
app.use('/', express.static(__dirname + '/src'));

var avatar = "http://www.91pool.com/img/hsr_icon.png";

io.sockets.on('connection', function(socket) {

    var userId = -1;

	// 登录
	socket.on('login',function(username,password){
        var  sql = 'SELECT * FROM users';
        pool.query(sql,function (err, result) {
            if(err){
                console.log('[查询错误] - ',err.message);
                return;
            }

            var userInfo = findElem(username,password,result);
            if(userInfo.status && userInfo.status == 1){
                socket.emit('existed');
                return;
            }

            var createDate = util.formatDate((new Date).getTime());
            var latestDate = util.formatDate((new Date).getTime());


            if(userInfo.code = 1){

                // 第一种情况，用户输入的名字已存在，且密码正确
                socket.username = username;
                userId = userInfo.id;
                var data = {
                    latestDate: latestDate,
                    status:1
                };

                // 修改该用户的登录状态和最近登录时间，未登录为0，已登录为1。
                var modSql = 'UPDATE users SET latestDate = ?,status = ? WHERE id='+userInfo.id;
                var modSqlParams = [data.latestDate,data.status];
                pool.query(modSql,modSqlParams,function (err, hdata) {
                    if(err){
                        console.log('[UPDATE ERROR] - ',err.message);
                        return;
                    }

                    // 查找所有已登录的用户，获取已登录用户的数量
                    var sql = 'SELECT * FROM users WHERE status = 1';
                    pool.query(sql,function (err, sqlData) {
                        socket.emit('success',userInfo.id);
                        io.sockets.emit('system', username, sqlData.length, 0);
                    });

                });
            }
            else if(userInfo.code = 2){
                // 第二种情况，输入的用户名存在，密码输入错误！
                socket.emit('passerror');
                return false;
            }
            else if(userInfo.code = 3){
                // 第三种情况，输入的用户名不存在
                socket.username = username;
                var data = {
                    username: username,
                    password: password,
                    avatar: avatar,
                    createDate: createDate,
                    latestDate: latestDate,
                    status: 1
                };
                // 讲输入的用户名，密码存入数据库
                var  addSql = 'INSERT INTO users(username,password,avatar,createDate,latestDate,status) VALUES(?,?,?,?,?,?)';
                var  addSqlParams = [data.username, data.password, data.avatar,data.createDate, data.latestDate,data.status];
                pool.query(addSql,addSqlParams,function (err, result) {
                    if(err){
                        console.log('[INSERT ERROR] - ',err.message);
                        return;
                    }

                    // 查找所有已登录的用户，获取已登录用户的数量
                    var lengthSql = 'SELECT * FROM users WHERE status = 1';
                    pool.query(lengthSql,function (err, sqlData) {
                        io.sockets.emit('system', username, sqlData.length, 0);
                    });

                    // 根据用户名查找到该新增用户的id
                    var idSql = 'SELECT * FROM users WHERE username ='+socket.username;
                    pool.query(idSql,function (err, sqlData) {
                        socket.emit('success',sqlData[0].id);
                    });

                });
            }
        });
	});

    socket.on('getAllRecord',function () {
        // 查找所有的聊天记录
        var recordSql = 'SELECT chat.*,u.*  from chatrecord chat ,users u WHERE chat.userId=u.id';
        pool.query(recordSql,function (err, data) {
            console.log(data)
            // socket.broadcast.emit('newMsg', socket.username, data);
        });
    })

    // socket.on('mybeat',function (flag) {
    //     if(flag == 'logIn'){
    //         setTimeout(function(){
    //             socket.emit('heartbeat','yes')
    //         },3000);
    //     }else{
    //         socket.emit('heartbeat','no');
    //     }
    // });


	socket.on('emoji',function () {
        var  sql = 'SELECT * FROM emoji';
        pool.query(sql,function (err, result) {
            if(err){
                console.log('[查询错误] - ',err.message);
                return;
            }
            socket.emit('getEmoji', result);
        })
    });

	// 退出
	socket.on('disconnect', function() {
        if (socket.username != null) {
            var modSql = 'UPDATE users SET status = ? WHERE id='+userId;
            var modSqlParams = [0];
            pool.query(modSql,modSqlParams,function (err, result) {
                socket.broadcast.emit('system', socket.username, result.length, 1);
            });
        }
    });

    //获得新消息并发送给其他人
    socket.on('postMsg', function(msg,id) {
        if(!socket.username){
            socket.emit('noLogin');
            return
        }
        var date = util.formatDate((new Date).getTime());
        var addSql = 'INSERT INTO chatRecord(content,date,userId) VALUES(?,?,?)';
        var addSqlParams = [msg, date, id];
        pool.query(addSql,addSqlParams,function (err, result) {
            if(err){
                console.log('[INSERT ERROR] - ',err.message);
                return;
            }
            socket.broadcast.emit('newMsg', socket.username, msg);
        });
    });

    //获得图片消息并发送给其他人
    socket.on('img', function(imgData,id) {
        if(!socket.username){
            socket.emit('noLogin');
            return
        }
        var date = util.formatDate((new Date).getTime());
        var addSql = 'INSERT INTO chatRecord(content,date,userId) VALUES(?,?,?)';
        var addSqlParams = [imgData, date, id];
        pool.query(addSql,addSqlParams,function (err, result) {
            if(err){
                console.log('[INSERT ERROR] - ',err.message);
                return;
            }
            socket.broadcast.emit('newImg', socket.username, imgData);
        });
    });

});

server.listen(2333);

function findElem(name,pass,array){
    var userInfo = {};
    for (var i=0;i<array.length;i++){
        if(array[i].username == name){
            if(array[i].password == pass){
                userInfo.code = 1;
                userInfo.id = array[i].id;
                userInfo.status = array[i].status;
                return userInfo;
            }else{
                userInfo.code = 2;
                return userInfo;
            }
        }
    }
    userInfo.code = 3;
    return userInfo;
}