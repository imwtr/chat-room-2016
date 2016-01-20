var express = require('express');
var util = require('util');
var fs = require('fs');
var router = express.Router();

// 判断是否为讨论组成员 编辑框可用状态判断
router.get('/checkChatEditBox/:cId', function(req, res, next) {
	var cId = req.params.cId.slice(5);
	var uId = req.session.uId;
	// 1--匹配   0--已登录非讨论组成员  -1 -- 未登录
	var status = 0;  
	var json = {};
	json.user = [];

	if (!uId) {
		status = -1;
	}

	// 首先判断用户是否在讨论组中  顺便获取讨论组信息
	function step1() {
		return new Promise(function(resolve, reject) {
			global.modelHandle('group').findOne({
				gId: cId
			}, function(err, data) {
				if (err) {
					reject(err);
				} else {
					resolve(data);
				}
			});
		});
	}
	// 获取该讨论组中用户的信息
	function step2() {
		var promiseTemp = [];
		for (var i = 0; i < json.user.length; i++) {
			promiseTemp.push(new Promise(function(resolve, reject) {
				global.modelHandle('user').findOne({
					uId: json.user[i].uId
				}, function(err, data) {
					if (err) {
						reject(err);
					} else {
						resolve(data);
					}
				});
			}));
		};

		return Promise.all(promiseTemp);
	}
	// 判断讨论组中各用户是否为自己好友
	function step3() {
		var promiseTemp = [];
		for (var i = 0; i < json.user.length; i++) {
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
		.then(function(data) {
			if (data) {
				if (data.gUserId.indexOf(uId) !== -1) {
					status = 1;
				}
				for (var i = 0; i < data.gUserId.length; i++) {
					json.user[i] = {};
					json.user[i].uId = data.gUserId[i];
					json.user[i].gId = data.gId;
					json.user[i].gName = data.gName;
					json.user[i].gCount = data.gCount;
				};
				
			}
		}, function(err) {
			console.log(err);
		})
	.then(step2)
		.then(function(data) {
			for (var i = 0; i < data.length; i++) {
				json.user[i].uNickName = data[i].uNickName;
				json.user[i].uSex = data[i].uSex;
				json.user[i].uImage = data[i].uImage;
				json.user[i].uLoginState = data[i].uLoginState;
				json.user[i].uSignature = data[i].uSignature;
				json.user[i].cBelongToID = 'chat_' + uId + '_' + data[i].uId;
			}

		}, function(err) {
			console.log(err);
		})
	.then(step3)
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
			json.status = status;
			res.json(json);

		}, function(err) {
			console.log(err);
		});

});

// 用户获取自己的信息
router.get('/getMyInfo', function(req, res, next) {
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
			}

			res.json(json);
		}
	});
});

module.exports = router;