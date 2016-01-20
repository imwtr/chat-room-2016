var express = require('express');
var util = require('util');
var fs = require('fs');
var router = express.Router();

// 根据房间id获取其基本信息
router.get('/getRoomInfo/:id', function(req, res, next) {
	// 首先判断是否为登录状态
	var isLogin = 0;
	var status = 0;
	var json = {};
	// var rManagersId = [];
	var rOwnerId = 0;

	if (!req.session.uId) {
		isLogin = 0;
		json.isLiked = -1; // 未登录的用户
	}

	// 通过房间id获取数据
	var rId = req.params.id.slice(4);
	var uId = req.session.uId;

	if (!rId) {
		return;
	}

	// 获取房间基本信息
	function step1() {
		return new Promise(function(resolve, reject) {
			global.modelHandle('room').findOne({
				rId: rId
			}, function(err, data) {
				if (err) {
					reject(err);
				} else {
					resolve(data);
				}
			});
		});
	}
	// 获取房间所属分类
	function step2(rBelongToID) {
		return new Promise(function(resolve, reject) {
			global.modelHandle('area').findOne({
				aId: rBelongToID
			}, function(err, data) {
				if (err) {
					reject(err);
				} else {
					resolve(data);
				}
			});
		});
	}
	// 判断用户该房间关注是否已登录并关注该房间
	function step3() {
		return new Promise(function(resolve, reject) {
			global.modelHandle('user').findOne({
				uId: req.session.uId
			}, function(err, data) {
				if (err) {
					reject(err);
				} else {
					resolve(data);
				}
			});
		});
	}
	// 获取房主信息
	function step4() {
		return new Promise(function(resolve, reject) {
			global.modelHandle('user').findOne({
				uId: rOwnerId
			}, function(err, data) {
				if (err) {
					reject(err);
				} else {
					resolve(data);
				}
			});
		});
	}
	// 判断房主是否为自己好友
	function step5() {
		return new Promise(function(resolve, reject) {
			if (!uId) {
				resolve(1);
				return;
			}

			global.modelHandle('usergroup').find({
				ugBelongToID: uId
			}, function(err, data) {
				if (err) {
					reject(err);
				} else {
					resolve(data);
				}
			});
		});
	}
	// // 获取管理员信息
	// function step6() {
	// 	var promiseTemp = [];
	// 	for (var i = 0; i < rManagersId.length; i++) {
	// 		promiseTemp.push(new Promise(function(resolve, reject) {
	// 			global.modelHandle('user').findOne({
	// 				uId: rManagersId[i]
	// 			}, function(err, data) {
	// 				if (err) {
	// 					reject(err);
	// 				} else {
	// 					resolve(data);
	// 				}
	// 			});
	// 		}));
	// 	}

	// 	return Promise.all(promiseTemp);
	// }
	// // 判断管理员是否为自己的好友
	// function step7() {
	// 	var promiseTemp = [];
	// 	for (var i = 0; i < rManagersId.length; i++) {
	// 		promiseTemp.push(new Promise(function(resolve, reject) {
	// 			if (!uId) {
	// 				resolve(1);
	// 				return;
	// 			}
	// 			global.modelHandle('usergroup').find({
	// 				ugBelongToID: uId
	// 			}, function(err, data) {
	// 				if (err) {
	// 					reject(err);
	// 				} else {
	// 					resolve(data);
	// 				}
	// 			});
	// 		}));
	// 	}

	// 	return Promise.all(promiseTemp);
	// }

	// Promise
	step1()
		.then(function(data) {
			if (data) {
				json.rId = data.rId;
				json.rName = data.rName;
				json.rImage = data.rImage;
				json.rDesc = data.rDesc;
				json.rCurCount = data.rCurCount;
				rOwnerId = data.rOwnerId;
				json.rOwner = {};
				// json.rManagers = [];
				// rManagersId = data.rManagersId;
				// for (var i = 0; i < rManagersId.length; i++) {
				// 	json.rManagers[i] = {};
				// }
			}
			return data.rBelongToID;
		}, function(err) {
			console.log(err);
		})
	.then(step2)
		.then(function(data) {
			if (data) {
				json.rBelongTo = data.aName;
			}
		}, function(err) {
			console.log(err);
		})
	.then(step3)
		.then(function(data) {
			if (data) {
				// 存在
				if (data.likeRID.indexOf(rId) !== -1) {
					json.isLiked = 1;  // 登录的用户已关注
				} else {
					json.isLiked = 0;  // 登录到用户未关注
				}
			}
		}, function(err) {
			console.log(err);
		})
	.then(step4)
		.then(function(data) {
			if (data) {
				json.rOwner.uId = data.uId;
				json.rOwner.uNickName = data.uNickName;
				json.rOwner.uSex = data.uSex;
				json.rOwner.uLoginState = data.uLoginState;
			}
		}, function(err) {
			console.log(err);
		})
	.then(step5)
		.then(function(data) {
			if (data) {
				var uIsFriends = false;
				json.rOwner.uIsSelf = false
				for (var i = 0; i < data.length; i++) {
					if (data[i].ugUsersId.indexOf(json.rOwner.uId) !== -1) {
						uIsFriends = true;
						break;
					}
				}

				json.rOwner.uIsFriends = uIsFriends;
				if (json.rOwner.uId == uId) {
					json.rOwner.uIsSelf = true;
				} else {
					json.rOwner.uIsSelf = false;
				}

				status = 1;
				json.status = status;
				res.json(json);
				}
		}, function(err) {
			console.log(err);
		});
	// .then(step6)
	// 	.then(function(data) {
	// 		if (data) {
	// 			for (var i = 0; i < data.length; i++) {
	// 				json.rManagers[i].uId = data[i].uId;
	// 				json.rManagers[i].uNickName = data[i].uNickName;
	// 				json.rManagers[i].uSex = data[i].uSex;
	// 				json.rManagers[i].uLoginState = data[i].uLoginState;
	// 			}
	// 		}
	// 	}, function(err) {
	// 		console.log(err);
	// 	})
	// .then(step7)
	// 	.then(function(data) {
	// 		if (data) {
	// 			for (var i = 0; i < json.rManagers.length; i++) {
	// 				var uIsFriends = false;
	// 				json.rManagers[i].uIsSelf = false;
	// 				for (var j = 0; j < data[i].length; j++) {
	// 					if (data[i][j].ugUsersId.indexOf(json.rManagers[i].uId) !== -1) {
	// 						uIsFriends = true;
	// 						break;
	// 					}
	// 				}

	// 				json.rManagers[i].uIsFriends = uIsFriends;
	// 				if (json.rManagers[i].uId == uId) {
	// 					json.rManagers[i].uIsSelf = true;
	// 				} else {
	// 					json.rManagers[i].uIsSelf = false;
	// 				}
	// 			}
				
	// 		}

	// 		status = 1;
	// 		json.status = status;
	// 		res.json(json);

	// 	}, function(err) {
	// 		console.log(err);
	// 	});

});

