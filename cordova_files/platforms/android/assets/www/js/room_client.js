var uId = -1;
var uNickName = '';

var FormPicIsOk = false;

// 防止表单跳转 编辑框的图片
function sendFormPic() {
    $('#chat-form-pic').ajaxSubmit({
        success: function(data) {
            FormPicIsOk = true;
        }
    });
    return false;
}


// 进入房间 状态 先判断用户是否登录
function checkIsLogin(cb) {
    $.ajax({
        type: 'get',
        url: 'http://closer-chat.coding.io/checkIsLogin',
        success: function(data) {
            // 已登录
            if (data.status == 1) {
                uId = data.uId;
                uNickName = data.uNickName; 
            }

            cb(uId, uNickName);
        },
        error: function(e){
            console.log(e);
            console.log(e.textStatus);
        }
    });
}

// 将自己的信息传至服务器分发至用户面板
function sendMyInfo(socket) {
    var rId = Util.getArgValue('id');
    rId = parseInt(rId, 10);

    $.ajax({
        type: 'get',
        url: 'http://closer-chat.coding.io/getMyInfo/:rId=' + rId,
        success: function(data) {
            socket.emit('sendMyInfo', data, 'room');
        },
        error: function(e) {
            console.log(e);
            console.log(e.textStatus);
        }
    });
}

// 将编辑框中到消息发送出去
function sendMsg(socket, $editBoxEdit, $editBoxSend) {
    // Enter: 0 或 Ctrl+Enter: 1 快捷键发送
    $editBoxEdit.keydown(function(e) {
        e = e || window.event;

        if ($('#chat-content-send').find('ul').attr('data-val') == 1) {
            if (e.ctrlKey && e.keyCode == 13) {
                $editBoxSend.click();
            }
        } else {
            // ctrl+enter转为回车效果下一行
            if (e.ctrlKey && e.keyCode == 13) {
                $editBoxEdit.html($editBoxEdit.html() + '<div><br></div>');

                var range;
                if (document.all) {
                    range = $editBoxEdit[0].createTextRange();
                } else {
                    range = document.createRange();
                }
                var selection = window.getSelection();

                range.setStart($editBoxEdit.children().last()[0], 0);
                range.setEnd($editBoxEdit.children().last()[0], 0);
                selection.removeAllRanges();
                selection.addRange(range);
            }
            // enter发送
            else if (e.keyCode == 13) {
                $editBoxSend.click();
            }
        }
    });

    $editBoxSend.click(function() {
        if ($editBoxEdit.html() === '') {
            return;
        }

        (function asyncInputPic() {
            // 首先同步预览图与input中的图  
            var pic = [];
    
            $editBoxEdit.find('img[data-index^="pic"]').each(function() {
                pic.push($(this).attr('data-index').slice(3));
            });
            
            if (!pic.length) {
                FormPicIsOk = true;
            }

            $('#form-pic-num').val(pic.length);
            $('#chat-form-pic').find('input[id^="chat-input-pic"]').each(function() {
                var picId = $(this).attr('id').slice(14);
    
                // 如果没有匹配到则 删除之
                if (pic.indexOf(picId) === -1) {
                    $('#chat-form-pic input').remove('[id="chat-input-pic' + picId + '"]');
                }
            });
            // 顺序化input框的name和id属性
            var index = 0;
            $('#chat-form-pic').find('input[id^="chat-input-pic"]').each(function() {
                $(this).attr('name', 'chat-input-pic' + index).attr('id', 'chat-input-pic' + index++);
            });
        })();
        
        (function uploadInputPic() {
            // 上传所提供的图片
            $('#chat-form-pic').attr('action', 'http://closer-chat.coding.io/sendFormPic').submit();    
        })();

        // 如果有图片上传，先等图片上传成功再转发信息
        var editBoxEditHTML = $editBoxEdit.html();
        var t = setInterval(function() {
            if (FormPicIsOk) {
                filterData(editBoxEditHTML);
                clearInterval(t);
            }
            
        }, 1);
            
        $editBoxEdit.html('');

        // 过滤数据  防止xss
        function filterData(data) {
            // 获取图片代号并换成相应占位符  data-picname为上传到图片附件特有
            data = data.replace(/(<img data-picname.*?>)/g, function(img) {
                return $(img).attr('data-picname');
            });

            // 获取图片代号并换成相应占位符  data-val为表情图标特有
            data = data.replace(/(<img.*?>)/g, function(img) {
                return $(img).attr('data-val');
            });
            // 将换行的<div>标签直接换成 <br>
            data = data.replace(/<div>(.*?)<\/div>/g, '#{br}$1');
            // 直接去掉其他<br>
            data = data.replace(/<br>/g, '');
            // 替换script等其他标签为实体符号
            data = data.replace(/['"<>\/\\\-\x00-\x09\x0b-\x0c\x1f\x80-\xff]/g, function(r){
                return '&#' + r.charCodeAt(0) + ';';
            }).replace(/ /g, '&nbsp;').replace(/\r\n/g, '<br />').replace(/\n/g,'<br />').replace(/\r/g,'<br />');

            socket.emit('sendMsg', data, 'room', Util.formatDate(new Date(), 'yyyy/mm/dd hh:ii:ss'));
        }

    });
}

