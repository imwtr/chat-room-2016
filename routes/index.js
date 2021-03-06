var express = require('express');
var util = require('util');
var fs = require('fs');
var router = express.Router();

function dataFilter(data) {
    if (!data) {
        return data;
    }

    return data.replace(/['"<>\/\\\-\x00-\x09\x0b-\x0c\x1f\x80-\xff]/g, function(r){
                return '&#' + r.charCodeAt(0) + ';';
            }).replace(/ /g, '&nbsp;').replace(/\r\n/g, '<br />').replace(/\n/g,'<br />').replace(/\r/g,'<br />');
}

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
})
.get('/chat', function(req, res, next) {
    res.render('chat/index');
})
.get('/room', function(req, res, next) {
    res.render('room/index');
})
.get('/chatP', function(req, res, next) {
    res.render('chatP/index');
})
.get('/user', function(req, res, next) {
    res.render('user');
})
.get('/search', function(req, res, next) {
    res.render('search');
});

/* GET data */
// 获取分类列表
router.get('/getCampus', function(req, res, next) {
    global.modelHandle('area').find({}, function(err, data) {
        if (err) {
            console.log(err);
        } else {
            res.json(data);
        }
    });
});

// 获取房间列表
router.get('/getRoomsList/:pn/:tag', function(req, res, next) {
    var uId = req.session.uId;
    var pSize = 12; // 每页数据量
    var pn = req.params.pn.slice(4); // 当前页
    var tag = req.params.tag.slice(5);
    var json = {};
    var status = 0;
    var condition = (tag == 'hot') ? {} 
        : {
            rBelongToID: tag
        };


    // 获取房间信息  首先获取总数
    function step1() {
        return new Promise(function(resolve, reject) {
            global.modelHandle('room').find(condition, function(err, data) {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    }

    // 获取房间信息  获取每个数据
    function step2() {
        return new Promise(function(resolve, reject) {
            global.modelHandle('room').find(condition, function(err, data) {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            })
            .sort({
                'rCurCount': -1
            })
            .skip((pn - 1) * pSize)
            .limit(pSize);
        });
    }

    // 再根据房间房主id获取相应房间房主信息
    function step3() {
        var promiseTemp = [];
        for (var i = 0; i < json.rooms.length; i++) {
            promiseTemp.push(new Promise(function(resolve, reject) {
                global.modelHandle('user').findOne({
                    uId: json.rooms[i].rOwnerId
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
    // 判断房主是否为自己的好友
    function step4() {
        var promiseTemp = [];
        for (var i = 0; i < json.rooms.length; i++) {
            promiseTemp.push(new Promise(function(resolve, reject) {
                if (!uId) {
                    resolve(1);
                    return;
                }
                status = 1;
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
    // 再根据房间房主id获取相应房间 房间所属
    function step5() {
        var promiseTemp = [];
        for (var i = 0; i < json.rooms.length; i++) {
            promiseTemp.push(new Promise(function(resolve, reject) {
                global.modelHandle('area').findOne({
                    aId: json.rooms[i].rBelongToID
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

    // promise
    step1()
        .then(function(data) {
            json.rTotal = data.length;
            json.rooms = []; // 房间信息数组
        }, function(err) {
            console.log(err);
        })
    .then(step2)
        .then(function(data) {
            json.rooms = data;
        }, function(err) {
            console.log(err);
        })
    .then(step3)
        .then(function(data) {
            for (var i = 0; i < data.length; i++) {
                json.rooms[i].uNickName = data[i].uNickName;
                json.rooms[i].uSex = data[i].uSex;
                json.rooms[i].uLoginState = data[i].uLoginState;
            }
        }, function(err) {
            console.log(err);
        })
    .then(step4)
        .then(function(data) {
            if (data) {
                for (var i = 0; i < json.rooms.length; i++) {
                    var uIsFriends = false;
                    json.rooms[i].uIsSelf = false;
                    for (var j = 0; j < data[i].length; j++) {
                        if (data[i][j].ugUsersId.indexOf(json.rooms[i].rOwnerId) !== -1) {
                            uIsFriends = true;
                            break;
                        }
                    }

                    json.rooms[i].uIsFriends = uIsFriends;
                    if (json.rooms[i].rOwnerId == uId) {
                        json.rooms[i].uIsSelf = true;
                    } else {
                        json.rooms[i].uIsSelf = false;
                    }
                }
                
            }
        }, function(err) {
            console.log(err);
        })
    .then(step5)
        .then(function(data) {
            for (var i = 0; i < data.length; i++) {
                json.rooms[i].aName = data[i].aName;
            }

            json.status = status;
            res.json(json);
        }, function(err) {
            console.log(err);
        });
});

// 搜索房间或好友
router.get('/getSearchResult/:tag/:w', function(req, res, next) {
    var uId = req.session.uId;
    var tag = req.params.tag.slice(5);

    var keyWord = req.params.w.slice(3);
    // 判断关键词是否为全数字  用于是否进行房间id查找
    var keyWordIsNum = false;
    if (keyWord) {
        keyWordIsNum = !/\D/.test(keyWord);
    }

    var json = {};
    json.rooms = []; // byRoomName
    json.users = []; // byUserName
    var status = 0;
    var tagCorr = {
            '不限': 10,
            '房名': 1,
            '房号': 2,
            '昵称': 3
        };

    // 搜索条件不限  先搜索用户再搜索房间
    if (tag == 10) {
        userSearchExecute(roomSearchExecute);
    } else if (tag == 1 || tag == 2) {
        roomSearchExecute();
    } else if (tag == 3) {
        userSearchExecute();
    }

    // 根据条件搜索相关用户
    function userSearchExecute(cb) {
        findUserByName()
            .then(function(data) {
                for (var i = 0; i < data.length; i++) {
                    if (data[i].uNickName.indexOf(keyWord) !== -1) {
                        json.users.push(data[i]);
                    }
                }
                
            }, function(err) {
                console.log(err);
            })
        .then(judgeUserIsFriends)
            .then(function(data) {
                if (data) {
                    for (var i = 0; i < json.users.length; i++) {
                        var uIsFriends = false;
                        json.users[i].uIsSelf = false;
                        for (var j = 0; j < data[i].length; j++) {
                            if (data[i][j].ugUsersId.indexOf(json.users[i].uId) !== -1) {
                                uIsFriends = true;
                                break;
                            }
                        }

                        json.users[i].uIsFriends = uIsFriends;
                        if (json.users[i].uId == uId) {
                            json.users[i].uIsSelf = true;
                        } else {
                            json.users[i].uIsSelf = false;
                        }
                    }
                }
                
                if (cb) {
                    cb();
                } else {
                    json.status = status;
                    res.json(json);
                }
            }, function(err) {
                console.log(err);
            });
    }

    // 根据条件搜索相关房间
    function roomSearchExecute(cb) {
        findRoomById()
            .then(function(data) {
                if (data != 1) {
                    json.rooms.push(data);
                }
                
            }, function(err) {
                console.log(err);
            })
        .then(findRoomByName)
            .then(function(data) {
                for (var i = 0; i < data.length; i++) {
                    if (data[i].rName.indexOf(keyWord) !== -1) {
                        json.rooms.push(data[i]);
                    }
                }
                
            }, function(err) {
                console.log(err);
            })
        .then(findRoomOwnerInfo)
            .then(function(data) {
                for (var i = 0; i < data.length; i++) {
                    json.rooms[i].uNickName = data[i].uNickName;
                    json.rooms[i].uSex = data[i].uSex;
                    json.rooms[i].uLoginState = data[i].uLoginState;
                }
            }, function(err) {
                console.log(err);
            })
        .then(judgeOwnerIsFriends)
            .then(function(data) {
                if (data) {
                    for (var i = 0; i < json.rooms.length; i++) {
                        var uIsFriends = false;
                        json.rooms[i].uIsSelf = false;
                        for (var j = 0; j < data[i].length; j++) {
                            if (data[i][j].ugUsersId.indexOf(json.rooms[i].rOwnerId) !== -1) {
                                uIsFriends = true;
                                break;
                            }
                        }

                        json.rooms[i].uIsFriends = uIsFriends;
                        if (json.rooms[i].rOwnerId == uId) {
                            json.rooms[i].uIsSelf = true;
                        } else {
                            json.rooms[i].uIsSelf = false;
                        }
                    }
                    
                }
            }, function(err) {
                console.log(err);
            })
        .then(findRoomAreaInfo)
            .then(function(data) {
                for (var i = 0; i < data.length; i++) {
                    json.rooms[i].aName = data[i].aName;
                }

                if (cb) {
                    cb();
                } else {
                    json.status = status;
                    res.json(json);
                }
                
            }, function(err) {
                console.log(err);
            });
    }

    // 根据房间id获取房间信息
    function findRoomById() {
        return new Promise(function(resolve, reject) {
            if (!(tag == 2 || tag == 10) || !keyWordIsNum) {
                resolve(1);
                return;
            }

            global.modelHandle('room').findOne({
                rId: keyWord
            }, function(err, data) {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    }

    // 获取房间信息  获取每个数据
    function findRoomByName() {
        return new Promise(function(resolve, reject) {
            if (tag != 1 && json.rooms.length) {
                resolve(1);
                return;
            }
            
            global.modelHandle('room').find({}, function(err, data) {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            })
        });
    }

    // 再根据房间房主id获取相应房间房主信息
    function findRoomOwnerInfo() {
        var promiseTemp = [];
        for (var i = 0; i < json.rooms.length; i++) {
            promiseTemp.push(new Promise(function(resolve, reject) {
                global.modelHandle('user').findOne({
                    uId: json.rooms[i].rOwnerId
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
    // 判断房主是否为自己的好友
    function judgeOwnerIsFriends() {
        var promiseTemp = [];
        for (var i = 0; i < json.rooms.length; i++) {
            promiseTemp.push(new Promise(function(resolve, reject) {
                if (!uId) {
                    resolve(1);
                    return;
                }

                status = 1;
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

    // 再根据房间房主id获取相应房间 房间所属
    function findRoomAreaInfo() {
        var promiseTemp = [];
        for (var i = 0; i < json.rooms.length; i++) {
            promiseTemp.push(new Promise(function(resolve, reject) {
                global.modelHandle('area').findOne({
                    aId: json.rooms[i].rBelongToID
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

    // 找出符合条件的用户
    function findUserByName() {
        return new Promise(function(resolve, reject) {
            global.modelHandle('user').find({}, function(err, data) {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    }

    // 查询每个用户是否为自己好友
    function judgeUserIsFriends() {
        var promiseTemp = [];
        for (var i = 0; i < json.users.length; i++) {
            promiseTemp.push(new Promise(function(resolve, reject) {
                if (!uId) {
                    resolve(1);
                    return;
                }

                status = 1;
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

});

// 更新房间在线人数
router.post('/updateRoomClientNum', function(req, res, next) {
    global.modelHandle('room').update({
        rId: req.body.rId
    }, {
        $set: {
            rCurCount: req.body.num
        }
    }, function(err, data) {
        if (err) {
            console.log(err);
        } else {
            res.json({
                status: 1
            });
        }
    });
});

// 新增房间 
router.post('/newRoom', function(req, res, next) {
    // 先获取当前房间总数len  则创建的房间id为 len+1
    global.modelHandle('room').find({}, function(err, data) {
        if (err) {
            console.log(err);
        } else {
            var rId = data.length + 1;
    
            // 处理图片文件的上传
            var tmp_path = req.files['c-room-logo'].path;
            var target_path = './public/img/room/' + req.files['c-room-logo'].name;

            var readStream = fs.createReadStream(tmp_path);
            var writeStream = fs.createWriteStream(target_path);
            util.pump(readStream, writeStream, function(err) {
                fs.unlinkSync(tmp_path);
            });

            // 创建房间
            global.modelHandle('room').create({
                rId: rId,
                rBelongToID: req.body['c-room-cat'],
                rName: dataFilter(req.body['c-room-name']),
                rImage: target_path.slice(8),
                rOwnerId: req.body['c-room-ownerId'],
                rDesc: dataFilter(req.body['c-room-desc']),
                rCreatTime: req.body['c-room-time']
            }, function(err, data) {
                if (err) {
                    console.log(err);
                } else {
                    res.json({
                        re: 1
                    });
                }
            });
        }
    });
});

module.exports = router;
