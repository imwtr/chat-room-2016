        
        $(document).delegate('[data-toggle="popover"]', 'show.bs.popover', function() {
            $('.popover').popover('hide');
            $(this).next('.popover').popover('show');
        });
        
        // 添加好友/删除好友  更新其他相关用户好友状态
        function changeFriendsState($obj, theUID, isFriends) {
            var BEHide = (isFriends == '0' ? '' : 'hide');
            var ISHide = (isFriends == '1' ? '' : 'hide');
            // 为所有指定的uId更新状态
            $obj.find('p[data-uId="' + theUID + '"], li[data-uId="' + theUID + '"]').each(function() {
                var $popoverParent = (this.tagName === 'LI' ? $(this) : $(this).children('span'));
                if (!$popoverParent.length || $popoverParent.attr('data-toggle') != 'popover') {
                    $popoverParent =  $(this).children('a');
                }

                // 更新popover触发元素的content值
                var regBE = /(\{be\s)(.*?)(\seb\})/;
                var regIS = /(\{is\s)(.*?)(\ssi\})/;
                var regF = /(\{F)(.*?)(F\})/;
                var newPopoverContent = $popoverParent.attr('data-content').replace(regBE, '$1' + BEHide + '$3').replace(regIS, '$1' + ISHide + '$3').replace(regF, '$1' + isFriends + '$3');
                $popoverParent.attr('data-content', newPopoverContent);
            });
            
            // 删除好友搜索栏相应记录
            if (isFriends == '0') {
                $('#friends-list-searchUser-' + theUID).closest('li').hide();
            }
            // 更新用户搜索好友状态
            var isFriendsState = (isFriends == '1' ? 'true' : 'false');
            var $searchUser = $('#search-user-' + theUID);
            var $searchUserAddU = $searchUser.find('a[data-act="addU"]');
            var $searchUserDelU = $searchUser.find('a[data-act="delU"]');
            if (isFriends == '1') {
                $searchUserAddU.addClass('hide');
                $searchUserDelU.removeClass('hide');
            } else {
                $searchUserAddU.removeClass('hide');
                $searchUserDelU.addClass('hide');
            }
            $searchUser.find('a[data-act="chatP"]').attr('data-isFriends', isFriendsState);
            
            // 更新用户好友面板历史消息好友状态
            $('#history-chat-list').find('h6[data-Id="' + theUID + '"]').attr('data-isFriends', isFriends);
            $('#userList').find('li[data-id="' + theUID + '"]').attr('data-isFriends', isFriends);
           
            // 更新浮窗上好友状态
            var $leftMenuSpan = $('#chat-left-menu').find('span[data-Id="' + theUID + '"]');
            var _dataact;
            var _datatitle;
            var _dataclass;
            var _datatextclass;
            if (isFriends == 1) {
                _dataact = '0';
                _datatitle = '删除好友';
                _dataclass = 'glyphicon glyphicon-remove';
                _datatextclass = 'text-warning';
            } else {
                _dataact = '1';
                _datatitle = 'TA还不是你好友哦，点击添加好友';
                _dataclass = 'glyphicon glyphicon-plus';
                _datatextclass = 'text-primary';
            }
            $leftMenuSpan.attr('data-isFriends', isFriends);
            if ($leftMenuSpan.closest('li').hasClass('chat-item-active')) {
                if ($('#chat-title-sub').children('a').attr('data-type') === 'chatP') {
                    $('#chat-title-sub').children('a').attr('data-act', _dataact).attr('data-title', _datatitle).attr('class', _datatextclass);
                    $('#chat-title-sub').find('span').eq(0).attr('class', _dataclass);
                }
                
            }
            $('.popover').popover('hide');
        }

        function fetchGroups($that) {
            // 拉取用户讨论组信息
            $.ajax({
                type: 'get',
                url: 'http://closer-chat.coding.io/getGroups',
                success: function(data) {
                    // 获取成功
                    if (data.status == 1) {
                        var divTemp = [];
                        for (var i = 0; i < data.group.length; i++) {
                            divTemp.push('<div class="radio bg-info">' +
                                            '<label>' +
                                                '<input type="radio" name="group-choose" id="group-choose-' + data.group[i].gId + '" value="' + data.group[i].gId + '">' + data.group[i].gName + ' (' + data.group[i].gCount + '人)' +
                                            '</label>' +
                                        '</div>');
                        }
                        divTemp.push('<p id="new-group">' +
                                        '<button type="button" class="btn btn-info btn-xs" id="new-choose-btn" data-val="0">添加至新的讨论组' +
                                        '</button>' +
                                    '</p>');
                        $('#modal-group-list').html(divTemp.join(''));
                        $('#tips-choose-group').modal('show');
                        $that && $that.closest('.popover').popover('hide');
                    } 
                    // 未登录状态
                    else if (status == 0) {
                        $('#tips-div').modal('show');
                        $that && $that.closest('.popover').popover('hide');
                    }
                    
                },
                error: function(e) {
                    console.log(e);
                    console.log(e.textStatus);
                }
            }); 
        }


        function joinGroupHandle(theUID, theUNickName) {
            var $userA;
            var $that;
            // 显示已有讨论组
            
            $(document).delegate('button[data-tag="group"]','click', function() {
                $that = $(this);    
                // 点击的用户对象
                $userA = $that.closest('div').find('a');

                fetchGroups($that);
                
            });
            
            // 监听加入讨论组modal各操作
            // 选择已有的or创建新的
            
            $('#modal-group-list').delegate('#new-choose-btn', 'click', function(e) {
                $('#new-choose-btn').attr('data-val', '1').html('添加至新的讨论组 <span class="glyphicon glyphicon-ok"></span>');
                $('#modal-group-list').find('input').prop('checked', '');
            });

            // $('#modal-group-list').delegate('input', 'click');
            $('#modal-group-list').delegate('input', 'click', function() {
                $('#new-choose-btn').attr('data-val', '0').html('添加至新的讨论组');
                $('#tips-choose-group').modal('show');
            });

            // 已确定选择相应讨论组
            $('#group-choose-btn').unbind().click(function() {
                var radioVal = $('#modal-group-list input:radio[name="group-choose"]:checked').val();
                var newGroupVal = $('#new-choose-btn').attr('data-val');
                // new 为添加新讨论组   join为加入该讨论组
                var tag = (newGroupVal == 1 ? 'new' : 'join');
                if (!radioVal && newGroupVal == 0) {
                    return;
                }

                $.ajax({
                    type: 'post',
                    url: 'http://closer-chat.coding.io/joinGroup',
                    data: {
                        newUserId: theUID || $userA && $userA.attr('href').slice($userA.attr('href').lastIndexOf('=') + 1),
                        newUserNickName: theUNickName || $userA && $userA.text(),
                        tag: tag,
                        gId: radioVal,
                        newDate: Util.formatDate(new Date(), 'yyyy/mm/dd hh:ii:ss')
                    },
                    success: function(data) {
                        if (data.status == 1) {
                            getMyGroups();
                            // 添加至左侧列表菜单
                            floatChatHandle(
                                'chat',
                                data.gId,
                                '0',
                                'new',
                                'chat_' + data.gId,
                                'img/group.png',
                                data.gName,
                                data.gTime,
                                0
                            );

                            $('#chat-wrapper').show();
                        } else if (data.status == 0) {

                        }
                    },
                    error: function(e) {
                        console.log(e);
                        console.log(e.textStatus);
                    }
                });
            });
        }

        // 删除指定好友
        function deleteFriendHandle(theUID, cb) {
            $.ajax({
                type: 'post',
                url: 'http://closer-chat.coding.io/deleteFriend',
                data: {
                    theUID: theUID
                },
                success: function(data) {
                    // 删除成功  刷新
                    if (data.status == 1) {
                        getMyFriends();
                        cb();
                    } else {
                    }
                },
                error: function(e) {
                    console.log(e);
                    console.log(e.textStatus);
                }
            });
        }
        
        function deleteFriend(theUID, cb) {
            var $deleteTipModal = $('#tips-delete-friend');
            var $confirmBtn = $deleteTipModal.find('button').eq(1);

            $deleteTipModal.modal('show');
            // 确定删除了再删除
            $confirmBtn.click(function() {
                deleteFriendHandle(theUID, cb);
            });
        }


        // 获取用户的好友分组
        function fetchUserGroups($that) {
            // 拉取用户好友分组信息
            $.ajax({
                type: 'get',
                url: 'http://closer-chat.coding.io/getUserGroups',
                success: function(data) {
                    // 获取成功
                    if (data.status == 1) {
                        var divTemp = [];
                        for (var i = 0; i < data.userGroup.length; i++) {
                            divTemp.push('<div class="radio bg-info">' +
                                            '<label>' +
                                                '<input type="radio" name="group-choose" id="group-choose-' + data.userGroup[i].ugId + '" value="' + data.userGroup[i].ugId + '">' + data.userGroup[i].ugName +
                                            '</label>' +
                                        '</div>');
                        }
                        divTemp.push('<p id="new-group">' +
                                        '<input type="text" name="new-userGroup-input" id="new-userGroup-input" placeholder="请输入分组名">' +
                                        '<button type="button" class="btn btn-info btn-xs" id="new-choose-btn" data-val="0">创建新分组' +
                                        '</button>' +
                                    '</p>');
                        $('#modal-userGroup-list').html(divTemp.join(''));
                        $('#tips-choose-userGroup').modal('show');
                        //$that && $that.closest('.popover').popover('hide');
                    } 
                    // 未登录状态
                    else if (status == 0) {
                        $('#tips-div').modal('show');
                        $that && $that.closest('.popover').popover('hide');
                    }
                    
                },
                error: function(e) {
                    console.log(e);
                    console.log(e.textStatus);
                }
            }); 
        }

        // 更换好友分组
        function changeUserGroup(theUID, cb) {
            var $userA;
            var $that;
            // 显示已有分组
            $(document).delegate('button[data-tag="friend"]','click', function() {
                $that = $(this);    
                // 点击的用户对象
                $userA = $that.closest('div').find('a');
                
                theUID = $userA.attr('href').slice($userA.attr('href').lastIndexOf('=') + 1);
                var isAddFriends = false;

                // act:1  添加好友  act:0  删除好友
                if (($that).attr('data-act') == 1) {
                    fetchUserGroups($that);
                    isAddFriends = true;
                    
                } else {
                    deleteFriend(theUID, function() {
                        getMyFriends();
                        // 更新当前popover按钮状态
                        $that.addClass('hide').closest('p').prev().children('button').removeClass('hide');
                        // 更新popover触发元素的content值
                        var $popoverParent = $that.closest('.popover').prev();
                        var regBE = /(\{be\s)(.*?)(\seb\})/;
                        var regIS = /(\{is\s)(.*?)(\ssi\})/;
                        var newPopoverContent = $popoverParent.attr('data-content').replace(regBE, '$1$3').replace(regIS, '$1hide$3');
                        $popoverParent.attr('data-content', newPopoverContent);
                        $that.addClass('hide').closest('div').find('a').attr('data-isFriends', '0');

                        changeFriendsState($('#room-list-wrap'), theUID, '0');
                        changeFriendsState($('#room-search-wrap'), theUID, '0');
                        changeFriendsState($('#chat-content-chats'), theUID, '0');
                        changeFriendsState($('#room-info'), theUID, '0');
                        changeFriendsState($('#chat-content-userList'), theUID, '0');
                        
                    });
                }
            });
            
            // 顺便也监听私信按钮的点击
            $(document).delegate('button[data-tag="private"]','click', function() {
                // 点击的用户对象
                var $userA = $(this).closest('div').find('a');
                var theUID = $userA.attr('href').slice($userA.attr('href').lastIndexOf('=') + 1);
                var $li = $(this).closest('.popover').prev();
                $(this).closest('.popover').popover('hide');

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
                        $userA.attr('data-isFriends').replace(/\{F|F\}/g, ''),
                        'new',
                        data.cBelongToID,
                        'http://closer-chat.coding.io' + data.uImage,
                        data.uNickName,
                        data.uSignature,
                        0
                    );
                    // 显示聊天浮窗
                    $('#chat-wrapper').show();
                });
            });

            var $userGroupChooseBtn = $('#userGroup-choose-btn');
            var $newGroupInput = $('#new-userGroup-input');
            // 监听加入分组modal各操作
            // 选择已有的or创建新的
            $('#modal-userGroup-list').delegate('#new-choose-btn', 'click', function() {
                if ($.trim($('#new-userGroup-input').val()) == '') {
                    return;
                }

                $('#new-choose-btn').attr('data-val', '1').html('创建新分组 <span class="glyphicon glyphicon-ok"></span>');
                $('#modal-userGroup-list').find('input:radio').prop('checked', '');
            });

            $('#modal-userGroup-list').delegate('input:radio', 'click', function() {
                $('#new-userGroup-input').val('');
                $('#new-choose-btn').attr('data-val', '0').html('创建新分组');
                $('#tips-choose-userGroup').modal('show');
            });

            // 已确定选择相应讨论组
            $userGroupChooseBtn.unbind().click(function() {
                var radioVal = $('#modal-userGroup-list input:radio[name="group-choose"]:checked').val();
                var newGroupVal = $('#new-choose-btn').attr('data-val');
                // new 为添加新讨论组   join为加入该讨论组
                var tag = (newGroupVal == 1 ? 'new' : 'join');
                if (!radioVal && newGroupVal == 0) {
                    return;
                }

                if (!theUID) {
                    return;
                }
                
                $.ajax({
                    type: 'post',
                    url: 'http://closer-chat.coding.io/joinUserGroup',
                    data: {
                        theUID: theUID,
                        tag: tag,
                        ugId: radioVal,
                        ugName: $('#new-userGroup-input').val()
                    },
                    success: function(data) {
                        if (data.status == 1) {
                            getMyFriends();
                            cb && cb();
                            // 更新当前popover按钮状态
                            if ($that) {
                                $that && $that.addClass('hide').closest('p').next().children('button').removeClass('hide');
                                // 更新popover触发元素的content值
                                var $popoverParent = $that.closest('.popover').prev();
                                var regBE = /(\{be\s)(.*?)(\seb\})/;
                                var regIS = /(\{is\s)(.*?)(\ssi\})/;
                                var newPopoverContent = $popoverParent.attr('data-content').replace(regIS, '$1$3').replace(regBE, '$1hide$3');
                                $popoverParent.attr('data-content', newPopoverContent);
                                $that.addClass('hide').closest('div').find('a').attr('data-isFriends', '1');
                            }
                            
                            changeFriendsState($('#room-list-wrap'), theUID, '1');
                            changeFriendsState($('#room-search-wrap'), theUID, '1');
                            changeFriendsState($('#chat-content-chats'), theUID, '1');
                            changeFriendsState($('#room-info'), theUID, '1');
                            changeFriendsState($('#chat-content-userList'), theUID, '1');
                        } else {

                        }
                    },
                    error: function(e) {
                        console.log(e);
                        console.log(e.textStatus);
                    }
                });
            });
        }


        // 建立私聊模式 判断是否需要先创建一条消息记录
        function createChatP(theUID, cb) {
            if (!theUID) {
                return;
            }
            
            $.ajax({
                type: 'post',
                url: 'http://closer-chat.coding.io/createChatP',
                data: {
                    theUID: theUID,
                    newDate: Util.formatDate(new Date(), 'yyyy/mm/dd hh:ii:ss')
                },
                success: function(data) {
                    cb(data);
                },
                error: function(e) {
                    console.log(e);
                    console.log(e.textStatus);
                }
            });
        }