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
        url: '/checkIsLogin',
        success: function(data) {
            // 已登录
            if (data.status == 1) {
                uId = data.uId;
                uNickName = data.uNickName; 
                cb(uId, uNickName);
            } else {
                console.log('未登录');
            }
        },
        error: function(e){
            console.log(e);
            console.log(e.textStatus);
        }
    });
}

// 将自己的信息传至服务器分发至用户面板
function sendMyInfo(socket) {
    $.ajax({
        type: 'get',
        url: '/getMyInfo',
        success: function(data) {
            socket.emit('sendMyInfo', data, 'chat');
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

                // 光标移动到下一行
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
            $('#chat-form-pic').attr('action', '/sendFormPic').submit();    
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
            
            socket.emit('sendMsg', data, 'chat', Util.formatDate(new Date(), 'yyyy/mm/dd hh:ii:ss'));
        }

    });
}

var socket = io();

// 用户登录才算进入房间
checkIsLogin(function(uId, uNickName) {

    var $editBoxEdit = $('#chat-content-editbox-edit');
    var $editBoxSend = $('#chat-content-send').find('button').eq(0);
    var $chatContent = $('#chat-content-chats-list');

    socket.on('connect', function() {
        // 加入房间
        
        socket.emit('join', uId, uNickName, 'chat');

        // 将自己的信息传至服务器分发至其他用户
        if (uId !== -1) {
            sendMyInfo(socket);
        }
        
    });
    
    // 编辑框发送消息设置
    sendMsg(socket, $editBoxEdit, $editBoxSend);

    // 收到消息并添加至消息框
    socket.on('msg', function(user, chat, Mode) {
        if (Mode !== 'chat') {
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
                return '<img src="/img/emotion/' + $1 + '/' + $2 + '">';
            });
            // 转换图片
            return msg.replace(/#pic{(.*?)}/g, function($, $1) {
                return '<img src="/img/chat/' + $1 + '" width="150px" height="150px">';
            });
        }

        
    });

});
