var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;
// 20150526
var gid = {};
var uidcnt = 0;

var sys_id_waiting = null;

app.use(express.static(__dirname + '/public'));

server.listen(port, function () {
	console.log('Server listening at port %d', port);
});

io.on('connection', function (socket_server) {
	
	var ip = socket_server.request.connection.remoteAddress;
	var cin = false;
	
	var currusr = {};
	socket_server.on('addin', function (uid) {
		currusr.uid =		uid;
		currusr.servsock =	socket_server;
		currusr.ip = ip;
		currusr.sys_id =	new Date().valueOf();
		gid[currusr.sys_id] =	currusr;
		uidcnt = uidcnt + 1;
		cin = true;
		socket_server.emit('login', currusr.ip);
		
		if (null == sys_id_waiting) {
			sys_id_waiting = currusr.sys_id;
		} else {
			// exchange sys_id
			gid[sys_id_waiting].pid = currusr.sys_id;
			currusr.pid = sys_id_waiting;

			sys_id_waiting = null;
			
			currusr.servsock.emit('ctstgr', {
				ip:		gid[currusr.pid].ip,
				uid:	gid[currusr.pid].uid,
				});
			gid[currusr.pid].servsock.emit('ctstgr', {
				ip:		currusr.ip,
				uid:	currusr.uid,
				});
		}
	});
	
	socket_server.on('filp', function (file) {
		if (currusr.pid && gid[currusr.pid] && gid[currusr.pid].servsock) {
		gid[currusr.pid].servsock.emit('nfilp', {
			uid:	currusr.uid,
			filp:	file,
		});
		}
	});
		
	socket_server.on('disconnect', function() {
		
		if (currusr.sys_id != sys_id_waiting) {
			if (currusr.pid) {
				gid[currusr.pid].servsock.emit('stgrdl');
				gid[currusr.pid].pid = null;


				if (null == sys_id_waiting) {
					sys_id_waiting = currusr.pid;
				} else {
					gid[sys_id_waiting].pid = currusr.pid;
					gid[currusr.pid].pid = sys_id_waiting;
					sys_id_waiting = null;
					
					gid[currusr.pid].servsock.emit('ctstgr', {
						ip:		gid[gid[currusr.pid].pid].ip,
						uid:	gid[gid[currusr.pid].pid].uid,
					})
					
					gid[gid[currusr.pid].pid].servsock.emit('ctstgr', {
						ip:		gid[currusr.pid].ip,
						uid:	gid[currusr.pid].uid,
					})
				}
			}
		} else {
			sys_id_waiting = null;
		}
		
		console.log(currusr.uid + ' leaves');
		delete gid[currusr.sys_id];
		uidcnt = uidcnt - 1;
	});
});
