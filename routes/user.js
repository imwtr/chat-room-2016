var express = require('express');
var fs = require('fs');
var util = require('util');
var router = express.Router();

// 获取用户信息 
router.get('/getUserInfo/:id', function(req, res, next) {
    var uId = req.session.uId;
    var theUID = req.params.id.slice(4);
    var status = 0;
    var isSelf = 0;
    var json = {};
    json.user = {};

    // 如果是用户自己
    if (uId == theUID) {
        isSelf = 1;
    }
    json.user.isSelf = isSelf;

    global.modelHandle('user').findOne({
        uId: theUID
    }, function(err, data) {
        if (err) {
            console.log(err);
        } else {
            if (data) {
                json.user.uId = data.uId;
                json.user.uNickName = data.uNickName;
                json.user.uEmail = data.uEmail;
                json.user.uImage = data.uImage;
                json.user.uSex = data.uSex;
                json.user.uSignature = data.uSignature;
                json.user.uLoginState = data.uLoginState;
            }

            // 如果是其他用户  则还要判断是否为好友
            if (isSelf) {
                status = 1;
                json.status = status;
                res.json(json);
                return;
            }

            global.modelHandle('usergroup').find({
                ugBelongToID: uId
            }, function(err, data) {
                if (err) {
                    console.log(err);
                } else {
                    if (data) {
                        var isFriends = 0;
                        for (var i = data.length - 1; i >= 0; i--) {
                            if (data[i].ugUsersId.indexOf(theUID) !== -1) {
                                isFriends = 1;
                                break;
                            }
                        }

                        json.user.isFriends = isFriends;

                    }
                    json.status = 1;
                    res.json(json);
                }
            });
        }
    });
});


// 更新用户头像
router.post('/userChangeImage', function(req, res, next) {
    var uId = req.session.uId;
    var status = 0;

    if (!uId) {
        res.json({
          'status': status
        });
        return;
    }

    var tmp_path = req.files['img-change-input'].path;
    var target_path = './public/img/user/' + req.files['img-change-input'].name;

    var readStream = fs.createReadStream(tmp_path);
    var writeStream = fs.createWriteStream(target_path);
    util.pump(readStream, writeStream, function(err) {
        fs.unlinkSync(tmp_path);
    });

    global.modelHandle('user').update({
        uId: uId
    }, {
        $set: {
            uImage: target_path.slice(8)
        }
    }, function(err, data) {
        if(err) {
            console.log(err);
        } else {
            if (data) {
                status = 1;
                res.json({
                    'status': status
                });
            }
        }
    });
});

// 更新用户昵称
router.post('/nickNameUpdate', function(req, res, next) {
    var uId = req.session.uId;
    var newNickName = req.body.uNickName;
    var uNickName = req.session.uNickName;
    var status = 0;
    if (!uId) {
        res.json({
            'status': status
        });

        return;
    }

    global.modelHandle('user').update({
        uId: uId
    }, {
        $set: {
            uNickName: newNickName
        }
    }, function(err, data) {
        if (err) {
            console.log(err);
        } else {
            if (data) {
                req.session.uNickName = newNickName;
                status = 1;
                res.json({
                    'status': status
                });
            }
        }
    });

});

// 更新用户性别
router.post('/sexUpdate', function(req, res, next) {
    var uId = req.session.uId;
    var uSex = req.body.uSex;
    var status = 0;

    if (!uId) {
        res.json({
            'status': status
        });

        return;
    }

    global.modelHandle('user').update({
        uId: uId
    }, {
        $set: {
            uSex: uSex
        }
    }, function(err, data) {
        if (err) {
            console.log(err);
        } else {
            if (data) {
                status = 1;
                res.json({
                    'status': status
                });
            }
        }
    });

});

// 更新用户签名
router.post('/signatureUpdate', function(req, res, next) {
    var uId = req.session.uId;
    var uSignature = req.body.uSignature;
    var status = 0;

    if (!uId) {
        res.json({
            'status': status
        });

        return;
    }

    global.modelHandle('user').update({
        uId: uId
    }, {
        $set: {
            uSignature: uSignature
        }
    }, function(err, data) {
        if (err) {
            console.log(err);
        } else {
            if (data) {
                status = 1;
                res.json({
                    'status': status
                });
            }
        }
    });

});

// 检测原始密码
router.post('/checkLastPwd', function(req, res, next) {
    var uId = req.session.uId;
    var uLastPwd = req.body.uLastPwd;
    var status = 0;

    if (!uId) {
        res.json({
            'status': status
        });

        return;
    }

    global.modelHandle('user').findOne({
        uId: uId,
        uPassword: uLastPwd
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

});

// 更新用户密码
router.post('/updatePwd', function(req, res, next) {
    var uId = req.session.uId;
    var uNewPwd = req.body.uNewPwd;
    var status = 0;

    if (!uId) {
        res.json({
            'status': status
        });

        return;
    }

    global.modelHandle('user').update({
        uId: uId
    }, {
        $set: {
            uPassword: uNewPwd
        }
    }, function(err, data) {
        if (err) {
            console.log(err);
        } else {
            if (data) {
                req.session.uId = null;
                req.session.uNickName = null;
                status = 1;
                res.json({
                    'status': status
                });
            }
        }
    });

});


module.exports = router;
