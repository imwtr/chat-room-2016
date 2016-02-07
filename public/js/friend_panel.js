    // 搜索条件选择
    function searchMenuHandle() {
        $('#search-menu').click(function(e) {
            var node = e.target || e.srcElement;
            var condition;
            var li;

            if (node.nodeName === 'A') {
                li = $(node.parentNode);
                condition = li.attr('data-val');
                li.addClass('active').siblings('li').removeClass('active');

                $('#search-condition').html(condition + '<span class="caret"></span>');
                $('#search-input').attr('placeholder', condition === '不限' ? '搜索' : '搜索' + condition);
            }

        });

        // 根据条件进行搜索
        $('#search-btn').click(searchByInput);
        $('form[name="search-form"]').submit(searchByInput);

        function searchByInput(e) {
            var node = e.target || e.srcElement;

            if (node.nodeName !== 'BUTTON') {
                e.preventDefault();
            }

            var inputVal = $.trim($('#search-input').val());
            var condition = $.trim($('#search-condition').text());
            var tag = {
                '不限': 10,
                '房名': 1,
                '房号': 2,
                '昵称': 3
            };

            if (inputVal === '' || !tag[condition]) {
                return;
            }

            window.location = '/search?tag=' + tag[condition] + '&w=' + encodeURIComponent(inputVal);

        }
    }

    // 占位符替换
    function keyWordReplace($obj, data) {
        if ($obj.html() == '') {
            return '';
        }
        return $obj.html().replace(/\{(.+?)\}/g, function($, key) {
            return data[key] == 'undefined' ? '' : data[key];
        });
    }

    // 获取我的好友
    function getMyFriends() {
            var $friendsList = $('#friends-list');
            var $userGroupTemplate = $('#friends-list-userGroup-template');
            var $userTemplate = $('#friends-list-user-template');

            $.ajax({
                type: 'get',
                url: '/getMyFriends',
                success: function(data) {
                    // 已登录  成功获取并渲染
                    var userTemp = [];
                    var userGroupTemp = [];
                    var curCount = 0;
                    var totalCount = 0;
                    var userSexY = 0;
                    var userIsOnline;

                    if (data.status == 1) {
                        for (var i = 0; i < data.userGroups.length; i++) {
                            userTemp = [];

                            // 计算当前总数与在线数量
                            curCount = 0;
                            totalCount = data.userGroups[i].ugUsers.length;
                            for (var j = 0; j < totalCount; j++) {
                                // 有无签名判断
                                if (!data.userGroups[i].ugUsers[j].uSignature) {
                                    data.userGroups[i].ugUsers[j].uSignature = ' ';
                                }
                                // 上线状态判断
                                if (data.userGroups[i].ugUsers[j].uLoginState === 'up') {
                                    userIsOnline = '';
                                    curCount++;
                                } else {
                                    userIsOnline = '不';
                                }

                                // 用户性别判断
                                if (data.userGroups[i].ugUsers[j].uSex === 'girl') {
                                    userSexY = -15; // 坐标
                                } else {
                                    userSexY = 0;
                                }
                                
                                data.userGroups[i].ugUsers[j].userIsOnline = userIsOnline;
                                data.userGroups[i].ugUsers[j].userSexY = userSexY;
                            }

                            data.userGroups[i].ugCountCur = curCount;
                            data.userGroups[i].ugCountTotal = totalCount;

                            // 分组名防止过长  只取前14个字符
                            data.userGroups[i].ugNameAll = data.userGroups[i].ugName;
                            if (data.userGroups[i].ugName.length > 14) {
                                data.userGroups[i].ugName = data.userGroups[i].ugName.slice(0, 14) + '..';
                            }
                            userGroupTemp.push(keyWordReplace($userGroupTemplate, data.userGroups[i]));

                            for (var j = 0; j < totalCount; j++) {
                                userTemp.push(keyWordReplace($userTemplate, data.userGroups[i].ugUsers[j]));
                            }
                            userGroupTemp.push(userTemp.join(''));
                            userGroupTemp.push('</ul></li>');
                        }

                        $friendsList.html(userGroupTemp.join(''));

                        friendListIconHandle();
                        groupRenameHandle();

                    } else if (data.status == 0) {

                    }
                },
                error: function(e) {
                    console.log(e);
                    console.log(e.textStatus);
                }
            });
        }

        // 修改好友组名
        function groupRenameHandle() {
            $('.friends-list-group-rename').click(function() {
                var $groupName = $(this).prev().find('.friends-list-group-name');
                
                // 当前为0代表即将进行修改   反正将要确定
                if ($(this).attr('data-val') == 0) {
                    $(this).attr('data-val', '1');
                    $(this).removeClass('glyphicon-pencil').addClass('glyphicon-ok');
                    var renameInput = '<input type="text" class="friends-list-group-name" value="' + $groupName.attr('title') + '">';
                    $groupName.prop('outerHTML', renameInput);

                } else {
                    // 分组名不允许为空
                    if ($.trim($groupName.val()) == '') {
                        return;
                    }

                    $(this).attr('data-val', '0');
                    $(this).removeClass('glyphicon-ok').addClass('glyphicon-pencil');
                    var groupNameTemp = $groupName.val();
                    if (groupNameTemp.length > 14) {
                        groupNameTemp = groupNameTemp.slice(0, 14) + '..';
                    }
                    var renameSpan = '<span class="friends-list-group-name" title="' + $groupName.val() + '">' + groupNameTemp + '</span>';

                    // 提交修改
                    var ugId;
                    try {
                        ugId = $(this).next().attr('id').match(/(\d+)/)[1];
                    } catch (e) {
                        return;
                    }
                    
                    $.ajax({
                        type: 'post',
                        url: '/renameUGroup',
                        data: {
                            ugId: ugId,
                            ugName: $groupName.val()
                        },
                        success: function(data) {
                            // 分组名更改成功
                            if (data.status == 1) {
                                $groupName.prop('outerHTML', renameSpan);
                            } else {

                            }
                        },
                        error: function(e) {
                            console.log(e);
                            console.log(e.textStatus);
                        }
                    });
                }
            });
        }
        

        // 好友分组列表icon展开列表处理
        function friendListIconHandle() {
            $('#friends-list').children('li').click(function(e) {
                // 子元素li列表点击不改变图标
                e = e || window.event;
                var node = e.target || e.srcElement;
                var isOk = false;

                if (((node.tagName === 'SPAN' || node.tagName === 'INPUT') && node.parentNode.tagName === 'P') ||
                    node.tagName === 'P' && node.parentNode.tagName === 'LI') {
                    isOk = true;
                }

                if (!isOk) {
                    return;
                }

                var $icon = $(this).find('span').eq(0);
                if (!$(this).children('ul').hasClass('in')) {
                    $icon.removeClass('glyphicon-chevron-right').addClass('glyphicon-chevron-down');
                } else {
                    $icon.removeClass('glyphicon-chevron-down').addClass('glyphicon-chevron-right');
                }
            });
        }

        // 获取最近历史消息  最后一条
        function getLastHistoryChat() {
            var $historyChat = $('#history-chat-list');
            var chats = [];
            var liTemp = [];

            $.ajax({
                type: 'get',
                url: '/getLastHistoryChat',
                success: function(data) {
                    // 已登录则可获取信息并渲染
                    if (data.status == 1) { 
                        // 先按时间顺序排好序  降序
                        var hash = {}; // hash去重

                        for (var i = 0; i < data.group.length; i++) {
                            if (!data.group[i] || !data.group[i].cBelongToID) {
                                continue;
                            }
                            var id1 = data.group[i].cBelongToID;

                            if (!hash[id1]) {
                                hash[id1] = true;
                                chats.push(data.group[i]);
                            }
                            
                        }

                        for (var i = 0; i < data.chatP.length; i++) {
                            if (!data.chatP[i] || !data.chatP[i].cBelongToID) {
                                continue;
                            }
                            var id1 = data.chatP[i].cBelongToID;
                            var id2 = [id1.split('_')[0], id1.split('_')[2], id1.split('_')[1]].join('_');

                            if (!hash[id1] && !hash[id2]) {
                                hash[id2] = hash[id1] = true;
                                chats.push(data.chatP[i]);
                            }
                        
                        }
                        chats.sort(function(a, b) {
                            return b.cTime > a.cTime;
                        });

                        // 渲染到好友面板
                        for (var i = 0; i < chats.length; i++) {
                            var logo;
                            var name;
                            var gTime = '';
                            var signature = '';
                            var type = '';
                            var id = '';
                            var isFriends = 1;
                            // 判断是讨论组还是私聊模式  相应的字段不一样
                            // 讨论组
                            if (/chat_\d+$/.test(chats[i].cBelongToID)) {
                                logo = '/img/group.png';
                                name = chats[i].gName;
                                gTime = chats[i].gTime;
                                type = 'chat';
                                id = chats[i].gId;
                            } else {
                                logo = chats[i].uImage;
                                name = chats[i].uNickName;
                                signature = chats[i].uSignature ? chats[i].uSignature : '';
                                type = 'chatP';
                                id = chats[i].cUserId;
                                if (!chats[i].uIsFriends) {
                                    isFriends = 0;
                                }
                            }

                            liTemp.push('<li data-toggle="popover" data-cBelongToID="' + chats[i].cBelongToID + '" data-cId="' + chats[i].cId + '">' +
                                            '<a href="javascript:void(0);" class="list-group-item">' +
                                                '<img src="' + logo + '" alt="头像" width="30px" height="30px" class="pull-left">' +
                                                '<h6 class="chat-list-nickname" data-isFriends="' + isFriends + '" data-id="' + id + '" data-type="' + type + '" title="' + name + '" data-time="' + gTime +'" data-signature="' + signature + '">' + name + '</h6>' +
                                                '<p class="chat-list-data">' + chats[i].cDetail + '</p>' +
                                                '<span class="chat-list-time">' + chats[i].cTime.slice(chats[i].cTime.indexOf(' ')) + '</span>' +
                                                '<span class="chat-list-num-per badge hide">0</span>' +
                                            '</a>' +
                                        '</li>');
                        }

                        $historyChat.html(liTemp.join(''));

                        // 聊天信息右键显示
                        $('#history-chat-list').contextmenu(function() {
                            return false;
                        }).find('li').popover({
                            trigger: 'click',
                            html: true,
                            content: '<ul class="list-unstyled">' +
                                '<li><a href="javascript:void(0);" data-val="enter-chat">查看会话</a></li>' +
                                '<li><a href="javascript:void(0);" data-val="remove-chat" class="text-warning">移除此会话</a></li>',
                            placement: 'top'
                        });

                        // 历史栏li点击后消息数量隐藏
                        $('#history-chat-list').delegate('li', 'click', function() {
                            $(this).find('span').eq(1).text('0').addClass('hide');
                        });
                    } else {

                    }
                },
                error: function(e) {
                    console.log(e);
                    console.log(e.textStatus);
                }
            });
        }

        // 获取我的讨论组
        function getMyGroups() {
            $.ajax({
                type: 'get',
                url: '/getMyGroups',
                success: function(data) {
                    // 已登录  成功获取并渲染
                    if (data.status == 1) {
                        var liTemp = [];
                        for (var i = 0; i < data.group.length; i++) {
                            // 判断是否有最后的消息记录
                            var isHide = data.group[i].lastUser ? '' : 'hide';
                            liTemp.push('<li data-toggle="popover" class="list-group-item" data-gId="' + data.group[i].gId + '">' +
                                            '<img src="/img/group.png" alt="group" width="40px" height="40px">' +
                                            '<p>' +
                                                '<span class="group-name" title="' + data.group[i].gName + '" data-time="' + data.group[i].gTime + '">' + data.group[i].gName + '</span>' +
                                                '<span class="group-num-per">' + data.group[i].gCount + '(人)</span>' +
                                            '</p>' +
                                            '<p class="group-last-msg">' +
                                                '<span class="group-last-msg-user ' + isHide + '">' + data.group[i].lastUser + ':</span>' +
                                                '<span class="group-last-msg-info ' + isHide + '" title="' + data.group[i].lastMsg + '">' + data.group[i].lastMsg + '</span>' +
                                            '</p>' +
                                        '</li>');
                        }
                        $('#group-list').html(liTemp.join(''));

                        // 讨论组信息右键显示
                        $('#group-list').contextmenu(function() {
                            return false;
                        }).find('li').popover({
                            trigger: 'click',
                            html: true,
                            content: '<ul class="list-unstyled">' +
                                '<li><a href="javascript:void(0);" data-act="enterG">进入讨论组</a></li>' +
                                '<li><a href="javascript:void(0);" data-act="quitG" class="text-warning">退出讨论组</a></li>',
                            placement: 'top'
                        });
                    } else if (data.status == 0) {

                    }
                },
                error: function(e) {
                    console.log(e);
                    console.log(e.textStatus);
                }
            });
        }


    // 好友面板
    function friendPanelHandle() {
        var $userFriendsPanel = $('#user-friends-panel');
        var $changeObj = $('#room-list-wrap').length 
            ? $('#room-list-wrap') : $('#room-search-wrap').length
            ? $('#room-search-wrap') : $('#chat-content-wrapper');

        // 展开/收起好友面板
        $('#my-friends').click(function() {
            if ($userFriendsPanel.hasClass('in') || $('#userInfo').find('a').eq(0).attr('href') === '#') {
                $changeObj.removeClass('col-sm-6').addClass('col-sm-9');
                $userFriendsPanel.hide();

            } else {
                $changeObj.removeClass('col-sm-9').addClass('col-sm-6');
                $userFriendsPanel.show();
            }

            $(window).resize(); 
        });
        $('#my-friends').click();

        $userFriendsPanel.find('span').eq(0).click(function() {
            $('#my-friends').trigger('click');
        });

        $('.user-friends-body').scroll(function() {
            $(this).find('.popover').popover('hide');
        });

        // 聊天面板四个功能事件绑定 
        $('#user-friends-panel-menu').click(function(e) {
            e = e || window.event;
            var node = e.target || e.srcElement;

            while (node && node.tagName !== 'LI') {
                node = node.parentNode;
            }

            var index = node.getAttribute('data-index');
            index != '3' && $(node.parentNode).find('button').removeClass('btn-info').eq(index).addClass('btn-info');

            switch (index) {
                case '0':
                    $('#history-chat-list').show();
                    $('#friends-list').hide();
                    $('#group-list').hide();
                    break;
                case '1':
                    $('#history-chat-list').hide();
                    $('#friends-list').show();
                    $('#group-list').hide();
                    break;
                case '2':
                    $('#history-chat-list').hide();
                    $('#friends-list').hide();
                    $('#group-list').show();
                    break;
                case '3':
                    window.open(node.getAttribute('data-href'));
                    break;
                default:
                    break;
            }
        });

        // 好友信息右键显示
        $('#friends-list ul').contextmenu(function() {
            return false;
        });

        // 获取最近历史消息  最后一条
        getLastHistoryChat();
        
        // 历史消息栏中事件绑定
        bindHistoryChatEvent();
        function bindHistoryChatEvent() {
            
            // 从会话列表中删除
            $('#history-chat-list').delegate('[data-val="remove-chat"]', 'click', function() {
                var cId = $(this).closest('.popover').prev().attr('data-cId');
                
                $.ajax({
                    type: 'post',
                    url: '/removeChatFromPanel',
                    data: {
                        cId: cId
                    },
                    success: function(data) {
                        // 移除成功  刷新
                        if (data.status == 1) {
                            getLastHistoryChat();
                        } else {

                        }
                    },
                    error: function(e) {
                        console.log(e);
                        console.log(e.textStatus);
                    }
                });
            });

            // 进入会话
            $('#history-chat-list').delegate('[data-val="enter-chat"]', 'click', function() {
                var $li = $(this).closest('.popover').prev();

                var cBelongToID = $li.attr('data-cBelongToID');
                
                var $h6 = $li.find('h6');
                // 添加至左侧列表菜单
                floatChatHandle(
                    $h6.attr('data-type'),
                    $h6.attr('data-id'),
                    $h6.attr('data-isFriends'),
                    'new',
                    cBelongToID,
                    $li.find('img').attr('src'),
                    $h6.text(),
                    $h6.attr('data-type') === 'chat' ? $h6.attr('data-time') : $h6.attr('data-signature'),
                    0
                );
                // 显示聊天浮窗
                $('#chat-wrapper').show();
            });
        }

        $(document).delegate('[data-toggle="popover"]', 'show.bs.popover', function() {
            $('.popover').popover('hide');
            $(this).next('.popover').popover('show');
        });

        // 拉取我的好友
        getMyFriends();
        
        // 我的好友部分的事件操作绑定
        bindMyFriendsEvent();
        function bindMyFriendsEvent() {
            $('#friends-list, #search-friends-list, #user-search-wrap').delegate('a', 'click', function() {
                var $that = $(this);
                var act = $(this).attr('data-act');
                var $ul = $(this).closest('ul');
                var theUID = $ul.attr('id');
                theUID = theUID && theUID.slice(theUID.lastIndexOf('-') + 1);
                var theUNickName;
                var isPanelSearch = ($ul.find('h6').length === 0);
                var isPageSearch = false;
                var uIsFriends = '1';
                if ($('#user-search-wrap').length === 1) {
                    isPageSearch = true;
                    if ($(this).closest('#user-search-wrap').length === 1) {
                        uIsFriends = $that.attr('data-isFriends') == 'true' ? '1' : '0';
                    }
                    
                }
                

                if (!isPanelSearch) {
                    theUNickName = $ul.find('h6').text();
                } else {
                    theUNickName = $.trim($ul.prev().find('h6').text());
                }
                

                // 进入会话
                if (act === 'chatP') {
                    createChatP(theUID, function(data) {
                        // 如果未登录  显示登录提示框
                        if (data.status == 0) {
                            $('#tips-div').modal('show');
                            return;
                        }
                        
                        // 添加至左侧列表菜单
                        floatChatHandle(
                            'chatP',
                            data.uId,
                            uIsFriends,
                            'new',
                            data.cBelongToID,
                            data.uImage,
                            data.uNickName,
                            data.uSignature,
                            0
                        );
                        // 显示聊天浮窗
                        $('#chat-wrapper').show();
                    });
                }
                // 添加好友
                if (act === 'addU') {
                    $('.popover').popover('hide');
                    fetchUserGroups();
                    changeUserGroup(theUID, function() {
                        if (isPageSearch) {
                            $that.addClass('hide').next().removeClass('hide');
                        }
                        changeFriendsState($('#room-list-wrap'), theUID, '1');
                        changeFriendsState($('#room-search-wrap'), theUID, '1');
                        changeFriendsState($('#chat-content-chats'), theUID, '1');
                        changeFriendsState($('#room-info'), theUID, '1');
                        changeFriendsState($('#chat-content-userList'), theUID, '1');
                    });
                }
                // 删除好友
                if (act === 'delU') {
                    $('.popover').popover('hide');
                    deleteFriend(theUID, function() {
                        if (isPanelSearch) {
                            $('#panel-search').next().click();
                        }
                        
                        if (isPageSearch) {
                            $that.addClass('hide').prev().removeClass('hide');
                        }

                        changeFriendsState($('#room-list-wrap'), theUID, '0');
                        changeFriendsState($('#room-search-wrap'), theUID, '0');
                        changeFriendsState($('#chat-content-chats'), theUID, '0');
                        changeFriendsState($('#room-info'), theUID, '0');
                        changeFriendsState($('#chat-content-userList'), theUID, '0');
                    });
                }
                // 更换讨论组
                if (act === 'changeUG') {
                    fetchUserGroups();
                    changeUserGroup(theUID);
                }
                // 进入讨论组
                if (act === 'joinG') {
                    fetchGroups();
                    joinGroupHandle(theUID, theUNickName);
                }
                
            });
        }

        // 聊天浮窗上的退出讨论组/添加好友/删除好友 事件绑定
        $('#chat-title-sub').delegate('a', 'click', function() {
            var $that = $(this);
            var $li;
            // 找出相应的li菜单
            $('#chat-left-menu').find('li').each(function() {
                if ($(this).attr('data-val') === $that.attr('data-val')) {
                    $li = $(this);
                    return false;
                }
            });

            // 退出讨论组
            if ($that.attr('data-type') === 'chat') {
                quitFromGroup($that.attr('data-id'));
                // 关闭这个聊天会话
                $li.find('span').eq(2).click();
            } 
            else {
                var objId = $that.attr('data-id');
                var id = $that.attr('data-val');
                var $span0 = $li.find('span').eq(0);
                // 添加好友
                if ($that.attr('data-act') === '1') {
                    fetchUserGroups(objId);
                    changeUserGroup(objId, function() {
                        $that.prop('outerHTML', '<a href="javascript:void(0);" class="text-warning" data-val="' + id + '" data-act="0" data-id="' + objId + '" data-type="chatP" data-toggle="tooltip" data-title="删除好友">&nbsp;<span class="glyphicon glyphicon-remove"></span></a>');
                        $span0.attr('data-isFriends', '1');
                        $('#chat-title-sub').children('a').tooltip();
                        
                        changeFriendsState($('#room-list-wrap'), objId, '1');
                        changeFriendsState($('#room-search-wrap'), objId, '1');
                        changeFriendsState($('#chat-content-chats'), objId, '1');
                        changeFriendsState($('#room-info'), objId, '1');
                        changeFriendsState($('#chat-content-userList'), objId, '1');
                    });
                } 
                // 删除好友
                else {
                    deleteFriend(objId, function() {
                        $that.prop('outerHTML', '<a href="javascript:void(0);" class="text-primary" data-val="' + id + '" data-act="1" data-id="' + objId + '" data-type="chatP" data-toggle="tooltip" data-title="TA还不是你好友哦，点击添加好友">&nbsp;<span class="glyphicon glyphicon-plus"></span></a>');
                        $span0.attr('data-isFriends', '0');
                        $('#chat-title-sub').children('a').tooltip();
                    
                        changeFriendsState($('#room-list-wrap'), objId, '0');
                        changeFriendsState($('#room-search-wrap'), objId, '0');
                        changeFriendsState($('#chat-content-chats'), objId, '0');
                        changeFriendsState($('#room-info'), objId, '0');
                        changeFriendsState($('#chat-content-userList'), objId, '0');
                    });
                }
            }
        });

        // 退出讨论组
        function quitFromGroup(gId, cb) {
            $.ajax({
                type: 'post',
                url: '/quitFromGroup',
                data: {
                    gId: gId
                },
                success: function(data) {
                    // 退出成功  刷新
                    if (data.status == 1) {
                        getMyGroups();
                        getLastHistoryChat();
                        try {
                            window.localStorage.removeItem('chat_' + gId);
                            window.localStorage.removeItem('chat_' + gId + '_num');

                            cb && cb();
                        } catch (e) {

                        }
                    } else {
                    }
                },
                error: function(e) {
                    console.log(e);
                    console.log(e.textStatus);
                }
            });
        }
        // 拉取讨论组
        getMyGroups();
        
        // 我的讨论组部分事件绑定
        bindMyGroupsEvent();
        function bindMyGroupsEvent() {
            // 进入讨论组  我的讨论组页
            $('#group-list').delegate('[data-act="enterG"]', 'click', function() {
                var $li = $(this).closest('.popover').prev();
                var gId = $li.attr('data-gId');

                // 添加至左侧列表菜单
                floatChatHandle(
                    'chat',
                    $li.attr('data-gId'),
                    '0',
                    'new',
                    'chat_' + gId,
                    $li.find('img').attr('src'),
                    $li.find('span').eq(0).text(),
                    $li.find('span').eq(0).attr('data-time'),
                    0
                );
                // 显示聊天浮窗
                $('#chat-wrapper').show();
            });

            // 进入讨论组  讨论组搜索页
            $('#search-groups-list').delegate('[data-act="enterG"]', 'click', function() {
                var $a = $(this).closest('ul').prev();
                var gId = $a.attr('data-target').slice($a.attr('data-target').lastIndexOf('-') + 1);

                // 添加至左侧列表菜单
                floatChatHandle(
                    'chat',
                    gId,
                    '0',
                    'new',
                    'chat_' + gId,
                    $a.find('img').attr('src'),
                    $a.text(),
                    $a.attr('data-time'),
                    0
                );
                // 显示聊天浮窗
                $('#chat-wrapper').show();
            });

            // 退出讨论组
            $('#group-list').delegate('[data-act="quitG"]', 'click', function() {
                var gId = $(this).closest('.popover').prev().attr('data-gId');
                
                quitFromGroup(gId, function() {

                });
            });

            // 退出讨论组  讨论组搜索页
            $('#search-groups-list').delegate('[data-act="quitG"]', 'click', function() {
                var $a = $(this).closest('ul').prev();
                var gId = $a.attr('data-target').slice($a.attr('data-target').lastIndexOf('-') + 1);
                
                quitFromGroup(gId, function() {
                    $('#panel-search').next().click();
                });
            });
        }

        // 好友面板关键词搜索
        function panelSearch(keyWord, tag, isMore, cb) {
            var $liTemplate;
            var $ulObj;
            var jsonObj;
            var judgeStr;

            if (tag === 'friend') {
                $liTemplate = $('#friends-list-searchUser-template');
                $ulObj = $('#search-friends-list').find('ul');
                jsonObj = 'userMyFriends';
                judgeStr = 'uNickName';
            } else if (tag === 'group') {
                $liTemplate = $('#friends-list-searchGroup-template');
                $ulObj = $('#search-groups-list').find('ul');
                jsonObj = 'userMyGroups';
                judgeStr = 'gName';
            }

            $.ajax({
                type: 'post',
                url: '/panelSearch',
                data: {
                    keyWord: keyWord,
                    tag: tag,
                    isMore: isMore
                },
                success: function(data) {
                    // 获取成功
                    if (data.status == 1) {
                        var liTemp = [];
                        for (var i = 0; i < data[jsonObj].length; i++) {
                            if (data[jsonObj][i][judgeStr]) {
                                data[jsonObj][i][judgeStr] = data[jsonObj][i][judgeStr].replace(keyWord, '<span class="search-match">' + keyWord + '</span>');
                                liTemp.push(keyWordReplace($liTemplate, data[jsonObj][i]));
                            }
                        }
                        
                        $ulObj.html(!liTemp.length ? '<span class="text-muted f12">没有相关记录哦</span>' : liTemp.join(''));
                    }

                    cb();
                },
                error: function(e) {
                    console.log(e);
                    console.log(e.textStatus);
                }
            });
        }

        // 好友面板搜索事件
        bindPanelSearchEvent();
        function bindPanelSearchEvent() {
            var $searchInput = $('#panel-search');
            var $closeBtn = $searchInput.next();
            var $searchBtn = $closeBtn.next();
            var $searchList = $('#search-list');
            var $panelMenu = $('#user-friends-panel-menu');


            // 隐藏搜索结果
            $closeBtn.click(function() {
                $searchList.hide();
                $panelMenu.show();
                $('#user-friends-panel-menu').find('li').eq(0).click();
                $closeBtn.addClass('hide');
                $searchBtn.removeClass('hide');
                $searchInput.val('');
            });

            // 输入框值改变则显示搜索结果
            $searchInput.on('input propertychange', function() {
                var val = $searchInput.val();
                if (!$.trim(val)) {
                    return;
                }

                $searchBtn.addClass('hide');
                $closeBtn.removeClass('hide');

                // 搜索
                panelSearch($.trim(val), 'friend', 0, function() {
                    // 显示搜索结果
                    $searchList.show().siblings().hide();
                    $panelMenu.hide();
                });

                panelSearch($.trim(val), 'group', 0, function() {
                    // 显示搜索结果
                    $searchList.show().siblings().hide();
                    $panelMenu.hide();
                });
            });

            // 查看更多结果
            $('#search-friends-list').find('a').eq(0).click(function() {
                panelSearch($.trim($searchInput.val()), 'friend', 1, function() {
                    // 显示搜索结果
                    $searchList.show().siblings().hide();
                    $panelMenu.hide();
                });
            });

            $('#search-groups-list').find('a').eq(0).click(function() {
                panelSearch($.trim($searchInput.val()), 'group', 1, function() {
                    // 显示搜索结果
                    $searchList.show().siblings().hide();
                    $panelMenu.hide();
                });
            });
        }
    }