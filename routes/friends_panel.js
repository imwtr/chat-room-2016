var express = require('express');
var router = express.Router();

// 用户讨论组信息拉取   用于模态框中
router.get('/getGroups', function(req, res, next) {
    var status = 0;
    var uId = req.session.uId;
    var json = {};
    json.group = [];

    if (!uId) {
        res.json({
            'status': status
        });
        return;
    }

    global.modelHandle('group').find({}, function(err, data) {
        if (err) {
            console.log(err);
        } else {
            // 找出有该用户的讨论组
            for (var i = 0; i < data.length; i++) {
                if (data[i].gUserId.indexOf(uId) !== -1) {
                    json.group.push(data[i]);
                }
            }
            status = 1;
            json.status = status;
            res.json(json);
        }
    });
});

// 用户好友分组获取  简版 用于模态框的分组选择
router.get('/getUserGroups', function(req, res, next) {
    var status = 0;
    var uId = req.session.uId;
    var json = {};
    json.userGroup = [];

    if (!uId) {
        res.json({
            'status': status
        });
        return;
    }

    global.modelHandle('usergroup').find({
        ugBelongToID: uId
    }, function(err, data) {
        if (err) {
            console.log(err);
        } else {
            if (data) {
                json.userGroup = data;
                status = 1;
                json.status = status;

                res.json(json);
            }
        }
    });
});

