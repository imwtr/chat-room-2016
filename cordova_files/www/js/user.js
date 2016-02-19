

// 获取用户信息
var uId = Util.getArgValue('id');
if (!uId) {
    window.location = 'http://closer-chat.coding.io/';
}

//  折叠用户信息菜单
var $userInfoWrapper = $('#chat-content-wrapper');
var $span0 = $userInfoWrapper.find('span').eq(0);
var $span1 = $userInfoWrapper.find('span').eq(1);
var $span2 = $userInfoWrapper.find('span').eq(2);
var $span3 = $userInfoWrapper.find('span').eq(3);

$span0.click(function() {
    $span0.addClass('hide').next().removeClass('hide');
    $span2.addClass('hide').next().removeClass('hide');
    $userInfoWrapper.find('.panel-body').hide();
});
// 展开用户信息菜单
$span1.click(function() {
    $span1.addClass('hide').prev().removeClass('hide');
    $span3.addClass('hide').prev().removeClass('hide');
    $userInfoWrapper.find('.panel-body').show();
});
//  折叠用户信息菜单
$span2.click(function() {
    $span2.addClass('hide').next().removeClass('hide');
    $span0.addClass('hide').next().removeClass('hide');
    $userInfoWrapper.find('.panel-body').hide();
});
// 展开用户信息菜单
$span3.click(function() {
    $span3.addClass('hide').prev().removeClass('hide');
    $span1.addClass('hide').prev().removeClass('hide');
    $userInfoWrapper.find('.panel-body').show();
});

$.ajax({
    type: 'get',
    url: 'http://closer-chat.coding.io/getUserInfo/:id=' + uId,
    success: function(data) {
        if (data.status == 1) {


            var $title = $('#userzone-menu').find('.panel-title');
            var $li1 = $('#userzone-menu').find('li').eq(1);
            var $li2 = $('#userzone-menu').find('li').eq(2).children('a');
            var $button1 = $('#menu-btn').find('button').eq(1);
            var $button2 = $('#menu-btn').find('button').eq(2);

            $('#img-info').attr('data-isSelf', data.user.isSelf);
            $('#img-change-btn').attr('data-isSelf', data.user.isSelf);
            $('#img-info').attr('src', 'http://closer-chat.coding.io' + data.user.uImage);
            $('#nickName-info').text(data.user.uNickName);
            $('#signature-info').text(data.user.uSignature);
            $('#sex-info').prop('outerHTML', 
                    '<span id="sex-info" style="background-position:0 ' + (data.user.uSex === 'girl' ? '-15' : '0') + 'px;" title="' + data.user.uSex + '"></span>');
            
            if (data.user.isSelf) {
                $('.glyphicon-pecil').show();
                $('#email-info').text(data.user.uEmail);
                $('#sex-' + data.user.uSex).prop('checked', true);
                
                $('.glyphicon-pencil').removeClass('hide');
                $('.glyphicon-envelope').removeClass('hide');
                $title.html('我的小屋 ');
                $li1.removeClass('hide');
                $li2.html('我的动态&raquo;');
                $button1.removeClass('hide');
                $button2.text('我的动态');

                if ($(window).width() <= 768) {
                    $('#img-change-btn').removeClass('hide');
                }

            } else {
                $('.glyphicon-pencil').remove();
                $('#user-set').remove();
                $('#email-info').text('不可见');
                $title.html('TA的小屋 ');
                $li1.remove();
                $li2.html('TA的动态&raquo;');
                $button1.remove();
                $button2.text('TA的动态');
            }
            $title.append('<span class="glyphicon glyphicon-chevron-down" title="点击收起"></span><span class="glyphicon glyphicon-chevron-right hide" title="点击展开"></span>');
            if (!data.user.uNickName) {
                 $('#chat-content-wrapper').find('.panel-body').text('没有这号人物哦~');
            }

            //  折叠用户信息菜单
            $('#userzone-menu').find('span').eq(0).click(function() {
                $(this).addClass('hide').next().removeClass('hide');
                $('#userzone-menu').find('.panel-body').hide();
            });
            // 展开用户信息菜单
            $('#userzone-menu').find('span').eq(1).click(function() {
                $(this).addClass('hide').prev().removeClass('hide');
                $('#userzone-menu').find('.panel-body').show();
            });
        } else {
            console.log('未知错误');
        }
        
    },
    error: function(e) {
        console.log(e);
        console.log(e.textStatus);
    }
});


