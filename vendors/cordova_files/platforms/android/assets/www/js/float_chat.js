
// 聊天浮窗事件绑定
function floatChatbindEvent() {
    // 点击关闭按钮时关闭聊天浮窗
    $('#chat-closeBtn').click(function() {
        // 删除本地储存  讨论组用户及数量
        $('#chat-left-menu').find('li').each(function() {
            var $that = $(this);
            try {
                window.localStorage.removeItem($that.attr('data-val'));
                window.localStorage.removeItem($that.attr('data-val') + '_num');
            } catch (e) {

            }
        });

        
        $('#chat-left-menu').find('ul').empty();
        $('#chat-right-content').empty();
        $('#chat-wrapper').hide();
    });
    
    $('[data-toggle="tooltip"]').tooltip();

    // 监听title拖动浮窗事件
    Util.bindObjMove(document.getElementById('chat-content-title-cover'), document.getElementById('chat-wrapper'));

    // 小屏幕上点击显示左侧菜单
    $('#menu-list-btn').click(function() {
        if ($('#chat-left-menu').css('visibility') === 'hidden') {
            $('#chat-left-menu').css('visibility', 'visible');
        } else {
            $('#chat-left-menu').css('visibility', 'hidden');
        }
    });

    

    // 左侧菜单事件
    $('#chat-left-menu').find('ul').delegate('li', 'mouseover', function() {
        $(this).find('span').eq(2).show();
        $(this).find('span').eq(1).hide();
    });
    $('#chat-left-menu').find('ul').delegate('li', 'mouseout', function() {
        $(this).find('span').eq(2).hide();

        var $number = $(this).find('span').eq(1); 
        $number.text() !== '0' && $number.show();
    });

    // 左侧列表菜单项点击
    $('#chat-left-menu').find('ul').delegate('li', 'click', function(e) {
    
        var $that = $(this);
        e = e || window.event;
        var node = e.target || e.srcElement;        

        // 判断是否为点击关闭
        if (node.getAttribute('data-act') === 'close') {
            // 移除右侧内容
            var cBelongToIDArr = [$that.attr('data-val')];
            if ($that.attr('data-val').indexOf('_') !== $that.attr('data-val').lastIndexOf('_')) {
                var temp = $that.attr('data-val').split('_');
                cBelongToIDArr.push([temp[0], temp[2], temp[1]].join('_'));
            }
            
            $('#chat-right-content').find('iframe').each(function() {
                if (cBelongToIDArr.indexOf($(this).attr('data-val')) !== -1) {
                    $(this).remove();
                    return false;
                }
            });
            
            try {
                window.localStorage.removeItem($that.attr('data-val'));
                window.localStorage.removeItem($that.attr('data-val') + '_num');
            } catch (e) {

            }

            // 判断此close项是否为当前active项
            var isMatch = false;
            if ($(node.parentNode).hasClass('chat-item-active')) {
                isMatch = true;
            }           

            // 关闭当前active项  active转为下一项/上一项/关闭聊天浮窗
            if (isMatch) {
                var $next = $that.next();
                var $prev = $that.prev();               

                if ($next.length) {
                    $next.click();
                } else if ($prev.length) {
                    $prev.click();
                } else {
                    $('#chat-closeBtn').click();
                }               
            }

            // 移除左侧菜单
            $that.remove();

            if ($('#chat-left-menu').find('li').length < 2) {
                $('#chat-left-menu').hide();
                $('#chat-wrapper').css({
                    'width': 'auto',
                    'left': '50%',
                    'marginLeft': '-310px'
                });
                $('#chat-content-title-cover').css('left', '3px');
                $('#chat-content-title-cover').children('img').show();
                $('#chat-right-content').css('borderLeft', '3px solid rgba(80, 168, 187, 0.5)');
            } else {
                $('#chat-left-menu').show();
                $('#chat-wrapper').css({
                    'width': '800px',
                    'left': '50%',
                    'marginLeft': '-400px'
                });
                $('#chat-content-title-cover').css('left', '182px');
                $('#chat-content-title-cover').children('img').hide();
                $('#chat-right-content').css('borderLeft', 'none');
            }
        } 
        else {
            $that.addClass('chat-item-active').siblings().removeClass('chat-item-active');      

            // 消息数变成0
            $(this).find('span').eq(1).text('0').hide();
            // 渲染title项
            var $span0 = $(this).find('span').eq(0);
            var aHtml = '';
            var objId = $span0.attr('data-id'); // 用户id
            var id = $(this).attr('data-val'); // 会话id
            
            $('#chat-title').text($span0.attr('title'));
            $('#chat-title-signature').text($span0.attr('data-title-sub'));
            $('#chat-content-title-cover').children('img').attr('src', $(this).children('img').attr('src'));

            // 聊天浮窗上 退出讨论组/添加好友/删除好友  操作
            if ($span0.attr('data-type') === 'chatP') {

                $('#chat-title').attr('href', 'http://closer-chat.coding.io/user?id=' + objId).attr('target', '_blank');

                if ($span0.attr('data-isFriends') == '1') {
                    aHtml = '<a href="javascript:void(0);" class="text-warning" data-act="0"  data-val="' + id + '" data-id="' + objId + '" data-type="chatP" data-toggle="tooltip" data-title="删除好友">&nbsp;<span class="glyphicon glyphicon-remove"></span>&nbsp;</a>';
                } else {
                    aHtml = '<a href="javascript:void(0);" class="text-primary" data-act="1"  data-val="' + id + '" data-id="' + objId + '" data-type="chatP" data-toggle="tooltip" data-title="TA还不是你好友哦，点击添加好友">&nbsp;<span class="glyphicon glyphicon-plus"></span>&nbsp;</a>';
                }

            } else {
                $('#chat-title').attr('target', '_self').attr('href', 'javascript:void(0);');
                aHtml = '<a href="javascript:void(0);" class="text-warning" data-val="' + id + '" data-id="' + objId + '" data-type="chat" data-toggle="tooltip" data-title="退出讨论组">&nbsp;<span class="glyphicon glyphicon-log-out"></span>&nbsp;</a>';
            }

            $('#chat-title-sub').children('a').prop('outerHTML', aHtml);
            $('#chat-title-sub').children('a').tooltip();

            // 右侧讨论组用户列表  更新/不显示操作  从storage获取相应讨论组成员信息
            var t = setInterval(function() {

                if (/chat_\d+$/.test(id)) {
                    try {
                        $('#userList').find('ul').html($(window.localStorage.getItem(id)));
                        $('#userList').find('span').eq(0).text(window.localStorage.getItem(id + '_num'));
                        $('#chat-content-userList-chat').removeClass('hide');

                    } catch (e) {
                        console.log(e);
                    }
                } else {
                    $('#chat-content-userList-chat').addClass('hide');
                    clearInterval(t);
                }

                if (window.localStorage.getItem(id) != null) {
                    clearInterval(t);
                }

            }, 5);

            // 显示右侧相应内容
            var cBelongToIDArr = [$that.attr('data-val')];
            if ($that.attr('data-val').indexOf('_') !== $that.attr('data-val').lastIndexOf('_')) {
                var temp = $that.attr('data-val').split('_');
                cBelongToIDArr.push([temp[0], temp[2], temp[1]].join('_'));
            }

            $('#chat-right-content').find('iframe').each(function() {
                if (cBelongToIDArr.indexOf($(this).attr('data-val')) !== -1) {
                    $(this).show().siblings().hide();
                    return false;
                }
            });
        }
    });

    // 右侧用户列表点击  用于讨论组中
    $('#userList').delegate('li', 'click', function() {
        var $that = $(this);
        if ($that.attr('data-isSelf') == '1') {
            return;
        }

        // 添加至左侧菜单项  生成新会话窗口
        floatChatHandle(
            $that.attr('data-type'),
            $that.attr('data-id'),
            $that.attr('data-isFriends'),
            $that.attr('data-tag'),
            $that.attr('data-val'),
            $that.attr('data-img'),
            $that.attr('data-name'),
            $that.attr('data-signature'),
            $that.attr('data-number')
            );
    });
}

