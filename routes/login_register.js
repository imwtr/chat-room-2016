var express = require('express');
var router = express.Router();
var nodemailer = require('nodemailer');
var md5 = require('md5');

// 判断是否为登录状态
router.get('/checkLoginState', function(req, res, next) {
	var status = 0;
	var _json = {};

	if (req.session.uId) {
		status = 1;

		// 已登录状态下 直接获取该用户部分信息返回
		global.modelHandle('user').findOne({
			uId: req.session.uId
		}, function(err, data) {
			if (err) {
				console.log(err);
			} else {
				if (data) {
					_json.uId = req.session.uId;
					_json.status = status;
					_json.uImage = data.uImage;
					_json.uNickName = data.uNickName;
				}
			}

			res.json(_json);
		})
	} else {
		res.json(_json);
	}
});

// 登录处理
router.post('/checkLoginInfo', function(req, res, next) {
	var status = 0;
	
	global.modelHandle('user').findOne({
		uEmail: req.body.uEmail,
		uPassword: req.body.uPassword
	}, function(err, data) {
		if (err) {
			console.log(err);
		} else {
			if (data !== null) {
				//status = 1;

				// session值设定
				req.session.uId = data.uId;
				req.session.uNickName = data.uNickName;

				// 登录成功则将上线状态设置为up
				global.modelHandle('user').update({
					uId: req.session.uId
				}, {
					$set: {
						uLoginState: 'up'
					}
				}, function(err, data) {
					if (err) {
						console.log(err);
					} else {
						if (data) {
							status = 1;
						}

						res.json({
							'status': status
						});
					}
				});
			} else {
				res.json({
					'status': status
				});
			}
			
		}
	});
});

// 注册处理
// 验证邮箱是否可用
router.post('/checkEmailInfo', function(req, res, next) {
	var status = 0;
	global.modelHandle('user').findOne({
		uEmail: req.body.uEmail
	}, function(err, data) {
		if (err) {
			console.log(err);
		} else {
			if (!data) {
				status = 1;
			}
		}

		res.json({
			'status': status
		});
	});
})
// 验证昵称是否可用
.post('/checkNickNameInfo', function(req, res, next) {
	var status = 0;
	global.modelHandle('user').findOne({
		uNickName: req.body.uNickName
	}, function(err, data) {
		if (err) {
			console.log(err);
		} else {
			if (!data) {
				status = 1;
			}
		}

		res.json({
			'status': status
		});
	});
})
// 注册处理
.post('/checkRegisterInfo', function(req, res, next) {
	var status = 0;
	var uId = 0;
	var uImage = '/img/user/default_';

	// 先计算用户总数，为创建用户id做准备
	global.modelHandle('user').find({}, function(err, data) {
		if (err) {
			console.log(err);
		} else {
			uId = data.length + 1;
			uImage += (req.body.uSex + '.png');

			// 创建该用户信息
			global.modelHandle('user').create({
				uId: uId,
				uEmail: req.body.uEmail,
				uPassword: req.body.uPassword,
				uSex: req.body.uSex,
				uNickName: req.body.uNickName,
				uImage: uImage,
				uCreateTime: global.Util.formatDate(new Date(), 'yyyy/mm/dd hh:ii:ss')
			}, function(err, data) {
				if (err) {
					console.log(err);
				} else {
					status = 1;
				}

				res.json({
					'status': status
				});
			});
		}
	});
});

// 注销操作  下线处理
router.post('/logout', function(req, res, next) {
	if (!req.session.uId) {
		return;
	}
	
	var status = 0;

	global.modelHandle('user').update({
		uId: req.session.uId
	}, {
		$set: {
			uLoginState: 'down'
		}
	}, function(err, data) {
		if (err) {
			console.log(err);
		} else {
			if (data) {
				status = 1;
				req.session.uId = null;
				req.session.uNickName = null;
			}

			res.json({
				'status': status
			});
		}
	});
});

/**
 * 发送邮件
 * @param  {[type]} emailTo [description]
 * @return {[type]}         [description]
 */
function sendEmailTo(emailTo, title, content, cb) {
	var status = 0;

	// 开启连接
	var smtpTransport = nodemailer.createTransport({
		service: '126',
		secureConnection: true,
		port: 465,
		auth: {
			user: 'f_imwtr_f@126.com',
			pass: 'Empty_imwtr'
		}
	});

	// 设置邮件内容
	var mailOptions = {
		from: '[咫尺一家]<f_imwtr_f@126.com>',
		to: emailTo,
		subject: title,
		html: content
	};

	// 发送邮件
	smtpTransport.sendMail(mailOptions, function(err, res) {
		if (err) {
			console.log(err);
		} else {
			status = 1;
			console.log(res.response);
		}

		smtpTransport.close();
		
		cb(status);
	});
}

// 生成字符串数组 0-9a-zA-Z
function buildCodeArr() {
	var codeArr = [];

	// 生成
	for (var i = 0; i < 9; i++) {
		codeArr.push(i);
	}
	for (var i = 65; i < 91; i++) {
		codeArr.push(String.fromCharCode(i));
	}
	for (var i = 97; i < 123; i++) {
		codeArr.push(String.fromCharCode(i));
	}	

	return codeArr;
}

// 将注册验证码发送至邮箱
router.post('/postEmailCode', function(req, res, next) {
	var emailTo = req.body.uEmail;

	if (emailTo) {
		var code = [];
		var codeArr = buildCodeArr();

		// 随机生成6位 英文+数字 验证码
		for (var i = 0; i < 6; i++) {
			code.push(codeArr[Math.floor(Math.random() * (codeArr.length + 1))]);
		}
		code = code.join('');	

		// 发送邮件
		sendEmailTo(
			emailTo,
			'[咫尺一家] 请查收你的注册验证码',
			 '<h3>以下为您的验证码,请查收  -- by [咫尺一家]</h3><h4 style="padding: 10px; color: green;">' + code + '</h4>',
			 function(status) {
			 	res.json({
					'status': status
				});
			 }
		);
	}
});

// 将重置到密码发送到邮箱
router.post('/pwdBack', function(req, res, next) {
	var emailTo = req.body.uEmail;

	if (emailTo) {
		var code = [];
		var codeArr = buildCodeArr();

		// 随机生成32位 英文+数字 验证码
		for (var i = 0; i < 32; i++) {
			code.push(codeArr[Math.floor(Math.random() * (codeArr.length + 1))]);
		}
		code = code.join('');	
		
		// 发送邮件
		sendEmailTo(
			emailTo,
			'[咫尺一家] 请查收你重置后的密码',
			 '<h3>以下为您的新密码,请重新登录后尽快修改  -- by [咫尺一家]</h3><h4 style="padding: 10px; color: green;">' + code + '</h4>',
			 function(status) {
			 	var _status = 0;
			 	// 重置密码 db
			 	global.modelHandle('user').update({
			 		uEmail: emailTo
			 	}, {
			 		$set: {
			 			uPassword: md5(code)
			 		}
			 	}, function(err, data) {
			 		if (err) {
			 			console.log(err);
			 		} else {
			 			if (data) {
			 				_status = 1;
			 			}
			 		}
			 		res.json({
						'status': status & _status
					});
			 	});
			 }
		);
	}
});


module.exports = router;