// 监听用户信息列表事件
$('#userzone-menu').click(function(e) {
    e = e || window.event;
    var node = e.target || e.srcElement;
    if (node && node.tagName !== 'LI') {
        node = node.parentNode;
    }
    if (node && node.tagName !== 'LI') {
        return;
    }

    $(node).addClass('active').siblings().removeClass('active');
    $('#menu-btn').find('button[data-index="' + $(node).attr('data-index') + '"]').click();
});

// 监听用户信息列表事件
$('#menu-btn').find('button').click(function(e) {
    var index = $(this).attr('data-index');
    $('#userzone-menu').find('li[data-index="' + index + '"]').addClass('active').siblings().removeClass('active');
    $(this).siblings().removeClass('btn-info').addClass('btn-default');
    $(this).removeClass('btn-default').addClass('btn-info');

    switch (index) {
        case '1':
            $('#user-info').show();
            $('#user-set').hide();
            $('#user-msg').hide();
            break;
        case '2':
            $('#user-info').hide();
            $('#user-set').show();
            $('#user-msg').hide();
            break;
        case '3':
            $('#user-info').hide();
            $('#user-set').hide();
            $('#user-msg').show();
            break;
        default: 
            $('#user-info').show();
            $('#user-set').hide();
            $('#user-msg').hide();
    }

});

// 判断是否为从外部进入个人设置区
(function() {
    var index = window.location.href.lastIndexOf('#');
    if (index !== -1) {
        if (window.location.href.slice(index + 1) === 'user-set') {
            $('#panel-set-btn').click();
            $('#userzone-menu').find('li').eq(1).click();
        }
    }
})();


// 更换头像
$('#img-info').mouseover(function() {
    if ($(this).attr('data-isSelf') != '1') {
        return;
    }
    $('#img-change-btn').removeClass('hide');
}).mouseout(function() {
    $('#img-change-btn').addClass('hide');
});

$('#img-change-btn').mouseover(function() {
    if ($(this).attr('data-isSelf') != '1') {
        return;
    }
    $(this).removeClass('hide')
}).click(function() {
    alert('Sorry.Image upload is not supported in android platform yet.');
    return;
    if ($(this).attr('data-isSelf') != '1') {
        return;
    }
    $('#img-change-input').click();
});

function showTip(type, tip, isPwd) {
    var tipClass = isPwd ? 'user-set-tip' : 'user-info-tip';
    var tipHTML = '<p class="alert alert-' + type + ' ' + tipClass + '">' + tip + '<span data-dismiss="alert">&times;</span></p>';
    var $tip = $('.' + tipClass);
    
    if (!$tip.length) {
        if (isPwd) {
            $('#user-set').prepend(tipHTML);
        } else {
            $('#user-info').prepend(tipHTML);
        }
        
    } else {
        $tip.prop('outerHTML', tipHTML);
    }
}

// 预览头像
$('#img-change-input').change(function() {
    var uImage = $('#img-change-input').val();
    var ext = uImage.substring(uImage.lastIndexOf('.') + 1, uImage.length).toLowerCase();
    if (ext !== 'jpg' && ext !== 'jpeg' && ext !== 'png') {
        showTip('warning', '只支持后缀 .jpg/.jpeg/.png 格式的图片');
        return;
    }   
    
    var changeInput = document.getElementById('img-change-input');
    var changeInputPreview = document.getElementById('img-change-preview');
    var imgSrc = '';

    if (changeInput.files && changeInput.files[0]) {
        changeInputPreview.src = window.URL.createObjectURL(changeInput.files[0]);
    } else {
        alert('抱歉，您当前的浏览器类型/版本 不支持使用此功能，请更换高级浏览器访问');
        return false;
        // changeInput.select();
        // changeInput.blur();
        // imgSrc = document.selection.createRange().text;
        // imgSrc = imgSrc ? imgSrc : 'img/preview.png';
        // if (imgSrc != '') {
        //     changeInputPreview.style.filter = 'progid:DXImageTransform.Microsoft.AlphaImageLoader(sizingMethod=scale,src=' + imgSrc + ')';
        //     document.selection.empty();
        // } else {

        // }
        
    }

    $('#img-change-wrap').show();
});