// 关注/取消关注房间
router.post('/likeRoom', function(req, res, next) {
	if (!req.session.uId) {
		return;
	}
	var likeRID = [];
	var index = -1;
	var status = -1;

	global.modelHandle('user').findOne({
		uId: req.session.uId
	}, function(err, data) {
		if (err) {
			console.log(err);
		} else {
			if (data) {
				index = data.likeRID.indexOf(req.body.rId);
				// 取消关注
				if (req.body.act == 1) {
					if (index !== -1) {
						data.likeRID.splice(index, 1);
					}
				} 
				// 添加关注
				else {	
					data.likeRID.push(parseInt(req.body.rId, 10));
				}
				

				global.modelHandle('user').update({
					uId: req.session.uId
				}, {
					$set: {
						likeRID: data.likeRID
					}
				}, function(err, data) {
					if (err) {
						console.log(err);
					} else {
						if (data) {
							if (req.body.act == 1) {
								status = 0;
							} else {
								status = 1;
							}
							
						}
						res.json({
							'status': status
						});
					}
				});
			}
		}
	});
});

// 加载历史消息记录
router.get('/getChats/:cBelongToID/:pn', function(req, res, next) {
	var cBelongToID = req.params.cBelongToID.slice(13);
	var cBelongToIDArr = [cBelongToID]; 

	// 为私聊模式 则chat_1_2和chat_2_1的记录都获取
	if (cBelongToID.indexOf('_') !== cBelongToID.lastIndexOf('_')) {
		cBelongToIDArr.push([cBelongToID.split('_')[0], cBelongToID.split('_')[2], cBelongToID.split('_')[1]].join('_'));
	}
console.log(cBelongToIDArr)
	var pn = req.params.pn.slice(4);
	var uId = req.session.uId;
	var cPage = 0; // 总页数
	var cPageSize = 2; // 每页记录数
	var json = {};
	json.c = [];

	// 先获取总数
	function step1() {
		return new Promise(function(resolve, reject) {
			global.modelHandle('chat').where('cBelongToID', {$in: cBelongToIDArr}).count(function(err, total) {
				if (err) {
					reject(err);
				} else {
					resolve(total);
				}
			});
		});	
	}
	// 获取相应页码的消息记录
	function step2() {
		return new Promise(function(resolve, reject) {
			global.modelHandle('chat').find({
				cBelongToID: {
					$in: cBelongToIDArr
				}
			}, function(err, data) {
				if (err) {
					reject(err);
				} else {
					resolve(data);
				}
			})
			.sort({
				'cTime': 1
			})
			.skip((cPage - pn - 1) * cPageSize)
			.limit(cPageSize);
		});	
	}
	// 获取消息记录相应的用户信息
	function step3() {
		var promiseTemp = [];
		for (var i = 0; i < json.c.length; i++) {
			promiseTemp.push(new Promise(function(resolve, reject) {
				global.modelHandle('user').findOne({
					uId: json.c[i].cUserID
				}, function(err, data) {
					if (err) {
						reject(err);
					} else {
						resolve(data);
					}
				});
			}));	
		}	

		return Promise.all(promiseTemp);
	}
	// 判断各消息记录所属用户是否为自己的好友
	function step4() {
		var promiseTemp = [];
		for (var i = 0; i < json.c.length; i++) {
			promiseTemp.push(new Promise(function(resolve, reject) {
				
				if (!uId) {
					resolve(1);
					return;
				}
				global.modelHandle('usergroup').find({
					ugBelongToID: uId
				}, function(err, data) {
					if (err) {
						reject(err);
					} else {
						resolve(data);
					}
				});
			}));
		}

		return Promise.all(promiseTemp);
	}

	// Promise
	step1()
		.then(function(total) {
			console.log('total', total)
			if (total) {
				cPage = Math.ceil(total / cPageSize);
			}

			// 已经拉取到最后一项数据
			if (cPage - pn <= 1) {
				json.isLast = true;
			} else {
				json.isLast = false;
			}
		}, function(err) {
			console.log(err);
		})
	.then(step2)
		.then(function(data) {
			for (var i = 0; i < data.length; i++) {
				json.c[i] = {};
				json.c[i].cTime = data[i].cTime;
				json.c[i].cDetail = data[i].cDetail;
				json.c[i].cUserID = data[i].cUserId;
			}
		}, function(err) {
			console.log(err);
		})
	.then(step3)
		.then(function(data) {
			for (var i = 0; i < data.length; i++) {
				json.c[i].uId = data[i].uId;
				json.c[i].uNickName = data[i].uNickName;
				json.c[i].uSex = data[i].uSex;
				json.c[i].uLoginState = data[i].uLoginState;
			}

		}, function(err) {
			console.log(err);
		})
	.then(step4)
		.then(function(data) {
			if (data) {
				for (var i = 0; i < json.c.length; i++) {
					var uIsFriends = false;
					json.c[i].uIsSelf = false;
					for (var j = 0; j < data[i].length; j++) {
						if (data[i][j].ugUsersId.indexOf(json.c[i].cUserID) !== -1) {
							uIsFriends = true;
							break;
						}
					}

					json.c[i].uIsFriends = uIsFriends;

					if (json.c[i].cUserID == uId) {
						json.c[i].uIsSelf = true;
					} else {
						json.c[i].uIsSelf = false;
					}
				}
				
			}
			res.json(json);

		}, function(err) {
			console.log(err);
		});

});