// 加入好友分组
router.post('/joinUserGroup', function(req, res, next) {
    var status = 0;
    var ugTotal = 0;
    var uId = req.session.uId;
    var theUID = req.body.theUID;
    var tag = req.body.tag;
    var ugId = req.body.ugId;
    var ugName = req.body.ugName;
    var json = {};
    
    // 用于是否为对方也创建自己的分组信息
    var wasFriend = true;

    if (!uId || !theUID) {
        res.json({
            'status': status
        });
        return;
    }

    // 对方==自己  则不需要添加
    if (uId == theUID) {
        res.json({
            'status': status
        });
        return;
    }

    uId = parseInt(uId, 10);
    theUID = parseInt(theUID, 10);

    // 判断是新建分组还是加入已有分组
    if (tag === 'join') {
        ugId = parseInt(ugId, 10);
    }

    // 计算总数  为接下来的分组id做准备
    function step_count() {
        return new Promise(function(resolve, reject) {
            global.modelHandle('usergroup').count({}, function(err, total) {
                if (err) {
                    reject(err);
                } else {
                    resolve(total);
                }
            });
        });
    }
    // 新建分组  自己
    function step_new_self(ugId) {
        return new Promise(function(resolve, reject) {
            global.modelHandle('usergroup').create({
                ugId: ugId,
                ugName: ugName,
                ugUsersId: [theUID],
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
    // 新建分组  对方
    function step_new_other(ugId) {
        return new Promise(function(resolve, reject) {
            // 如果已经是好友  则直接跳过
            if (wasFriend) {
                resolve(1);
                return;
            }
        
            global.modelHandle('usergroup').create({
                ugId: ugId,
                ugName: ugName,
                ugUsersId: [uId],
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
    // 查找theUID在原有分组中  可用于在原分组中删除其
    function step_UG_findTheUID() {
        return new Promise(function(resolve, reject) {
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
    // 删除原有分组中的theUID
    function step_UG_delTheUID(obj) {
        return new Promise(function(resolve, reject) {
            // 如果不存在原分组信息  则直接跳过
            if (obj.index === -1) {
                resolve(1);
            }

            global.modelHandle('usergroup').update({
                ugId: obj.ugId
            }, {
                $set: {
                    ugUsersId: obj.ugUsersId
                }
            }, function(err, data) {
                if (err) {
                    console.log(err);
                } else {
                    resolve(data);
                }
            });
        });
    }
    // 找到对应的新分组
    function step_UG_findTheUG() {
        return new Promise(function(resolve, reject) {
            global.modelHandle('usergroup').findOne({
                ugId: ugId
            }, function(err, data) {
                if (err) {
                    console.log(err);
                } else {
                    resolve(data);
                }
            });
        });
    }
    // theUID用户加入分组
    function step_UG_addTheUID(obj) {
        return new Promise(function(resolve, reject) {
            global.modelHandle('usergroup').update({
                ugId: obj.ugId
            }, {
                $set: {
                    ugUsersId: obj.ugUsersId
                }
            }, function(err, data) {
                if (err) {
                    console.log(err);
                } else {
                    resolve(data);
                }
            });
        });
    }


    // 新建
    if (!ugId) {
        // 查找原分组的theUID项
        step_UG_findTheUID()
            .then(function(data) {
                var index = -1;
                for (var i = 0; i < data.length; i++) {
                    if (data[i].ugUsersId.indexOf(theUID) !== -1) {
                        index = data[i].ugUsersId.indexOf(theUID);
                        data[i].ugUsersId.splice(index, 1);
                        // 返回相应数据  提供删除
                        
                        return {
                            index: index,
                            ugId: data[i].ugId,
                            ugUsersId: data[i].ugUsersId
                        };
                    }
                }
                // 原先非好友 则不存在原分组信息  返回 -1
                wasFriend = false;
                return {
                    index: index
                };
            }, function(err) {
                console.log(err);
            })
        // 删除原分组的theUID项  执行
        .then(step_UG_delTheUID)
            .then(function(data) {
            }, function(err) {
                console.log(err);
            })
        // 计算总分组数据  为生成新id作准备
        .then(step_count)
            .then(function(total) {
                ugTotal = total;
                return ugTotal + 1;
            }, function(err) {
                console.log(err);
            })
        // 新增分组  添加自己
        .then(step_new_self)
            .then(function(data) {
                return ugTotal + 2;
            }, function(err) {
                console.log(err);
            })
        // 新增分组  添加对方  返回
        .then(step_new_other)
            .then(function(data) {
                status = 1;
                res.json({
                    'status': status
                });
            }, function(err) {
                console.log(err);
            });
    }
    // 加入
    else {
        // 查找原分组的theUID项
        step_UG_findTheUID()
            .then(function(data) {
                
                var index = -1;
                for (var i = 0; i < data.length; i++) {
                    if (data[i].ugUsersId.indexOf(theUID) !== -1) {
                        index = data[i].ugUsersId.indexOf(theUID);
                        data[i].ugUsersId.splice(index, 1);
                        // 返回相应数据  提供删除
                        return {
                            index: index,
                            ugId: data[i].ugId,
                            ugUsersId: data[i].ugUsersId
                        };
                    }
                }
                
                wasFriend = false;
                return {
                    index: index
                };
            }, function(err) {
                console.log(err);
            })
        // 删除原分组的theUID项  执行
        .then(step_UG_delTheUID)
            .then(function(data) {
                
            }, function(err) {
                console.log(err);
            })
        // 找到指定的分组
        .then(step_UG_findTheUG)
            .then(function(data) {
                data.ugUsersId.push(theUID);
                return {
                    ugId: data.ugId,
                    ugUsersId: data.ugUsersId
                };

            }, function(err) {
                console.log(err);
            })
        // 用户theUID 加入指定的分组
        .then(step_UG_addTheUID)
            .then(function(data) {
                status = 1;
                res.json({
                    'status': status
                });
            }, function(err) {
                console.log(err);
            });
    }
});

// 用户退出讨论组
router.post('/quitFromGroup', function(req, res, next) {
    var status = 0;
    var uId = req.session.uId;
    var uNickName = req.session.uNickName;
    var gId = req.body.gId;
    var json = {};
    json.group = [];

    if (!uId) {
        res.json({
            'status': status
        });
        return;
    }

    // 获取原有讨论组信息 
    global.modelHandle('group').findOne({
        gId: gId
    }, function(err, data) {
        if (err) {
            console.log(err);
        } else {
            if (data) {
                var index = data.gUserId.indexOf(uId);
                if (index !== -1) {
                    data.gUserId.splice(index, 1);
                }
                // 如果此时讨论组成员小于2人  则删除讨论组
                if (data.gUserId.length < 2) {
                    // 删除该讨论组
                    global.modelHandle('group').remove({
                        gId: gId
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
                    })
                } 
                // 更新操作  删除用户
                else {
                    var regPrev = new RegExp('^' + uNickName + '、');
                    var regMid = new RegExp('、' + uNickName + '、');
                    var regNext = new RegExp('、' + uNickName + '$');

                    global.modelHandle('group').update({
                        gId: gId
                    }, {
                        $set: {
                            gName: data.gName.replace(regPrev, '').replace(regMid, '、').replace(regNext, ''),
                            gUserId: data.gUserId,
                            gCount: data.gCount - 1
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
                }
            }
        }
    });
});

// 用户讨论组信息拉取   用于用户好友面板中
router.get('/getMyGroups', function(req, res, next) {
    var status = 0;
    var uId = req.session.uId;
    var json = {};
    json.group = [];

    if (!uId) {
        res.json({
            'status': status
        });
        return;
    }

    // 获取该用户的所有讨论组
    function step1() {
        return new Promise(function(resolve, reject) {
            global.modelHandle('group').find({}, function(err, data) {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    }
    // 对各讨论组  获取相应的最新最后一条消息
    function step2() {
        var promiseTemp = [];
        for (var i = 0; i < json.group.length; i++) {
            promiseTemp.push(new Promise(function(resolve, reject) {
                global.modelHandle('chat').find({
                    cBelongToID: 'chat_' + json.group[i].gId
                }, function(err, data) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(data);
                    }
                })
                .sort({
                    cTime: '1'
                })
                .limit(1);
            }));
        };

        return Promise.all(promiseTemp);
    }
    // 对各讨论组  获取相应的最后一条消息 的相应用户
    function step3() {
        var promiseTemp = [];
        for (var i = 0; i < json.group.length; i++) {
            promiseTemp.push(new Promise(function(resolve, reject) {
                global.modelHandle('user').findOne({
                    uId: json.group[i].cUserId
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

    // Promise
    step1()
        .then(function(data) {
            // 找出有该用户的讨论组
            for (var i = 0; i < data.length; i++) {
                if (data[i].gUserId.indexOf(uId) !== -1) {
                    json.group.push(data[i]);
                }
            }
            
        }, function(err) {
            console.log(err);
        })
    .then(step2)
        .then(function(data) {
            for (var i = 0; i < data.length; i++) {
                if (data[i].length) {
                    json.group[i].lastMsg = data[i][0].cDetail;
                    json.group[i].cUserId = data[i][0].cUserId;
                }
            }
        }, function(err) {
            console.log(err);
        })
    .then(step3)
        .then(function(data) {
            for (var i = 0; i < data.length; i++) {
                if (data[i] !== null) {
                    json.group[i].lastUser = data[i].uNickName;
                }
            }

            status = 1;
            json.status = status;

            res.json(json);
        }, function(err) {
            console.log(err);
        });
});

// 从会话列表中移除指定会话
router.post('/removeChatFromPanel', function(req, res, next) {
    var uId = req.session.uId;
    var status = 0;
    var json = {};

    if (!uId) {
        json.status = status;
        res.json(json);
        return;
    }

    global.modelHandle('chat').update({
        cId: req.body.cId
    }, {
        $set: {
            cShow: 0
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

// 删除指定好友
router.post('/deleteFriend', function(req, res, next) {
    var uId = req.session.uId;
    var theUID = req.body.theUID;
    var status = 0;
    var json = {};

    if (!uId) {
        json.status = status;
        res.json(json);
        return;
    }

    // 先从好友分组中找到属于登录用户的分组  再删除
    global.modelHandle('usergroup').find({
        ugBelongToID: uId
    }, function(err, data) {
        if (err) {
            console.log(err);
        } else {
            for (var i = 0; i < data.length; i++) {
                // 删除指定的用户
                var index = data[i].ugUsersId.indexOf(theUID);
                if (index !== -1) {
                    data[i].ugUsersId.splice(index, 1);

                    global.modelHandle('usergroup').update({
                        ugId: data[i].ugId
                    }, {
                        $set: {
                            ugUsersId: data[i].ugUsersId
                        }
                    }, function(err) {
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
                }
            }
        }
    });

});

// 获取最近历史消息  最后一条
router.get('/getLastHistoryChat', function(req, res, next) {
    var uId = req.session.uId;
    var status = 0;
    var json = {};
    json.group = []; // 讨论组
    json.chatP = []; // 私信

    if (!uId) {
        json.status = status;
        res.json(json);
        return;
    }

    /**
     * 策略： 先获取讨论组  再添加上私聊的
     */

    // 获取该用户的所有讨论组
    function step1() {
        return new Promise(function(resolve, reject) {
            global.modelHandle('group').find({}, function(err, data) {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    }
    // 对各讨论组  获取相应的最新最后一条消息
    function step2() {
        var promiseTemp = [];
        for (var i = 0; i < json.group.length; i++) {
            promiseTemp.push(new Promise(function(resolve, reject) {
                global.modelHandle('chat').find({
                    cBelongToID: 'chat_' + json.group[i].gId
                }, function(err, data) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(data);
                    }
                })
                .sort({
                    cTime: '1'
                })
                .limit(1);
            }));
        };

        return Promise.all(promiseTemp);
    }

    // 获取有该用户的私聊信息   没办法。。 只能全搜。。
    function step3() {
        return new Promise(function(resolve, reject) {
            global.modelHandle('chat').find({}, function(err, data) {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    }

    // 对搜到的匹配信息   查询所属用户信息
    function step4() {
        var promiseTemp = [];
        for (var i = 0; i < json.chatP.length; i++) {
            promiseTemp.push(new Promise(function(resolve, reject) {
                global.modelHandle('user').findOne({
                    uId: json.chatP[i].cUserId
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

    // 查询私聊模式中用户是否为自己好友
    function step5() {
        var promiseTemp = [];
        for (var i = 0; i < json.chatP.length; i++) {
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

    // Promise
    step1()
        .then(function(data) {
            // 找出有该用户的讨论组
            for (var i = 0; i < data.length; i++) {
                if (data[i].gUserId.indexOf(uId) !== -1) {
                    json.group.push(data[i]);
                }
            }
            
        }, function(err) {
            console.log(err);
        })
    .then(step2)
        .then(function(data) {
            for (var i = 0; i < data.length; i++) {
                if (data[i].length) {
                    json.group[i].cId = data[i][0].cId;
                    json.group[i].cDetail = data[i][0].cDetail;
                    json.group[i].cUserId = data[i][0].cUserId;
                    json.group[i].cTime = data[i][0].cTime;
                    json.group[i].cBelongToID = data[i][0].cBelongToID;
                }

            }

        }, function(err) {
            console.log(err);
        })
    .then(step3)
        .then(function(data) {
            
            var chatPTemp = [];
            for (var i = 0; i < data.length; i++) {
                // 获取该用户的私聊信息
                var reg = new RegExp("chat_" + uId + "_\\d+|chat_\\d+_" + uId);
                if (reg.test(data[i].cBelongToID) && data[i].cShow == 1) {
                    chatPTemp.push(data[i]);
                }
            }
        
            // 只取最近的一条信息
            chatPTemp.sort(function(a, b) {
                if (a.cBelongToID === b.cBelongToID) {
                    return b.cTime > a.cTime;
                } else {
                    return b.cBelongToID > a.cBelongToID;
                }
            });
            // 去除重复
            var hash = {};
            for (var i = 0; i < chatPTemp.length; i++) {
                if (!hash[chatPTemp[i].cBelongToID]) {
                    hash[chatPTemp[i].cBelongToID] = true;
                    json.chatP.push(chatPTemp[i]);
                }
            }

            // 获取该私聊的对方信息
            for (var i = 0; i < json.chatP.length; i++) {
                var a = json.chatP[i].cBelongToID.split('_'); // ext: chat_1_2
                for (var j = 0; j < a.length; j++) {
                    if (!isNaN(parseInt(a[j], 10)) && a[j] != uId) {
                        json.chatP[i].cUserId = a[j];
                    }
                }
            }
        
        }, function(err) {
            console.log(err);
        })
    .then(step4)
        .then(function(data) {
            for (var i = 0; i < data.length; i++) {
                json.chatP[i].uNickName = data[i].uNickName;
                json.chatP[i].uImage = data[i].uImage;
                json.chatP[i].uSignature = data[i].uSignature;
            }
        }, function(err) {
            console.log(err);
        })
    .then(step5)
        .then(function(data) {
            for (var i = 0; i < json.chatP.length; i++) {
                var uIsFriends = false;
                for (var j = 0; j < data[i].length; j++) {
                    if (data[i][j].ugUsersId.indexOf(json.chatP[i].cUserId) !== -1) {
                        uIsFriends = true;
                        break;
                    }
                }
                json.chatP[i].uIsFriends = uIsFriends;
                
            }

            status = 1;
            json.status = status;
            res.json(json);
        }, function(err) {
            console.log(err);
        });
});

// 获取用户好友列表
router.get('/getMyFriends', function(req, res, next) {
    var uId = req.session.uId;
    var status = 0;
    var json = {};
    json.userGroups = [];

    if (!uId) {
        json.status = status;
        res.json(json);
        return;
    }

    // 先查询该用户的好友分组
    function step1() {
        return new Promise(function(resolve, reject) {
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
    // 查询每个分组下对应用户的
    function step2() {
        var promiseTemp = [];
        for (var i = 0; i < json.userGroups.length; i++) {
            for (var j = 0; j < json.userGroups[i].ugUsers.length; j++) {
                promiseTemp.push(new Promise(function(resolve, reject) {
                    global.modelHandle('user').findOne({
                        uId: json.userGroups[i].ugUsers[j].uId
                    }, function(err, data) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(data);
                        }
                    });
                }));
            }
        }

        return Promise.all(promiseTemp);
    }

    // Promise 
    step1()
        .then(function(data) {
            // 获取该用户的好友分组
            for (var i = 0; i < data.length; i++) {
                json.userGroups[i] = {};
                json.userGroups[i].ugId = data[i].ugId;
                json.userGroups[i].ugName = data[i].ugName;
                json.userGroups[i].ugUsers = [];
                // 获取每个分组所有的用户id  提供接下来的查询
                for (var j = 0; j < data[i].ugUsersId.length; j++) {
                    json.userGroups[i].ugUsers[j] = {};
                    json.userGroups[i].ugUsers[j].uId = data[i].ugUsersId[j];
                }
            }
        }, function(err) {
            console.log(err);
        })
    .then(step2)
        .then(function(data) {
            
            var index = 0;
            for (var i = 0; i < json.userGroups.length; i++) {
                for (var j = 0; j < json.userGroups[i].ugUsers.length; j++) {
                    if (data[index]) {
                        json.userGroups[i].ugUsers[j].uNickName = data[index].uNickName;
                        json.userGroups[i].ugUsers[j].uSex = data[index].uSex;
                        json.userGroups[i].ugUsers[j].uImage = data[index].uImage;
                        json.userGroups[i].ugUsers[j].uLoginState = data[index].uLoginState;
                        json.userGroups[i].ugUsers[j].uSignature = data[index++].uSignature;
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

// 修改分组名称
router.post('/renameUGroup', function(req, res, next) {
    var uId = req.session.uId;
    var ugId = req.body.ugId;
    var ugName = req.body.ugName;
    var status = 0;

    if (!uId) {
        res.json({
            'status': status
        });
        return;
    }

    global.modelHandle('usergroup').update({
        ugId: ugId
    }, {
        $set: {
            ugName: ugName
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

// 加入讨论组  用于模态框中
router.post('/joinGroup', function(req, res, next) {
    var gId;
    var uId = req.session.uId;
    var uNickName = req.session.uNickName;
    var gUserId = [];
    var json = {};
    var gName = '';
    var gCount = 2;
    var status = 0;


    // 未登录直接返回
    if (!uId) {
        res.json({
            'status': status
        });
        return;
    }

    // 对方==自己  直接返回
    if (uId == req.body.newUserId) {
        res.json({
            'status': status
        });
        return;
    }

    // 判断是加入讨论组还是新增讨论组
    if (req.body.tag === 'join') {
        gId = parseInt(req.body.gId, 10);
    }

    // 新增讨论组
    if (!gId) {
        global.modelHandle('group').count(function(err, total) {
            if (err) {
                console.log(err);
            } else {
                gId = total + 1;
                gUserId.push(uId);
                gUserId.push(parseInt(req.body.newUserId, 10));
                gName = req.session.uNickName + '、' + req.body.newUserNickName;

                // 新增
                global.modelHandle('group').create({
                    gId: gId,
                    gName: gName,
                    gUserId: gUserId,
                    gCount: gCount,
                    gTime: req.body.newDate
                }, function(err, data) {
                    if (err) {
                        console.log(err);
                    } else {
                        status = 1;
                        json.status = status;
                        json.gId = data.gId;
                        json.gName = data.gName;
                        json.gTime = data.gTime;
                        res.json(json);
                    }
                });
            }
        });
    } 
    // 加入讨论组
    else {
        // 先获取原有讨论组名及所有用户
        global.modelHandle('group').findOne({
            gId: gId
        }, function(err, data) {
            if (err) {
                console.log(err);
            } else {
                if (data) {
                    gUserId = data.gUserId;
                    gName = data.gName;
                    gCount = data.gCount;
                    gTime = data.gTime;

                    // 如果新用户已在讨论组中则无需再加入
                    if (gUserId.indexOf(req.body.newUserId) !== -1) {
                        status = 1;
                        json.status = status;
                        json.gId = data.gId;
                        json.gName = data.gName;
                        json.gTime = data.gTime;
                        res.json(json);
                        return;
                    }

                    gUserId.push(parseInt(req.body.newUserId, 10));
                    gName += '、' + req.body.newUserNickName;
                    gCount = gCount + 1;

                    // 加入
                    global.modelHandle('group').update({
                        gId: gId
                    }, {
                        $set: {
                            gName: gName,
                            gUserId: gUserId,
                            gCount: gCount
                        }
                    }, function(err, data) {
                        if (err) {
                            console.log(err);
                        } else {
                            status = 1;
                            json.status = status;
                            json.gId = gId;
                            json.gName = gName;
                            json.gTime = gTime;
                            res.json(json);
                        }
                    });
                }
            }
        });
    }

});

// 创建第一条私聊记录
router.post('/createChatP', function(req, res, next) {
    var uId = req.session.uId;
    var theUID = req.body.theUID;
    var status = 0;
    var json = {};

    if (!uId) {
        json.status = status;
        res.json(json);
        return;
    } 

    // 
    var cBelongToID = 'chat_' + uId + '_' + theUID;
    var cBelongToID1 = 'chat_' + theUID + '_' + uId;

    var isExists = false;

    // 判断是否已存在
    function findIfExists(cBelongToID) {
        if (isExists) {
            resolve(1);
            return;
        }

        return new Promise(function(resolve, reject) {
            global.modelHandle('chat').findOne({
                cBelongToID: cBelongToID
            }, function(err, data) {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    }

    // 查询总记录
    function findTotal() {
        return new Promise(function(resolve, reject) {
            if (isExists) {
                resolve(1);
                return;
            }

            global.modelHandle('chat').count({}, function(err, total) {
                if (err) {
                    reject(err);
                } else {
                    resolve(total);
                }
            });
        });
    }

    // 建立第一条私聊信息
    function createChatP(total) {
        return new Promise(function(resolve, reject) {
            if (isExists) {
                resolve(1);
                return;
            }

            global.modelHandle('chat').create({
                cId: total + 1,
                cBelongToID: cBelongToID,
                cTime: req.body.newDate,
                cDetail: 'hi',
                cUserId: uId
            }, function(err, data) {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    }

    // 查询相应用户的信息
    function findUserInfo() {
        return new Promise(function(resolve, reject) {
            global.modelHandle('user').findOne({
                uId: theUID
            }, function(err, data) {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    }
    
    findIfExists(cBelongToID)
        .then(function(data) {
            if (data) {
                status = -1;
                isExists = true;
                //json.cBelongToID = data.cBelongToID;
            }

            return cBelongToID1;
        }, function(err) {
            console.log(err);
        })
    .then(findIfExists)
        .then(function(data) {
            if (data) {
                status = -1;
                isExists = true;
                //json.cBelongToID = data.cBelongToID;
            }
        }, function(err) {
            console.log(err);
        })
    .then(findTotal)
        .then(function(total) {
            return total;
        }, function(err) {
            console.log(err);
        })
    .then(createChatP)
        .then(function(data) {
            if (data) {
                //json.cBelongToID = data.cBelongToID;
            }
        }, function(err) {
            console.log(err);
        })
    .then(findUserInfo)
        .then(function(data) {
            if (data) {
                status = 1;
                json.status = status;
                json.cBelongToID = cBelongToID;
                json.uImage = data.uImage;
                json.uNickName = data.uNickName;
                json.uSignature = data.uSignature;
                json.uId = data.uId;

                res.json(json);
            }
        }, function(err) {
            console.log(err);
        });
});


// 好友面板搜索
router.post('/panelSearch', function(req, res, next) {
    var uId = req.session.uId;
    var keyWord = req.body.keyWord;
    var status = 1;
    var json = {};
    json.userMyFriends = []; // 好友
    json.userMyGroups = []; // 讨论组

    if (!uId || !keyWord) {
        json.status = status;
        res.json(json);
        return;
    }

    var tag = req.body.tag;
    var isMore = req.body.isMore;

    // 先查询该用户的好友分组
    function findFriends_step1() {
        return new Promise(function(resolve, reject) {
            if (tag === 'group') {
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
    // 查询每个分组下对应用户的
    function findFriends_step2() {
        var promiseTemp = [];
        for (var i = 0; i < json.userMyFriends.length; i++) {
            promiseTemp.push(new Promise(function(resolve, reject) {
                if (tag === 'group') {
                    resolve(1);
                    return;
                }

                global.modelHandle('user').findOne({
                    uId: json.userMyFriends[i].uId
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

    // 先查询该用户的好友分组
    function findGroups_step1() {
        return new Promise(function(resolve, reject) {
            if (tag === 'friend') {
                resolve(1);
                return;
            }

            global.modelHandle('group').find({}, function(err, data) {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    }

    // Promise 
    findFriends_step1()
        .then(function(data) {
            // 获取该用户的好友分组
            var index = 0;
            json.userMyFriends = [];

            for (var i = 0; i < data.length; i++) {
                // 获取每个分组所有的用户id  提供接下来的查询
                for (var j = 0; j < data[i].ugUsersId.length; j++) {
                    json.userMyFriends[index] = {};
                    json.userMyFriends[index++].uId = data[i].ugUsersId[j];
                }
            }
        }, function(err) {
            console.log(err);
        })
    .then(findFriends_step2)
        .then(function(data) {
            var index = 0;
            for (var i = 0; i < data.length; i++) {
                // 匹配keyWord  是否为获取全部  默认只取5条
                if (data[i].uNickName.indexOf(keyWord) !== -1 && (isMore == 1 || index < 5)) {
                    json.userMyFriends[index].uNickName = data[i].uNickName;
                    json.userMyFriends[index++].uImage = data[i].uImage;
                }
            }
        }, function(err) {
            console.log(err);
        })
    .then(findGroups_step1)
        .then(function(data) {
            
            var index = 0;
            for (var i = 0; i < data.length; i++) {
                // 匹配keyWord  是否为获取全部  默认只取5条
                if (data[i].gUserId.indexOf(uId) !== -1 && data[i].gName.indexOf(keyWord) !== -1 && (isMore == 1 || index < 5)) {
                    json.userMyGroups[index] = {};
                    json.userMyGroups[index].gId = data[i].gId;
                    json.userMyGroups[index].gName = data[i].gName;
                    json.userMyGroups[index++].gTime = data[i].gTime;
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