// 提交更新头像操作
$('#img-change-ok').click(function() {
    var uImage = $('#img-change-input').val();

    if (!uImage) {
        return;
    }

    $('#changeImg-form').attr('action','http://closer-chat.coding.io/userChangeImage').submit();
});


// 创建更新头像提交 防止提交后跳转
function changeImage() {
    $('#changeImg-form').ajaxSubmit({
        success: function() {
            showTip('info', '更改成功');

            var f = $('#img-change-input')[0].files[0];
            $('#img-info').attr('src', window.URL.createObjectURL(f));
            $('#userInfo').find('img').attr('src', window.URL.createObjectURL(f));

            $('#img-change-wrap').hide();
        }
    });
    return false;
}

// 修改资料事件绑定
// 相应部分可编辑
$('#user-info').delegate('.glyphicon-pencil', 'click', function() {
    switch ($(this.parentNode).attr('id')) {
        case 'nickname-wrap':
            $('#nickName-info').prop('outerHTML', '<input type="text" id="nickName-info" value="' + $('#nickName-info').text() + '">');
            break;
        case 'sex-wrap':
            $("#sex-info").hide();
            $('#sex-radio-wrap').removeClass('hide');
            break;
        case 'signature-wrap':
            $('#signature-info').prop('outerHTML', '<input type="text" id="signature-info" value="' + $('#signature-info').text() + '">');
            break;
        default:
    }

    $(this).prop('outerHTML', '<span class="glyphicon glyphicon-ok"></span>');
});

// 检测昵称是否可用
function checkNickNameAndUpdate($that) {
    var val = $('#nickName-info').val();

    if (!val) {
        showTip('warning', '昵称不可为空');
        return;
    }

    // 检测是否已存在
    $.ajax({
        type: 'post',
        url: 'http://closer-chat.coding.io/checkNickNameInfo',
        data: {
            uNickName: val
        },
        success: function(data) {
            if (data.status == 0) {
                showTip('warning', '这个昵称已经有人使用啦');
            } else {
                $('.user-info-tip').hide();
                nickNameUpdate();
            }
        },
        error: function(e) {
            console.log(e);
            console.log(e.textStatus);
        }
    });

    // 更新昵称
    function nickNameUpdate() {
        $.ajax({
            type: 'post',
            url: 'http://closer-chat.coding.io/nickNameUpdate',
            data: {
                uNickName: dataFilter(val)
            },
            success: function(data) {
                if (data.status == 0) {
                    showTip('warning', '未知错误，请稍后再试');
                } else {
                    $('#userInfo').find('a').eq(1).html('&nbsp;' + $('#nickName-info').val() + '<span class="caret"></span>');
                    $('#nickName-info').prop('outerHTML', '<span id="nickName-info">' + $('#nickName-info').val() + '</span>');
                    $that.prop('outerHTML', '<span class="glyphicon glyphicon-pencil"></span>');
                }
            },
            error: function(e) {
                console.log(e);
                console.log(e.textStatus);
            }
        });
    }
}

// 更新性别
function sexUpdate($that) {
    var sex = $('[name="sex-info"]:checked').val();
    
    $.ajax({
        type: 'post',
        url: 'http://closer-chat.coding.io/sexUpdate',
        data: {
            uSex: sex
        },
        success: function(data) {
            if (data.status == 0) {
                showTip('warning', '未知错误，请稍后再试');
            } else {
                $('#sex-' + sex).prop('checked', true);
                $('#sex-info').prop('outerHTML', 
                    '<span id="sex-info" style="background-position:0 ' + (sex === 'girl' ? '-15' : '0') + 'px;" title="' + sex + '"></span>');
                $('#sex-radio-wrap').addClass('hide');
                $that.prop('outerHTML', '<span class="glyphicon glyphicon-pencil"></span>');
            }
        },
        error: function(e) {
            console.log(e);
            console.log(e.textStatus);
        }
    });
}

