// 创建socket服务
var socketIO = require('socket.io')();
// 所有房间
var rooms = {};
// 所有讨论组
var chats = {};
// 所有私聊
var chatPs = {};
// 游客ID 为负数
var uNotLoginID = -1;

// 用于记录全局用户对象
var clientNotLoginID = -1;
var clients = [];
var ind = 0;


// 监听初始的连接
socketIO.on('connection', function(socket) {
	// 通过url获取房间代号 并存入房间名单   example: /room?id=1
	var url = socket.request.headers.referer;

	// 通过url判断是模式： 群聊/room?id=1  讨论组/chat?id=1  私聊/chatP?id=1_2
	var Mode = url.substring(url.lastIndexOf('/') + 1, url.lastIndexOf('?'));

	var item = url.slice(url.lastIndexOf('?') + 4);
	var id = item;
	var anotherID; 
	var userIsExists = false;

	// 如果不是私聊模式
	if (item.indexOf('_') === -1) {
		id = parseInt(item, 10);
	} else {
		// 私聊模式存在另一个会话id  chatP_1_2 & chatP_2_1
		anotherID = [item.split('_')[1], item.split('_')[0]].join('_');
	}
	
	// 用于单个房间
	var uId = -1;
	var uNickName = '';


	// 用于全局用户对象
	var clientUID = -1;
	var clientUNickName = '';
	// 用于全局socket客户端
	socket.on('default_socket', function(_clientUID, _clientUNickName) {
		var uIdExists = false;
		for (var i = 0; i < clients.length; i++) {
			if (clients[i].clientUID == _clientUID) {
				uIdExists = true;
				break;
			}
		}

		clientUID = _clientUID < 0 ? clientNotLoginID-- : _clientUID;
		// 储存全局用户对象
		if (!uIdExists) {
			clients.push({
				socket: socket,
				clientUID: clientUID,
				clientUNickName: _clientUNickName
			});
		}
	});


	// 加入房间
	socket.on('join', function(_uId, _uNickName, mode) {
		if (_uId < 0 && _uNickName) {
			return;
		}

		// 群聊
		if (mode === 'room') {
			// 传入的_uId为-1代表该用户未登录  则使用游客id   -1  -2  -3 ...

			uId = (_uId == -1 ? uNotLoginID-- : _uId);
			uNickName = _uNickName;

			// 一个房间对象  存储用户id , 在线会员数据, 游客数据
			if (!rooms[id]) {
				rooms[id] = {};
			}
			if (!rooms[id].userId) {
				rooms[id].userId = [];
			}
			if (!rooms[id].likedInfo) {
				rooms[id].likedInfo = [];
			}
			if (!rooms[id].unlikedInfo) {
				rooms[id].unlikedInfo = [];
			}

			// 存储用户id
			if (rooms[id] && rooms[id].userId.indexOf(uId) === -1) {
				rooms[id].userId.push(uId);
			} else {
				userIsExists = true;
			}
			
		} 
		// 讨论组
		else if (mode === 'chat') {
			uId = _uId;
			uNickName = _uNickName;

			if (!chats[id]) {
				chats[id] = [];
			}
			
			// 存储用户id
			if (chats[id] && chats[id].indexOf(uId) === -1) {
				chats[id].push(uId);
			}
			
		} 
		// 私聊
		else if (mode === 'chatP') {
			uId = _uId;
			uNickName = _uNickName;

			if (!chatPs[id]) {
				chatPs[anotherID] = chatPs[id] = [];
			}
			
			// 存储用户id
			if (chats[id] && chats[id].indexOf(uId) === -1) {
				chatPs[id].push(uId);
			}
			if (chats[anotherID] && chats[anotherID].indexOf(uId) === -1) {
				chatPs[anotherID].push(uId);
			}
		}
		

		// 如果不是游客，则通知房间内的所有用户
		if (uNickName) {
			socketIO.to(id).emit('sys', '用户[ ' + uNickName + ' ]加入了房间', Mode);
		}
		if (mode === 'room') {
			console.log('用户[%d]加入了房间[%d]', uId, id);
		} else if (mode === 'chat') {
			console.log('用户[%d]进入了讨论组会话[%d]', uId, id);
		} else if (mode === 'chatP') {
			console.log('用户[%d]进入了私聊会话', uId, id, anotherID);
		}
		

		// 加入房间
		socket.join(id);
		if (Mode === 'room') {
			// 返回  防止游客收取不到数据
			socketIO.to(id).emit('userList', {
				likedInfo: rooms[id].likedInfo,
				unlikedInfo: rooms[id].unlikedInfo
			}, Mode);
			socket.broadcast.emit('roomClientNum', id, rooms[id].likedInfo.length + rooms[id].unlikedInfo.length);
		}
		
	});

	// 将用户信息返回  为渲染用户列表面板
	socket.on('sendMyInfo', function(data, mode) {
		if (mode === 'room') {
			// 存储会员/游客数据
			if (data.uNickName && !userIsExists) {
				if (data.isLiked) {
					rooms[id].likedInfo.push(data);
				} else {
					rooms[id].unlikedInfo.push(data);
				}
			}

			// 返回
			socketIO.to(id).emit('userList', {
				likedInfo: rooms[id].likedInfo,
				unlikedInfo: rooms[id].unlikedInfo
			}, Mode);
			socket.broadcast.emit('roomClientNum', id, rooms[id].likedInfo.length + rooms[id].unlikedInfo.length);
		}
	});

	// 离开房间
	socket.on('leave', function() {
		socket.emit('disconnect');
	});

	socket.on('disconnect', function() {
		var index;
		// 从房间名单中删除 用户id
		try {
			if (Mode === 'room') {
				index = rooms[id].userId.indexOf(uId);
				if (index !== -1) {
					rooms[id].userId.splice(index, 1);
				}
			} else if (Mode === 'chat') {
				index = chats[id].indexOf(uId);
				if (index !== -1) {
					chats[id].splice(index, 1);
				}
			} else if (Mode === 'chatP') {
				index = chatPs[id].indexOf(uId);
				if (index !== -1) {
					chatPs[id].splice(index, 1);
				}

				index = chatPs[anotherID].indexOf(uId);
				if (index !== -1) {
					chatPs[anotherID].splice(index, 1);
				}
			}
		} catch (e) {

		}
		
		for (var i = 0; i < clients.length; i++) {
			if (clients[i].clientUID == clientUID) {
				clients.splice(i, 1);
			}
		}

		// 退出房间
		socket.leave(id);
		if (anotherID) {
			socket.leave(anotherID);
		}

		if (Mode === 'room') {
			// 删除相应会员/游客数据缓存
			if (uNickName) {
				rooms[id].likedInfo.forEach(function(val, index) {
					if (val.uId === uId) {
						rooms[id].likedInfo.splice(index, 1);
					}
				});
				rooms[id].unlikedInfo.forEach(function(val, index) {
					if (val.uId === uId) {
						rooms[id].unlikedInfo.splice(index, 1);
					}
				});

				// 返回
				socketIO.to(id).emit('userList', {
					likedInfo: rooms[id].likedInfo,
					unlikedInfo: rooms[id].unlikedInfo
				}, Mode);
				socket.broadcast.emit('roomClientNum', id, rooms[id].likedInfo.length + rooms[id].unlikedInfo.length);
			}
		}
		

		// 如果不是游客，则通知房间内的所有用户
		if (uNickName) {
			socketIO.to(id).emit('sys', '用户[ ' + uNickName + ' ]退出了房间', Mode);
		}
		if (Mode === 'room') {
			console.log('用户[%d]退出了房间[%d]', uId, id);
		} else if (Mode === 'chat') {
			console.log('用户[%d]退出了讨论组会话[%d]', uId, id);
		} else if (Mode === 'chatP') {
			console.log('用户[%d]退出了私聊会话[]', uId, id, anotherID);
		}

	});

	// 接收用户消息，发送至相应的房间
	socket.on('sendMsg', function(msg, mode) {
		console.log(msg, mode)
		// 验证用户如果不在房间内则不发送
		try {
			if (mode === 'room') {
				if (rooms[id].userId.indexOf(uId) === -1) {
					return false;
				}
			// } else if (mode === 'chat') {
			// 	if (chats[id].indexOf(uId) === -1) {
			// 		return false;
			// 	}
			// } else if (mode === 'chatP') {
			// 	console.log('prev');
			// 	console.log(chatPs[id]);
			// 	if (chatPs[id].indexOf(uId) === -1) {
			// 		return false;
			// 	}
			// 	console.log('next');
			 }

		} catch (e) {

		}
		
		

		// 返回消息操作
		var tag = (mode === 'room' ? 'room_' : 'chat_');
		var timeNow;
		var _chat;
		var cTotal = 0;
		var userInfo = {};
		var theUID;
		if (Mode === 'chatP') {
			theUID = (id.split('_')[0] == uId ? id.split('_')[1] : id.split('_')[0]);
		}

		// 查询消息记录总数
		function findTotal() {
			return new Promise(function(resolve, reject) {
				global.modelHandle('chat').count(function(err, total) {
					if (err) {
						reject(err);
					} else {
						resolve(total);
					}
				});
			});
		}

		// 创建一条新消息存入
		function createChat() {
			// 聊天消息
			timeNow = global.Util.formatDate(new Date(), 'yyyy/mm/dd hh:ii:ss');
			_chat = {
				cId: cTotal + 1,
				cBelongToID: tag + id,
				cTime: timeNow,
				cUserId: uId,
				cDetail: msg
			};

			return new Promise(function(resolve, reject) {
				global.modelHandle('chat').create(_chat, function(err, data) {
					if (err) {
						reject(err);
					} else {
						resolve(data);
					}
				});
			});
		}

		// 查询该消息的用户信息
		function findUserInfo() {
			return new Promise(function(resolve, reject) {
				global.modelHandle('user').findOne({
					uId: uId
				}, function(err, data) {
					if (err) {
						reject(err);
					} else {
						resolve(data);
					}
				});
			});
		}

		// 查询自己是否为对方的朋友
		function checkIsFriends() {	
			return new Promise(function(resolve, reject) {
				if (Mode !== 'chatP') {
					resolve(1);
					return;
				}

				global.modelHandle('usergroup').find({
					ugBelongToID: theUID
				}, function(err, data) {
					if (err) {
						reject(err);
					} else {
						resolve(data);
					}
				});
			});
		}

		// 查询该讨论组的成员id
		function getGroupMember() {
			return new Promise(function(resolve, reject) {
				if (Mode !== 'chat') {
					resolve(1);
					return;
				}

				global.modelHandle('group').findOne({
					gId: id
				}, function(err, data) {
					if (err) {
						reject(err);
					} else {
						resolve(data);
					}
				});
			});
		}
		
		findTotal()
			.then(function(total) {
				cTotal = total;
				console.log('total', total);
			}, function(err) {
				console.log(err);
			})
		.then(createChat)
			.then(function(data) {
			}, function(err) {
				console.log(err);
			})
		.then(findUserInfo)
			.then(function(data) {
				// 发送这条消息
				if (data) {
					// 发送用户信息及消息内容
					socketIO.to(id).emit('msg', {
						uId: data.uId,
						uNickName: data.uNickName,
						uSex: data.uSex,
						uLoginState: data.uLoginState
					}, {
						cTime: _chat.cTime,
						cDetail: _chat.cDetail
					}, Mode);
				}
				userInfo = data;
			}, function(err) {
				console.log(err);
			})
		.then(checkIsFriends)
			.then(function(data) {
				// 如果是私聊模式
				if (Mode === 'chatP') {
					var isFriends = false;
					// 判断是否为好友
					for (var i = 0; i < data.length; i++) {
						if (data[i].ugUsersId.indexOf(uId) !== -1) {
							isFriends = true;
							break;
						}
					}
					// 找出相应socket进行通知
					for (var i = 0; i < clients.length; i++) {
						if (clients[i].clientUID == theUID) {
							clients[i].socket.emit('chatPMsgTip', {
								uId: userInfo.uId,
								uNickName: userInfo.uNickName,
								uSignature: userInfo.uSignature,
								isFriends: isFriends ? 1 : 0,
								uImage: userInfo.uImage,
								cDetail: _chat.cDetail,
								cTime: timeNow.slice(timeNow.indexOf(' ') + 1),
								cId: cTotal + 1,
								cBelongToID: tag + id
							});		

							break;
						}
					}
				}
			}, function(err) {
				console.log(err);
			})
		.then(getGroupMember)
			.then(function(data) {
				// 如果为讨论组模式  则通知讨论组内其他人
				if (Mode === 'chat') {
					if (data) {
						// 找出讨论组内成员socket匹配项进行通知
						for (var i = 0; i < clients.length; i++) {
							if (data.gUserId.indexOf(clients[i].clientUID) !== -1) {
								clients[i].socket.emit('chatMsgTip', {
									gId: data.gId,
									gName: data.gName,
									cDetail: _chat.cDetail,
									cTime: timeNow.slice(timeNow.indexOf(' ') + 1),
									cId: cTotal + 1,
									cBelongToID: tag + id
								});		
							}
						}
					}
				}
				
				
			}, function(err) {
				console.log(err);
			});			
	});


});

exports.listen = function(chatServer){    
	return socketIO.listen(chatServer);    // listening 
};