// 聊天浮窗
/**
 * [floatChatHandle description]
 * @param  {[type]} type      [类型：讨论组chat或私聊chatP]
 * @param  {[type]} objId     [id: 讨论组的id或私聊对方的id]
 * @param  {[type]} isFriends [用于判断用户是否为自己好友]
 * @param  {[type]} tag       [标签：新增的会话或者实时监听时更改消息数量的添加change操作]
 * @param  {[type]} id        [id: 讨论组或私聊的会话id]
 * @param  {[type]} img       [讨论组logo或私聊对方的头像]
 * @param  {[type]} name      [讨论组名称或私聊对方的昵称]
 * @param  {[type]} signature [讨论组创建时间或私聊对方的签名]
 * @param  {[type]} number    [该会话当前未读信息数量  默认不显示]
 * @return {[type]}           [description]
 */
function floatChatHandle(type, objId, isFriends, tag, id, img, name, signature, number) {
    var $leftMenu = $('#chat-left-menu').find('ul');
    var $rightContent = $('#chat-right-content');

    var numberIsShow = (number ? '' : 'hide');
    
    if (type === 'chat') {
        signature = signature ? '创建于 ' + signature : '一个隐秘组织';
    } else if (type === 'chatP') {
        signature = signature ? signature : '这个人很懒，还没有签名';
    }
    
    // 新产生的iframe
    if (tag === 'new') {
        // 首先判断浮窗中是否已经有这个会话  如果有 无需再添加
        var $item;
        var idArr = [id];
        if (id.indexOf('_') !== id.lastIndexOf('_')) {
            var temp = id.split('_');
            idArr.push([temp[0], temp[2], temp[1]].join('_'));
        }
        $leftMenu.find('li').each(function() {
            if (idArr.indexOf($(this).attr('data-val')) !== -1) {
                $item = $(this);
                return false;
            }
        });

        if (!$item) {
            $leftMenu.append(['<li class="chat-item-active" data-val="' + id + '">',
                            '<img src="' + img + '" alt="chat" width="30px" height="30px">&nbsp;',
                            '<span class="chat-item-nickname" title="' + name + '" data-isFriends="' + isFriends + '" data-id="' + objId + '" data-type="' + type + '" data-title-sub="' + signature + '">' + name + '</span>',
                            '<span class="chat-item-info-num badge">' + number+ '</span>',
                            '<span data-act="close" class="chat-item-close">&times;</span>',
                    '</li>'].join(''));

            // 在聊天浮窗中添加其会话iframe 
            $('#chat-right-content').append('<iframe data-val="' + id + '" id="chat-content-frame-' + id + '" src="http://closer-chat.coding.io/' + type + '?id=' + id.slice(5) + '" frameborder="0"></iframe>');
        }

        // 相应的li菜单点击
        $item = $item ? $item : $leftMenu.find('li').last();
        $item.click();

        if ($leftMenu.find('li').length < 2) {
            $('#chat-left-menu').hide();
            $('#chat-wrapper').css({
                'width': 'auto',
                'left': '50%',
                'marginLeft': '-310px'
            });
            $('#chat-content-title-cover').css('left', '3px');
            $('#chat-content-title-cover').children('img').show();
            $('#chat-right-content').css('borderLeft', '3px solid rgba(80, 168, 187, 0.5)');
        } else {
            $('#chat-left-menu').show();
            $('#chat-wrapper').css({
                'width': '800px',
                'left': '50%',
                'marginLeft': '-400px'
            });
            $('#chat-content-title-cover').css('left', '182px');
            $('#chat-content-title-cover').children('img').hide();
            $('#chat-right-content').css('borderLeft', 'none');
        }
    }
    // 更新操作  如更新消息数量
    else if (tag === 'change') {
        var idArr = [id];
        if (id.indexOf('_') !== id.lastIndexOf('_')) {
            var temp = id.split('_');
            idArr.push([temp[0], temp[2], temp[1]].join('_'));
        }

        $leftMenu.find('li').each(function() {
            if (idArr.indexOf($(this).attr('data-val')) !== -1) {
                $(this).find('span').eq(1).text(number);
                return false;
            }
        });
    }

    // 小屏幕上更新聊天浮窗位置
    if ($(window).width() < 768) {
        var scrollPos = Util.getScrollPosition();
        var chatWrapper = document.getElementById('chat-wrapper');
        chatWrapper.style.setProperty('margin-top', scrollPos[1] + 'px', 'important');
        chatWrapper.style.setProperty('margin-left', $(window).width() * (-0.47) + scrollPos[0] + 'px', 'important');
    }
    
}