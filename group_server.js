// 创建socket服务
var socketIO = require('socket.io')();
// 所有房间
var group = {};
// 游客ID 为负数
var uNotLoginID = -1;

// 监听初始的连接
socketIO.on('connection', function(socket) {
	// 通过url获取房间代号 并存入房间名单   example: /room?id=1
	var url = socket.request.headers.referer;
	var item = url.slice(url.lastIndexOf('?') + 4);
	var rId = parseInt(item, 10);
	var uId = -1;
	var uNickName = '';

	// 加入房间
	socket.on('join', function(_uId, _uNickName) {
		// 传入的_uId为-1代表该用户未登录  则使用游客id   -1  -2  -3 ...
		
		uId = (_uId == -1 ? uNotLoginID-- : _uId);
		uNickName = _uNickName;

		// 一个房间对象  存储用户id , 在线会员数据, 游客数据
		if (!rooms[rId]) {
			rooms[rId] = {};
		}
		if (!rooms[rId].userId) {
			rooms[rId].userId = [];
		}
		if (!rooms[rId].likedInfo) {
			rooms[rId].likedInfo = [];
		}
		if (!rooms[rId].unlikedInfo) {
			rooms[rId].unlikedInfo = [];
		}

		// 存储用户id
		rooms[rId].userId.push(uId);

		// 如果不是游客，则通知房间内的所有用户
		if (uNickName) {
			socketIO.to(rId).emit('sys', '用户[ ' + uNickName + ' ]加入了房间');
		}
		console.log('用户[%d]加入了房间[%d]', uId, rId);

		// 加入房间
		socket.join(rId);
		
		// 返回  防止游客收取不到数据
		socketIO.to(rId).emit('userList', {
			likedInfo: rooms[rId].likedInfo,
			unlikedInfo: rooms[rId].unlikedInfo
		});
	});

	// 将用户信息返回  为渲染用户列表面板
	socket.on('sendMyInfo', function(data) {
		// 存储会员/游客数据
		if (data.isLiked) {
			rooms[rId].likedInfo.push(data);
		} else {
			rooms[rId].unlikedInfo.push(data);
		}
		// 返回
		socketIO.to(rId).emit('userList', {
			likedInfo: rooms[rId].likedInfo,
			unlikedInfo: rooms[rId].unlikedInfo
		});
	});

	// 离开房间
	socket.on('leave', function() {
		socket.emit('disconnect');
	});

	socket.on('disconnect', function() {
		// 从房间名单中删除 用户id
		var index = rooms[rId].userId.indexOf(uId);
		if (index !== -1) {
			rooms[rId].userId.splice(index, 1);
		}

		// 退出房间
		socket.leave(rId);

		// 删除相应会员/游客数据缓存
		if (uNickName) {
			rooms[rId].likedInfo.forEach(function(val, index) {
				if (val.uId === uId) {
					console.log('hit');
					rooms[rId].likedInfo.splice(index, 1);
				}
			});
			rooms[rId].unlikedInfo.forEach(function(val, index) {
				if (val.uId === uId) {
					console.log('hit');
					rooms[rId].unlikedInfo.splice(index, 1);
				}
			});

			// 返回
			socketIO.to(rId).emit('userList', {
				likedInfo: rooms[rId].likedInfo,
				unlikedInfo: rooms[rId].unlikedInfo
			});
		}

		// 如果不是游客，则通知房间内的所有用户
		if (uNickName) {
			socketIO.to(rId).emit('sys', '用户[ ' + uNickName + ' ]退出了房间');
		}
		
		console.log('用户[%d]退出了房间[%d]', uId, rId);

	});

	// 接收用户消息，发送至相应的房间
	socket.on('sendMsg', function(msg) {
		// 验证用户如果不在房间内则不发送
		if (rooms[rId].userId.indexOf(uId) === -1) {
			return false;
		}

		// 先存入数据库
		global.modelHandle('chat').count(function(err, total) {
			if (err) {
				console.log(err);
			} else {
				// 聊天消息
				var _chat = {
					cId: total + 1,
					cBelongToID: 'room_' + rId,
					cTime: global.Util.formatDate(new Date(), 'yyyy/mm/dd hh:ii:ss'),
					cUserId: uId,
					cDetail: msg
				};
				// 存入
				global.modelHandle('chat').create(_chat, function(err, data) {
					if (err) {
						console.log(err);
					} else {
						if (data) {
							// 获取该用户的信息 
							global.modelHandle('user').findOne({
								uId: _chat.cUserId
							}, function(err, data) {
								if (err) {
									console.log(err);
								} else {
									if (data) {
										// 发送用户信息及消息内容
										socketIO.to(rId).emit('msg', {
											uId: data.uId,
											uNickName: data.uNickName,
											uSex: data.uSex,
											uLoginState: data.uLoginState
										}, {
											cTime: _chat.cTime,
											cDetail: _chat.cDetail
										});
									}
								}
							});
						}
					}
				});
			}
		});
	});


});

exports.listen = function(roomServer){    
	return socketIO.listen(roomServer);    // listening 
};