var socket = io();

// 用户登录才算进入房间
checkIsLogin(function(uId, uNickName) {

    var $userListLiked = $('#userList-liked').find('ul');
    var $userListUnliked = $('#userList-unliked').find('ul');
    var $userListLikedNum = $('#userList-liked').find('span').eq(0);
    var $userListUnlikedNum = $('#userList-unliked').find('span').eq(0);

    var $editBoxEdit = $('#chat-content-editbox-edit');
    var $editBoxSend = $('#chat-content-send').find('button').eq(0);
    var $chatContent = $('#chat-content-chats-list');

    socket.on('connect', function() {
        // 加入房间
        
        socket.emit('join', uId, uNickName, 'room');

        // 将自己的信息传至服务器分发至其他用户
        if (uId !== -1) {
            sendMyInfo(socket);
        }
        
    });

    // 客户端获得用户信息，渲染至用户列表面板
    socket.on('userList', function(data, Mode) {
        if (Mode !== 'room') {
            return;
        }



        var liTemp = [];

        // 渲染当前会员数据
        for (var i = 0; i < data.likedInfo.length; i++) {
            // 根据用户是否在线选择是否禁用相应按钮
            var btnDisabled = (data.likedInfo[i].uLoginState === 'down' ? 'disabled' : '');
            var beFriends = '';
            var isFriends = 'hide';
            // 房主
            var userInfoPopoverContent = '<p class="user-login-state">当前：' + (data.likedInfo[i].uLoginState === 'down' ? '不' : '') + '在线</p>' +
                                        '<p>' +
                                            '<span style="background-position:0 ' + (data.likedInfo[i].uSex === 'girl' ? '-15' : '0') + 'px;" data-sex="' + data.likedInfo[i].uSex + '" class="popover-sex"></span>' +
                                            '<a href="http://closer-chat.coding.io/user?id=' + data.likedInfo[i].uId + '" data-isFriends="{F F}" style="word-break: break-all;">' + data.likedInfo[i].uNickName + '</a></p>' +
                                    '<p><button data-tag="private" type="button" class="btn btn-info btn-xs ' + btnDisabled + '"><span class="glyphicon glyphicon-earphone"></span> 私信给TA</button></p>' +
                                    '<p><button data-tag="friend" data-act="1" type="button" class="btn btn-primary btn-xs {be ' + beFriends + ' eb}"><span class="glyphicon glyphicon-plus"></span> 加为好友</button></p>' +
                                    '<p><button data-tag="friend" data-act="0" type="button" class="btn btn-warning btn-xs {is ' + isFriends + ' si}"><span class="glyphicon glyphicon-remove"></span> 删除好友</button></p>' +
                                    '<p><button data-tag="group" type="button" class="btn btn-info btn-xs ' + btnDisabled + '"><span class="glyphicon glyphicon-earphone"></span> 讨论组</button></p>';
                userInfoPopoverContent = userInfoPopoverContent.replace(/\"/g, '&quot;');

            liTemp.push('<li data-uId="' + data.likedInfo[i].uId + '" class="data-toggle" data-toggle="popover" data-content="' + userInfoPopoverContent + '">' +
                            '<img src="http://closer-chat.coding.io' + data.likedInfo[i].uImage + '" alt="头像" width="15px" height="15px">&nbsp;' +
                            '<span class="">' + data.likedInfo[i].uNickName + '</span>' +
                        '</li>');
        }

        $userListLiked.html(liTemp.join(''));

        checkIsFriends($('#userList-liked').find('ul'), 'li');

        liTemp = [];
        // 渲染当前游客数据
        for (var i = 0; i < data.unlikedInfo.length; i++) {
            // 根据用户是否在线选择是否禁用相应按钮
            var btnDisabled = (data.unlikedInfo[i].uLoginState === 'down' ? 'disabled' : '');
            var beFriends = '';
            var isFriends = 'hide';
            // 房主
            var userInfoPopoverContent = '<p class="user-login-state">当前：' + (data.unlikedInfo[i].uLoginState === 'down' ? '不' : '') + '在线</p>' +
                                        '<p>' +
                                            '<span style="background-position:0 ' + (data.unlikedInfo[i].uSex === 'girl' ? '-15' : '0') + 'px;" data-sex="' + data.unlikedInfo[i].uSex + '" class="popover-sex"></span>' +
                                            '<a href="http://closer-chat.coding.io/user?id=' + data.unlikedInfo[i].uId + '" data-isFriends="{F F}" style="word-break: break-all;">' + data.unlikedInfo[i].uNickName + '</a></p>' +
                                    '<p><button data-tag="private" type="button" class="btn btn-info btn-xs ' + btnDisabled + '"><span class="glyphicon glyphicon-earphone"></span> 私信给TA</button></p>' +
                                    '<p><button data-tag="friend" data-act="1" type="button" class="btn btn-primary btn-xs {be ' + beFriends + ' eb}"><span class="glyphicon glyphicon-plus"></span> 加为好友</button></p>' +
                                    '<p><button data-tag="friend" data-act="0" type="button" class="btn btn-warning btn-xs {is ' + isFriends + ' si}"><span class="glyphicon glyphicon-remove"></span> 删除好友</button></p>' +
                                    '<p><button data-tag="group" type="button" class="btn btn-info btn-xs ' + btnDisabled + '"><span class="glyphicon glyphicon-earphone"></span> 讨论组</button></p>';
                userInfoPopoverContent = userInfoPopoverContent.replace(/\"/g, '&quot;');
                
            liTemp.push('<li data-uId="' + data.unlikedInfo[i].uId + '" class="data-toggle" data-toggle="popover" data-content="' + userInfoPopoverContent + '">' +
                            '<img src="http://closer-chat.coding.io' + data.unlikedInfo[i].uImage + '" alt="头像" width="15px" height="15px">&nbsp;' +
                            '<span class="">' + data.unlikedInfo[i].uNickName + '</span>' +
                        '</li>');
        }

        $userListUnliked.html(liTemp.join(''));

        checkIsFriends($('#userList-unliked').find('ul'), 'li');
        // popover 框初始化
        $('#chat-content-userList li').popover({
            trigger: 'click',
            html: true,
            title: 'TA的资料',
            placement: 'left'
        }); 

        // 当前在线会员&游客数量
        $userListLikedNum.text($userListLiked.find('li').length);
        $userListUnlikedNum.text($userListUnliked.find('li').length);
        $('#room-info-content').find('p').eq(8).find('span').text(parseInt($userListLikedNum.text()) + parseInt($userListUnlikedNum.text()));

        // 当点击某个用户li标签时，添加active状态
        $('#chat-content-userList').click(function(e) {
            e = e || window.event;
            var node = e.target || e.srcElement;

            while (node && node.tagName !== 'LI') {
                node = node.parentNode;
            }

            $(this).find('li').removeClass('chat-content-userList-acitve');
            $(node).addClass('chat-content-userList-acitve');
        });

        
    });
    
    // 编辑框发送消息设置
    sendMsg(socket, $editBoxEdit, $editBoxSend);

    // 收到消息并添加至消息框
    socket.on('msg', function(user, chat, Mode) {
        if (Mode !== 'room') {
            return;
        }

        chat.cDetail = rebuildMsg(chat.cDetail);
        appendToChatList(user, chat);

        // 根据消息到占位符重新生成html代码
        function rebuildMsg(msg) {
            // 转换 #{br} --> <br>
            msg = msg.replace(/#{br}/g, '<br>');
            // 转换表情图片
            msg = msg.replace(/#(tb|qq|wx|tu){(.*?)}/g, function($, $1, $2) {
                return '<img src="img/emotion/' + $1 + '/' + $2 + '">';
            });
            // 转换图片
            return msg.replace(/#pic{(.*?)}/g, function($, $1) {
                return '<img src="img/chat/' + $1 + '" width="150px" height="150px">';
            });
        }

        
    });

    socket.on('sys', function(sysMsg, Mode) {
        if (Mode !== 'room') {
            return;
        }

        var $p = '<p class="text-center sys-msg">system: ' + sysMsg + '</p>';
        $chatContent.prepend($p);
        // 自动隐藏
        var $msg = $('.sys-msg');
        setTimeout(function() {
            $msg.hide();
        }, 1500);

    });
});