// 判断是否已经登录 用于记录进入房间的条件
router.get('/checkIsLogin', function(req, res, next) {
	var status = 0;
	var json = {};

	if (req.session.uId) {
		status = 1;
	}

	if (status == 1) {
		json.uId = req.session.uId;
		json.uNickName = req.session.uNickName;
	}

	json.status = status;
	res.json(json);
});

// 用户获取自己的信息
router.get('/getMyInfo/:rId', function(req, res, next) {
	var rId = req.params.rId.slice(5);
	var json = {};

	global.modelHandle('user').findOne({
		uId: req.session.uId
	}, function(err, data) {
		if (err) {
			console.log(err);
		} else {
			if (data) {
				json.uId = data.uId;
				json.uNickName = data.uNickName;
				json.uSex = data.uSex;
				json.uImage = data.uImage;
				json.uLoginState = data.uLoginState;
				json.isLiked = (data.likeRID.indexOf(rId) !== -1);
			}

			res.json(json);
		}
	});
});

// 聊天窗口中图片附件到上传
router.post('/sendFormPic', function(req, res, next) {
	var picNum = req.body['form-pic-num'];

	// 处理图片文件的上传
	function step() {
		var promiseTemp = [];
		for (var i = 0; i < picNum; i++) {
			promiseTemp.push(new Promise(function(resolve, reject) {
				var tmp_path = req.files['chat-input-pic' + i].path;
				var target_path = './public/img/chat/' + req.files['chat-input-pic' + i].originalname;

				var readStream = fs.createReadStream(tmp_path);
				var writeStream = fs.createWriteStream(target_path);
				console.log('ing')
				readStream.pipe(writeStream, function(err) {
					if (err) {
						reject(err);
					}
					fs.unlinkSync(tmp_path);
				});
				resolve();
			}));
		}

		return Promise.all(promiseTemp);
	}

	step()
		.then(function(status) {
			console.log('done')
			res.json({
				'status': 1
			});
		});
});
 