// 更新签名
function signatureUpdate($that) {
    var val = $('#signature-info').val();
    if (!val) {
        showTip('warning', '签名不可为空');
        return;
    }

    $.ajax({
        type: 'post',
        url: 'http://closer-chat.coding.io/signatureUpdate',
        data: {
            uSignature: dataFilter(val)
        },
        success: function(data) {
            if (data.status == 0) {
                showTip('warning', '未知错误，请稍后再试');
            } else {
                $('.user-info-tip').hide();
                $('#signature-info').prop('outerHTML', '<span id="signature-info">' + $('#signature-info').val() + '</span>');
                $that.prop('outerHTML', '<span class="glyphicon glyphicon-pencil"></span>');
            }
        },
        error: function(e) {
            console.log(e);
            console.log(e.textStatus);
        }
    });
}   


$('#nickName-info').blur(function() {
    checkNickNameAndUpdate($('#nickname-wrap'));
});

// 确认修改
$('#user-info').delegate('.glyphicon-ok', 'click', function() {
    switch ($(this.parentNode).attr('id')) {
        case 'nickname-wrap':
            checkNickNameAndUpdate($(this));
            break;
        case 'sex-wrap':
            $('#sex-radio-wrap').removeClass('hide');
            sexUpdate($(this));
            break;
        case 'signature-wrap':
            signatureUpdate($(this));
            break;
        default:
    }
});


// 判断原密码是否正确
var lastPwdIsOk = false;

function checkLastPwd(cb) {
    var val = $('#pwd-before').val();
    if (!val) {
        return;
    }

    $.ajax({
        type: 'post',
        url: 'http://closer-chat.coding.io/checkLastPwd',
        data: {
            uLastPwd: hex_md5(val)
        },
        success: function(data) {
            if (data.status == 0) {
                showTip('warning', '原密码不正确，请检查', true);
                $('#newPwd-btn').addClass('disabled');
            } else {
                lastPwdIsOk = true;
                $('.user-set-tip').hide();
                $('#newPwd-btn').removeClass('disabled');
                cb && cb();
            }
        },
        error: function(e) {
            console.log(e);
            console.log(e.textStatus);
        }
    });
}

// 判断原密码输入框值
$('#pwd-before').blur(function() {
    checkLastPwd();
});

$('#newPwd-btn').click(function() {
    if (!$('#pwd-new').val() || !$('#pwd-new1').val() || !$('#pwd-before').val()) {
        showTip('warning', '必填项不可留空', true);
        return;
    }
    
    if ($('#pwd-new').val() !== $('#pwd-new1').val()) {
        showTip('warning', '两次密码不一致', true);
        return;
    }


    if (!lastPwdIsOk) {
        // 再次判断，防止跳过式
        checkLastPwd(function() {
            updatePwd();
        });
    } else {
        updatePwd();
    }

    function updatePwd() {
        $.ajax({
            type: 'post',
            url: 'http://closer-chat.coding.io/updatePwd',
            data: {
                uNewPwd: hex_md5($('#pwd-new').val())
            },
            success: function(data) {
                if (data.status == 0) {
                    showTip('warning', '未知错误，请稍后再试', true);
                } else {
                    showTip('info', '密码已成功修改，请重新登录', true);
                    $('#newPwd-btn').addClass('disabled');
                    Util.setCookie('pwd', hex_md5($('#pwd-new').val()),  60 * 24 * 7);
                    setTimeout(function() {
                        window.location.reload();
                    }, 2000);
                }
            },
            error: function(e) {
                console.log(e);
                console.log(e.textStatus);
            }
        });
    }
});