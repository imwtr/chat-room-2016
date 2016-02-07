
function getSearchResult(tag, keyWord) {
    var $userSearchWrap = $('#user-search-wrap').find('.panel-body').children('ul');
    var $searchUserTemplate = $('#search-user-template');
    var $roomSearchWrap = $('#room-search-wrap').find('.panel-body');
    
    var users = [];
    var userSexY = 0;
    var userIsOnline;
    var isSelfHide = '';
    var delUHide = addUHide = 'hide';
    var liTemp = [];

    var rooms = [];
    var popoverIDContent;
    var btnDisabled;
    var beFriends;
    var isFriends;
    var isFriend;
    var isSelf;
    var popoverOwnerContent;
    var temp = ['<div class="row">'];

    var noResultStr = '<span class="text-muted">无相关结果~</span>';

    $.ajax({
        type: 'get',
        url: '/getSearchResult/:tag=' + tag + '/:w=' + keyWord,
        success: function(data) {
            users = data.users;
            rooms = data.rooms;
            
            // 渲染用户搜索结果
            for (var i = 0; i < users.length; i++) {
                // 有无签名判断
                if (!users[i].uSignature) {
                    users[i].uSignature = ' ';
                }
                // 上线状态判断
                if (users[i].uLoginState === 'up') {
                    userIsOnline = '';
                } else {
                    userIsOnline = '不';
                }               

                // 用户性别判断
                if (users[i].uSex === 'girl') {
                    userSexY = -15; // 坐标
                } else {
                    userSexY = 0;
                }
                

                isSelfHide = (users[i].uIsSelf ? 'hide' : '');
                addUHide = (users[i].uIsFriends ? 'hide' : '');
                delUHide = (users[i].uIsFriends ? '' : 'hide');

                users[i].userIsOnline = userIsOnline;
                users[i].userSexY = userSexY;
                users[i].isSelfHide = isSelfHide;
                users[i].addUHide = addUHide;
                users[i].delUHide = delUHide;

                liTemp.push(keyWordReplace($searchUserTemplate, users[i]));
            }

            $userSearchWrap.html(liTemp.length ? liTemp.join('') : noResultStr);


            // 渲染房间搜索结果
            for (var i = 0, j = rooms.length; i < j; i++) {     

                popoverIDContent = '<p style="font-weight:700;">所属：</p><p>' + rooms[i].aName + '</p>' +
                                    '<p style="font-weight:700;" class="hide">当前/总会员：</p><p class="hide">' + rooms[i].rCurCount + '/' + rooms[i].rTotalCount + '</p></p>' +
                                    '<p style="font-weight:700;" class="hide">最后活跃：</p><p class="hide">' + rooms[i].rLastTime + '</p>';
                    popoverIDContent = popoverIDContent.replace(/\"/g, '&quot;');   

                // 根据用户是否在线选择是否禁用相应按钮
                btnDisabled = (rooms[i].uLoginState === 'down' ? 'disabled' : '');
                // 判断该用户是否为好友
                beFriends = rooms[i].uIsFriends ? 'hide' : '';
                isFriends = rooms[i].uIsFriends ? '' : 'hide';
                isFriend = rooms[i].uIsFriends ? 1 : 0;
                isSelf = rooms[i].uIsSelf;
                // 房主
                popoverOwnerContent = '<p class="user-login-state">当前：' + (rooms[i].uLoginState === 'down' ? '不' : '') + '在线</p>' +
                                            '<p>' +
                                                '<span style="background-position:0 ' + (rooms[i].uSex === 'girl' ? '-15' : '0') + 'px;" data-sex="' + rooms[i].uSex + '" class="popover-sex"></span>' +
                                                '<a href="/user?id=' + rooms[i].rOwnerId + '" data-isFriends="{F' + isFriend + 'F}" style="word-break: break-all;">' + rooms[i].uNickName + '</a></p>' +
                                        '<p><button data-tag="private" type="button" class="btn btn-info btn-xs ' + btnDisabled + '"><span class="glyphicon glyphicon-earphone"></span> 私信给TA</button></p>' +
                                        '<p><button data-tag="friend" data-act="1" type="button" class="btn btn-primary btn-xs {be ' + beFriends + ' eb}"><span class="glyphicon glyphicon-plus"></span> 加为好友</button></p>' +
                                        '<p><button data-tag="friend" data-act="0" type="button" class="btn btn-warning btn-xs {is ' + isFriends + ' si}"><span class="glyphicon glyphicon-remove"></span> 删除好友</button></p>' +
                                        '<p><button data-tag="group" type="button" class="btn btn-info btn-xs ' + btnDisabled + '"><span class="glyphicon glyphicon-earphone"></span> 讨论组</button></p>';
                    popoverOwnerContent = popoverOwnerContent.replace(/\"/g, '&quot;');
                    // 如果是自己  则其他项无需显示
                    if (isSelf) {
                        popoverOwnerContent = '这是你自己';
                    }                   
            
                temp.push('<div class="col-sm-3 col-xs-4">' +
                                '<div class="text-center">' +
                                    '<h6 title="' + rooms[i].rName + '" class="room-name">' + rooms[i].rName + '</h6>' +
                                    '<a data-rId="' + rooms[i].rId + '" href="/room?id=' + rooms[i].rId + '" class="room-logo">' +
                                        '<img src="' + rooms[i].rImage + '" alt="room" width="100%" height="100%">' +
                                        '<p class="room-user-num-wrap">' +
                                            '<span class="hide">统计：</span>' +
                                            '<span class="room-user-num">' + rooms[i].rCurCount + '</span>人在线' +
                                        '</p>' +
                                    '</a>' +
                                    '<div class="caption room-info">' +
                                        '<p>房号: <span class="room-id" data-toggle="popover" data-content="' + popoverIDContent + '"><a href="/room?id=' + rooms[i].rId + '">' + rooms[i].rId + '</a></span></p>' +
                                        '<p class="room-name" data-uId="' + rooms[i].rOwnerId + '">房主:<span class="room-owner" data-toggle="popover" data-content="' + popoverOwnerContent + '"><a href="javascript:void(0);">' + rooms[i].uNickName + '</a></span></p>' +
                                    '</div>' +
                                '</div>' +
                            '</div>');
            }
            temp.push('</div>');
            $roomSearchWrap.html(temp.length > 2 ? temp.join('') : noResultStr);            

            // 调整房间logo大小   防止宽高不一致
            $(window).resize(function(){
                $('.room-logo').each(function() {
                    var width = $(this).width();
                    $(this).height(width * 0.8);
                });
            });
            $(window).resize();         

            // 信息弹出框提示配置
            $('.room-id').popover({
                trigger: 'hover',
                html: true,
                title: '房间信息',
                placement: 'top'
            });         

            $('.room-owner').popover({
                trigger: 'click',
                html: true,
                title: 'TA的资料',
                placement: 'bottom'
            });         

        },
        error: function(e) {
            console.log(e);
            console.log(e.textStatus);
        }
    })
}

$(function() {
     $('#friends-panel-wrap').load('/friends_panel', function() {
        $('#common-modal-wrap').load('/common_modal', function() {
            searchMenuHandle();

            var tag = Util.getArgValue('tag');
            var keyWord = Util.getArgValue('w');

            var tagCorr = {
                10: '不限',
                1: '房名',
                2: '房号',
                3: '昵称'
            };

            if (tagCorr[tag]) {
                $('#search-condition').html(tagCorr[tag] + '<span class="caret"></span>');
                $('#search-input').val(keyWord.replace(window.location.hash, ''));
            }

            if (tag !== null && keyWord !== null) {
                getSearchResult(tag, keyWord);
            }

            friendPanelHandle();
            floatChatbindEvent();
            joinGroupHandle();
            changeUserGroup();

            
            var $userSearch = $('#user-search-wrap');
            var $roomSearch = $('#room-search-wrap');
            //  折叠用户搜索列表
            $userSearch.find('span').eq(0).click(function() {
                $(this).addClass('hide').next().removeClass('hide');
                $userSearch.find('.panel-body').hide();
            });
            // 展开用户搜索列表
            $userSearch.find('span').eq(1).click(function() {
                $(this).addClass('hide').prev().removeClass('hide');
                $userSearch.find('.panel-body').show();
            });
            //  折叠房间搜索列表
            $roomSearch.find('span').eq(0).click(function() {
                $(this).addClass('hide').next().removeClass('hide');
                $roomSearch.find('.panel-body').hide();
            });
            // 展开房间搜索列表
            $roomSearch.find('span').eq(1).click(function() {
                $(this).addClass('hide').prev().removeClass('hide');
                $roomSearch.find('.panel-body').show();
            });

            // 调整房间logo大小   防止宽高不一致
            $(window).resize(function(){
                $('.room-logo').each(function() {
                    var width = $(this).width();
                    $(this).height(width * 0.8);
                });
            });
            $(window).resize();     
        });
    });
});