// 判断是否为好友
router.post('/checkIsFriends', function(req, res, next) {
	var uId = req.session.uId;
	var theUIDs = req.body.theUID.split('|');
	var status = 0;
	var json = {};
	json.user = [];

	if (!uId) {
		res.json({
			'status': status
		});
		return;
	}

	for (var i = 0; i < theUIDs.length; i++) {
		json.user[i] = {};
		json.user[i].uId = theUIDs[i];
	}

	 // 判断各各用户是否为自己的好友
	function step() {
		var promiseTemp = [];
		for (var i = 0; i < json.user.length; i++) {
			promiseTemp.push(new Promise(function(resolve, reject) {
				global.modelHandle('usergroup').find({
					ugBelongToID: uId
				}, function(err, data) {
					if (err) {
						reject(err);
					} else {
						resolve(data);
					}
				});
			}));
		}

		return Promise.all(promiseTemp);
	}

	step()
		.then(function(data) {
			if (data) {
				for (var i = 0; i < json.user.length; i++) {
					var uIsFriends = false;
					json.user[i].uIsSelf = false;
					for (var j = 0; j < data[i].length; j++) {
						if (data[i][j].ugUsersId.indexOf(json.user[i].uId) !== -1) {
							uIsFriends = true;
							break;
						}
					}
					json.user[i].uIsFriends = uIsFriends;
					if (json.user[i].uId == uId) {
						json.user[i].uIsSelf = true;
					} else {
						json.user[i].uIsSelf = false;
					}
				}
				
			}

			status = 1;
			json.status = status;
			res.json(json);

		}, function(err) {
			console.log(err);
		});
});

module.exports = router;