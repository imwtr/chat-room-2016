function dataFilter(data) {
    if (!data) {
        return data;
    }

    return data.replace(/['"<>\/\\\-\x00-\x09\x0b-\x0c\x1f\x80-\xff]/g, function(r){
                return '&#' + r.charCodeAt(0) + ';';
            }).replace(/ /g, '&nbsp;').replace(/\r\n/g, '<br />').replace(/\n/g,'<br />').replace(/\r/g,'<br />');
}

$(function() {
    $('#registerlogin-modal-wrap').load('/login_register', function(response) {

        // 各模态框实现可拖动
        Util.bindObjMove($('#registerlogin-modal').find('.modal-header')[0], document.getElementById('registerlogin-modal'), 'modal');
        Util.bindObjMove($('#tips-div').find('.modal-header')[0], document.getElementById('tips-div'), 'modal');
        Util.bindObjMove($('#tips-delete-friend').find('.modal-header')[0], document.getElementById('tips-delete-friend'), 'modal');
        Util.bindObjMove($('#tips-choose-group').find('.modal-header')[0], document.getElementById('tips-choose-group'), 'modal');
        Util.bindObjMove($('#tips-choose-userGroup').find('.modal-header')[0], document.getElementById('tips-choose-userGroup'), 'modal');
        Util.bindObjMove($('#create-room-modal').find('.modal-header')[0], document.getElementById('create-room-modal'), 'modal');

        // 注册登录框 
        $('#modal-login-btn').click(function() {
            $('#backToLogin').click();
            $('#registerlogin-modal-alert').hide();
            $(this).addClass('btn-success');
            $('#modal-register-btn').removeClass('btn-success');
            $('#modal-register-div').hide();
            $('#modal-login-div').show();
        });
        $('#modal-register-btn').click(function() {
            $('#backToLogin').click();
            $('#registerlogin-modal-alert').hide();
            $('#registerlogin-modal-alert-success').hide();
            $(this).addClass('btn-success');
            $('#modal-login-btn').removeClass('btn-success');
            $('#modal-register-div').show();
            $('#modal-login-div').hide();
        });
        $('#loginState').find('a').eq(0).click(function() {
            $('#modal-login-btn').click();
        });
        $('#loginState').find('a').eq(1).click(function() {
            $('#modal-register-btn').click();
        });

        // 判断是否已经登录
        $.ajax({
            type: 'GET',
            url: '/checkLoginState',
            success: function(data) {
                if (data.status == 1) {
                    $('#loginState').hide();

                    // 渲染右上角用户信息栏
                    $('#userInfo').find('a').eq(0).attr('href', '/user?id=' + data.uId);
                    $('#userInfo').find('img').eq(0).attr('src', data.uImage);
                    $('#userInfo').find('a').eq(1).html('&nbsp;' + data.uNickName + '<span class="caret"></span>');
                    $('#userInfo').find('ul').eq(0).find('a').eq(0).attr('href', '/user?id=' + data.uId);
                    $('#userInfo').find('ul').eq(0).find('a').eq(2).attr('href', '/user?id=' + data.uId + '#user-set');

                    $('#userInfo').show();

                    $('#user-friends-panel-menu').find('li').last().attr('data-href', '/user?id=' + data.uId);

                    $('#c-room-ownerId').val(data.uId);

                    $('#create-room').removeClass('disabled');
                } else {
                    $('#loginState').show();
                    $('#userInfo').hide();
                    $('#create-room').addClass('disabled');
                }
                
                $('#my-friends').click();
            },
            error: function(e) {
                console.log(e);
                console.log(e.textStatus);
            }
        });

        // 显示发送验证码至邮箱框
        function emailCodeValidate() {
            var checkEmailCodeIsOk = false;

            $('#email-validate-btn').text('发送至邮箱验证').show().click(function() {
                var time = 121;
                var $that = $(this);

                // 将验证码操作转至后台 可作进一步验证
                $.ajax({
                    type: 'POST',
                    url: '/postEmailCode',
                    data: {
                        uEmail: $('#modal-register-user').val()
                    },
                    success: function(data) {
                        // 验证码发送至邮箱成功
                        if (data.status == 1) {
                            // 显示验证码输入框
                            $('#email-validate-div').show();

                            // 120s后可重新发送
                            $that.addClass('disabled');

                            $that.text((--time) + 's后可重新发送');
                            var t = setInterval(function() {
                                $that.text((--time) + 's后可重新发送');
                            }, 1000);

                            setTimeout(function() {
                                $that.text('发送至邮箱验证').removeClass('disabled');
                                clearInterval(t);
                            }, time * 1000);

                        } else {
                            $(this).text('出错啦，点击重试');
                        }
                    },
                    error: function(e) {
                        console.log(e);
                        console.log(e.textStatus);
                    }
                });

                
                $('#email-validate-input').blur(function() {
                    if ($(this).val() !== code) {
                        $('#email-validate-div').removeClass('has-success').addClass('has-error');
                        $('#email-validate-span').removeClass('glyphicon-ok').addClass('glyphicon-info-sign');
                    } else {
                        $('#email-validate-div').removeClass('has-error').addClass('has-success');
                        $('#email-validate-span').removeClass('glyphicon-info-sign').addClass('glyphicon-ok');
                        checkEmailCodeIsOk = true;
                    }
                });
            });

            return checkEmailCodeIsOk;
        }

        // 登录/注册
        // 首先获取本地用户cookie
        $('#modal-login-user').val(Util.getCookie('user'));
        $('#modal-login-user').focus();
        $('#modal-login-pwd').val(Util.getCookie('pwd'));
        $('#modal-login-remember')[0].checked = Util.getCookie('remember') == 1 ? true : false;

        // 是否启用邮箱验证码验证模式
        var needEmailCodeValidate = false;

        var emailReg = /^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/;
        var pwdReg = /.{5,32}/;

        var checkEmailIsOk = false;
        var checkNickNameIsOk = false;

        // 检测邮箱账号是否可用
        checkEmailValidate();
        function checkEmailValidate() {
            $('#modal-register-user').blur(function() {
                var val = $(this).val();

                if (!val) {
                    $('#registerlogin-modal-alert').text('必填项不能留空').show();
                    $('#registerlogin-modal-alert-success').hide();
                } else if (!emailReg.test(val)) {
                    $('#registerlogin-modal-alert').text('邮箱格式不正确').show();
                    $('#registerlogin-modal-alert-success').hide();
                } else {
                    // 检测邮箱是否已注册
                    $.ajax({
                        type: 'POST',
                        url: '/checkEmailInfo',
                        data: {
                            uEmail: val
                        },
                        success: function(data) {
                            // 邮箱已注册
                            if (data.status == 0) {
                                $('#registerlogin-modal-alert').text('该邮箱已被注册').show();
                                $('#registerlogin-modal-alert-success').hide();
                                checkEmailIsOk = false;
                            } else {
                                $('#registerlogin-modal-alert').hide();
                                $('#registerlogin-modal-alert-success').text('恭喜，该邮箱可以使用').show();

                                if (!needEmailCodeValidate) {
                                    checkEmailIsOk = true;
                                } else {
                                    checkEmailIsOk = emailCodeValidate();
                                }
                                
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


        // 检测昵称是否可用
        checkNickNameValidate();
        function checkNickNameValidate() {
            $('#modal-register-nickname').blur(function() {
                var val = $(this).val();
                if (!val) {
                    $('#registerlogin-modal-alert').text('必填项不能留空').show();
                    $('#registerlogin-modal-alert-success').hide();
                } else {
                    // 检测邮箱是否已注册
                    $.ajax({
                        type: 'POST',
                        url: '/checkNickNameInfo',
                        data: {
                            uNickName: val
                        },
                        success: function(data) {
                            // 昵称已被使用
                            if (data.status == 0) {
                                $('#registerlogin-modal-alert').text('这个昵称已经有人使用啦').show();
                                $('#registerlogin-modal-alert-success').hide();
                                checkNickNameIsOk = false;
                            } else {
                                $('#registerlogin-modal-alert').hide();
                                $('#registerlogin-modal-alert-success').text('恭喜，该昵称可以使用').show();
                                checkNickNameIsOk = true;
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


        $('#modal-login-div').find('button[type="submit"]').click(function() {
            var userVal = $('#modal-login-user').val();
            var pwdVal = $('#modal-login-pwd').val();
            
            if (!userVal || !pwdVal) {
                $('#registerlogin-modal-alert').text('必填项不能留空').show();
                $('#registerlogin-modal-alert-success').hide();
            } else if (!emailReg.test(userVal)) {
                $('#registerlogin-modal-alert').text('邮箱格式不正确').show();
                $('#registerlogin-modal-alert-success').hide();
            } else {
                $('#registerlogin-modal-alert').hide();
                $('#registerlogin-modal-alert-success').text('登录中 ...').show();
                if (pwdVal.length !== 32) {
                    pwdVal = hex_md5(pwdVal);
                }

                // 验证用户名密码是否匹配
                $.ajax({
                    type: 'POST',
                    url: '/checkLoginInfo',
                    data: {
                        uEmail: userVal,
                        uPassword: pwdVal
                    },
                    success: function(data) {
                        console.log(1);
                        // 登录成功
                        if (data.status == 1) {
                            // 记住我 cookie操作
                            if ($('#modal-login-remember')[0].checked) {
                                Util.setCookie('remember', 1);
                                Util.setCookie('user', userVal);
                                Util.setCookie('pwd', pwdVal, 60 * 24 * 7);
                            } else {
                                Util.setCookie('remember', -1);
                                Util.delCookie('pwd');
                            }

                            window.location.reload();
                        }
                        // 用户名/密码错误
                        else {
                            $('#registerlogin-modal-alert').text('用户名或密码错误，请检查').show();
                            $('#registerlogin-modal-alert-success').hide();
                        }
                    },
                    error: function(e) {
                        console.log(e);
                        console.log(e.textStatus);
                    }
                });
                
            }
        });

        // 注册
        $('#modal-register-div').find('button[type="submit"]').click(function() {
            var userVal = $('#modal-register-user').val();
            var pwdVal = $('#modal-register-pwd').val();
            var pwdRVal = $('#modal-register-pwdR').val();
            var nickNameVal = $('#modal-register-nickname').val();
            var sexVal = $('#modal-register-boy')[0].checked ? 'boy' : 'girl';
            
            // 再次验证
            checkEmailValidate();
            checkNickNameValidate();
            if (!checkEmailIsOk || !checkNickNameIsOk) {
                return;
            }

            if (!userVal || !pwdVal || !pwdRVal || !nickNameVal) {
                $('#registerlogin-modal-alert').text('必填项不能留空').show();
                $('#registerlogin-modal-alert-success').hide();
            } else if (pwdVal !== pwdRVal) {
                $('#registerlogin-modal-alert').text('两次密码不一致').show();
                $('#registerlogin-modal-alert-success').hide();
            } else if (!pwdReg.test(pwdVal)) {
                $('#registerlogin-modal-alert').text('请输入5-32位的密码').show();
                $('#registerlogin-modal-alert-success').hide();
            } else {
                // 提交
                pwdVal = hex_md5(pwdVal);
                $('#registerlogin-modal-alert').hide();

                $.ajax({
                    type: 'POST',
                    url: '/checkRegisterInfo',
                    data: {
                        uEmail: userVal,
                        uPassword: pwdVal,
                        uNickName: nickNameVal,
                        uSex: sexVal,
                        newDate: Util.formatDate(new Date(), 'yyyy/mm/dd hh:ii:ss')
                    },
                    success: function(data) {
                        // 出错
                        if (data.status == 0) {
                            $('#registerlogin-modal-alert').text('出错啦，请重试').show();
                            $('#registerlogin-modal-alert-success').hide();
                        }
                        // 注册成功
                        else if (data.status == 1) {
                            $('#registerlogin-modal-alert').hide();
                            $('#registerlogin-modal-alert-success').text('注册成功，请登录吧').show();
                            $('#modal-login-user').val(userVal);
                            $('#modal-login-pwd').val('');
                            $('#modal-login-user').focus();
                            $('#modal-login-btn').click();
                        }
                    },
                    error: function(e) {
                        console.log(e);
                        console.log(e.textStatus);
                    }
                });
            }
        });

        // 注销操作

        $('#user-logout').click(function() {
            $.ajax({
                type: 'POST',
                url: '/logout',
                success: function(data) {
                    // 注销成功
                    if (data.status == 1) {
                        window.location.reload();
                    } else {

                    }
                },
                error: function(e) {
                    console.log(e);
                    console.log(e.textStatus);
                }

            });
        });

        // 找回密码 -- 重置密码 操作
        $('#pwd_back').click(function() {
            $('#modal-login-div').hide();
            $('#modal-pwdBack-div').show();
            $('#pwdBack-alert').hide();
            $('#registerlogin-modal').find('.modal-body').addClass('with-pwdBack');
        });

        // 返回登录页面
        $('#backToLogin').click(function() {
            $('#modal-login-div').show();
            $('#modal-pwdBack-div').hide();
            $('#registerlogin-modal').find('.modal-body').removeClass('with-pwdBack');
        });

        // 重置密码
        $('#pwdBack-btn').click(function() {
            var userVal = $('#pwdBack-input').val();

            if (!userVal) {
                $('#pwdBack-alert').removeClass('alert-success').addClass('alert-warning').text('邮箱不可为空').show();
            } else if (!emailReg.test(userVal)) {
                $('#pwdBack-alert').removeClass('alert-success').addClass('alert-warning').text('邮箱格式不正确').show();
            } else {

                var time = 61;
                var $that = $(this);

                $.ajax({
                    type: 'POST',
                    url: '/pwdBack',
                    data: {
                        uEmail: userVal
                    },
                    success: function(data) {
                        // 新密码发送至邮箱成功
                        if (data.status == 1) {
                            // 60s后可重新发送
                            $that.addClass('disabled');

                            $('#pwdBack-alert').removeClass('alert-warning').addClass('alert-success').text('已将新密码发送至邮箱，请现在可返回进行登录').show();

                            $that.text((--time) + 's后可重新发送');
                            var t = setInterval(function() {
                                $that.text((--time) + 's后可重新发送');
                            }, 1000);

                            setTimeout(function() {
                                $that.text('重置密码').removeClass('disabled');
                                clearInterval(t);
                            }, time * 1000);

                        } else {
                            $that.text('出错啦，点击重试');
                        }
                    },
                    error: function(e) {
                        console.log(e);
                        console.log(e.textStatus);
                    }
                });
                
            }
        });
    });
});
