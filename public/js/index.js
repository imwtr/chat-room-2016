/**
 * [getRoomsList 加载房间列表]
 * @param  {[type]} pn   [页码]
 * @param  {[type]} area [分类]
 * @return {[type]}      [description]
 */
function getRoomsList(pn, area) {
    var $panelBody = $('#room-list-wrap').find('.panel-body');
    var temp = ['<div class="row">'];
    // 按分类获取的url 默认获取热门房间
    var url = area 
        ? '/getRoomsList/:pn=' + pn + '/:tag=' + area 
        : '/getRoomsList/:pn=' + pn + '/:tag=hot';  
        
    $.ajax({
        type: 'get',
        url: url,
        success: function(data) {
            var pSize = 12;
            var pTotal = Math.ceil(data.rTotal / pSize);    
            data = data.rooms;
            
            for (var i = 0, j = data.length; i < j; i++) {              
                            
                var popoverIDContent = '<p style="font-weight:700;">所属：</p><p>' + data[i].aName + '</p>' +
                                    '<p style="font-weight:700;" class="hide">当前/总会员：</p><p class="hide">' + data[i].rCurCount + '/' + data[i].rTotalCount + '</p></p>' +
                                    '<p style="font-weight:700;" class="hide">最后活跃：</p><p class="hide">' + data[i].rLastTime + '</p>';
                    popoverIDContent = popoverIDContent.replace(/\"/g, '&quot;');   
                // 根据用户是否在线选择是否禁用相应按钮
                var btnDisabled = (data[i].uLoginState === 'down' ? 'disabled' : '');
                // 判断该用户是否为好友
                var beFriends = data[i].uIsFriends ? 'hide' : '';
                var isFriends = data[i].uIsFriends ? '' : 'hide';
                var isFriend = data[i].uIsFriends ? 1 : 0;
                var isSelf = data[i].uIsSelf;
                // 房主
                var popoverOwnerContent = '<p class="user-login-state">当前：' + (data[i].uLoginState === 'down' ? '不' : '') + '在线</p>' +
                                            '<p>' +
                                                '<span style="background-position:0 ' + (data[i].uSex === 'girl' ? '-15' : '0') + 'px;" data-sex="' + data[i].uSex + '" class="popover-sex"></span>' +
                                                '<a href="/user?id=' + data[i].rOwnerId + '" data-isFriends="{F' + isFriend + 'F}" style="word-break: break-all;">' + data[i].uNickName + '</a></p>' +
                                        '<p><button data-tag="private" type="button" class="btn btn-info btn-xs ' + btnDisabled + '"><span class="glyphicon glyphicon-earphone"></span> 私信给TA</button></p>' +
                                        '<p><button data-tag="friend" data-act="1" type="button" class="btn btn-primary btn-xs {be ' + beFriends + ' eb}"><span class="glyphicon glyphicon-plus"></span> 加为好友</button></p>' +
                                        '<p><button data-tag="friend" data-act="0" type="button" class="btn btn-warning btn-xs {is ' + isFriends + ' si}"><span class="glyphicon glyphicon-remove"></span> 删除好友</button></p>' +
                                        '<p><button data-tag="group" type="button" class="btn btn-info btn-xs ' + btnDisabled + '"><span class="glyphicon glyphicon-earphone"></span> 讨论组</button></p>';
                    popoverOwnerContent = popoverOwnerContent.replace(/\"/g, '&quot;');
                    // 如果是自己  则其他项无需显示
                    if (isSelf) {
                        popoverOwnerContent = '这是你自己';
                    }                   
                //data[i].rCurCount = 0;
                temp.push('<div class="col-sm-3 col-xs-4">' +
                                '<div class="text-center">' +
                                    '<h6 title="' + data[i].rName + '" class="room-name">' + data[i].rName + '</h6>' +
                                    '<a data-rId="' + data[i].rId + '" href="/room?id=' + data[i].rId + '" class="room-logo">' +
                                        '<img src="' + data[i].rImage + '" alt="room" width="100%" height="100%">' +
                                        '<p class="room-user-num-wrap">' +
                                            '<span class="hide">统计：</span>' +
                                            '<span class="room-user-num">' + data[i].rCurCount + '</span>人在线' +
                                        '</p>' +
                                    '</a>' +
                                    '<div class="caption room-info">' +
                                        '<p>房号: <span class="room-id" data-toggle="popover" data-content="' + popoverIDContent + '"><a href="/room?id=' + data[i].rId + '">' + data[i].rId + '</a></span></p>' +
                                        '<p class="room-name" data-uId="' + data[i].rOwnerId + '">房主:<span class="room-owner" data-toggle="popover" data-content="' + popoverOwnerContent + '"><a href="javascript:void(0);">' + data[i].uNickName + '</a></span></p>' +
                                    '</div>' +
                                '</div>' +
                            '</div>');
            }
            temp.push('</div>');
            $panelBody.html(temp.join(''));         

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

            // 渲染分页栏  根据当前pn配置左右页值（中间显示5项）
            if (pn < 1 || pn > pTotal) {
                return;
            }           
            var $pageBarUl = $('#page-bar').find('ul');
            var prevIsDisabled = (pn === 1) ? 'disabled' : '';
            var nextIsDisabled = (pn === pTotal) ? 'disabled' : '';
            // 第一项为上一页
            temp = ['<li class="' + prevIsDisabled + '">' +
                        '<a href="javascript:getRoomsList(' + (pn - 1) + ',' + area + ')">&lt;</a>' +
                    '</li>'];

            // 5页以下直接展示
            if (pTotal <= 5) {
                var rEdge = (pTotal < 5) ? pTotal : 5;
                for (var i = 1; i <= rEdge; i++) {
                    var isActive = (i === pn) ? 'active' : '';
                    temp.push('<li class="' + isActive + '">' +
                                '<a href="javascript:getRoomsList(' + i + ',' + area + ')">' + i + '</a>' +
                            '</li>');
                }
            } 
            // 否则进一步判断左右页如何设置
            else {
                // 如果当前页距首页 < 2 则末页显示 ...pTotal
                if (pn <= 3) {
                    for (var i = 1; i <= 5; i++) {
                        var isActive = (i === pn) ? 'active' : '';
                        temp.push('<li class="' + isActive + '">' +
                                    '<a href="javascript:getRoomsList(' + i + ',' + area + ')">' + i + '</a>' +
                                '</li>');
                    }
                    temp.push('<li class="">' +
                                    '<a href="javascript:getRoomsList(' + pTotal + ',' + area + ')">...' + pTotal + '</a>' +
                                '</li>');
                }
                // 如果当前页距首页 > 3 则首页显示 1...
                if (pn >= 4) {
                    var rEdge = (pn + 2 > pTotal ? pTotal : pn + 2);
                    var lEdge = rEdge - 5 + 1;
                    // 首页
                    temp.push('<li class="">' +
                                    '<a href="javascript:getRoomsList(1,' + area + ')">1...</a>' +
                                '</li>');
                    // 中间部分
                    for (var i = lEdge; i <= rEdge; i++) {
                        var isActive = (i === pn) ? 'active' : '';
                        temp.push('<li class="' + isActive + '">' +
                                    '<a href="javascript:getRoomsList(' + i + ',' + area + ')">' + i + '</a>' +
                                '</li>');
                    }
                    // 末页（如果有）
                    if (rEdge < pTotal) {
                        temp.push('<li class="">' +
                                    '<a href="javascript:getRoomsList(' + pTotal + ',' + area + ')">...' + pTotal + '</a>' +
                                '</li>');
                    }
                }
            }      

            // 最后一项为下一页&跳页
            temp.push('<li class="' + nextIsDisabled + '">' +
                        '<a href="javascript:getRoomsList(' + (pn + 1) + ',' + area + ')">&gt;</a>' +
                    '</li>' +
                    '<li>' +
                        '<div class="input-group" id="page-go">' +
                            '<input type="text" class="form-control">' +
                            '<span class="input-group-btn">' +
                                '<button type="button" class="btn btn-default">Go</button>' +
                            '</span>' +
                        '</div>' +
                    '</li>');
            $pageBarUl.html(temp.join(''));         

            // 跳页事件绑定
            $('#page-go').find('button').click(function() {
                var value = parseInt($('#page-go').find('input').val(), 10);
                if (!value) {
                    return;
                }
                if (value < 1) {
                    getRoomsList(1, area);
                } else if (value > pTotal){
                    getRoomsList(pTotal, area);
                } else {
                    getRoomsList(value, area);
                }
            });
        },
        error: function(e) {
            console.log(e);
            console.log(e.textStatus);
            $panelBody.html('房间列表加载失败，请刷新重试');
        }
    })
}

// 创建房间提交 防止提交后跳转
function createRoomSubmit() {
    $('#create-room-form').ajaxSubmit({
        success: function() {
            window.location.href = '/';
        }
    });
    return false;
}

$(function() {
     $('#friends-panel-wrap').load('/friends_panel', function() {
        $('#common-modal-wrap').load('/common_modal', function() {
            searchMenuHandle();
            friendPanelHandle();
            floatChatbindEvent();
            

            // 加载分类列表
            var $panelBody = $('#campus-list-wrap').find('.panel-body');
            $.ajax({
                type: 'GET',
                url: '/getCampus',
                success: function(data) {
                    var temp = ['<ul class="list-unstyled campus-list text-center">'];

                    for (var i = 0, j = data.length; i < j; i++) {
                        temp.push('<li data-val="' + data[i].aId + '">' +
                                        '<a href="javascript:getRoomsList(1, ' + data[i].aId + ')">' + data[i].aName + '</a>' +
                                        '<span class="pull-right">&gt;&gt;</span>' +
                                    '</li>');
                    }

                    temp.push('</ul><img src="img/campus.png" alt="campus_logo" class="campus-logo">');
                    $panelBody.html(temp.join(''));

                    $('#campus-list-wrap').find('li').click(function(e) {
                        e = e || window.event;
                        var node = e.target || e.srcElement;
                        if (node.tagName === 'A') {
                            $(this).addClass('active').siblings().removeClass('active');
                        }
                    });
                },
                error: function(e) {
                    console.log(e);
                    console.log(e.textStatus);
                    $panelBody.html('分类列表加载失败，请刷新重试');
                }
            });

            getRoomsList(1);
            


            // 创建房间的图片上传
            $('#c-room-logo-div').click(function() {
                $('#c-room-logo').click();
            });
            $('#c-room-logo').change(function() {
                var roomLogo = document.getElementById('c-room-logo');
                var roomLogoPreview = document.getElementById('c-room-logo-preview');
                var imgSrc = '';

                // FireFox
                if (roomLogo.files && roomLogo.files[0]) {
                    console.log(window.URL.createObjectURL(roomLogo.files[0]))
                    $('#c-room-logo-preview').find('img')[0].src = window.URL.createObjectURL(roomLogo.files[0]);
                } 
                // IE
                else {
                    alert('抱歉，您当前的浏览器类型/版本 不支持使用此功能，请更换高级浏览器访问');
                    return false;
                    // roomLogo.select();
                    // roomLogo.blur();
                    // $('#c-room-logo-preview').empty();
                    // imgSrc = document.selection.createRange().text;
                   
                    // changeInputPreview.style.filter = 'progid:DXImageTransform.Microsoft.AlphaImageLoader(sizingMethod=scale,src=' + imgSrc + ')';
                    // document.selection.empty();
                    
                }

               $('#c-room-logo-preview').show();
            });

            

            $('#create-room-btn').click(function() {
                var rBelongToID = $('#c-room-cat').val();
                var rName = $('#c-room-name').val();
                var rImage = $('#c-room-logo').val();
                var rDesc = $('#c-room-desc').val();

                if (!rBelongToID || !rName || !rImage || !rDesc) {
                    $('#create-room-alert').show();
                    return;
                }
                // 只支持后缀 .jpg/.jpeg/.png 格式的图片
                var ext = rImage.substring(rImage.lastIndexOf('.') + 1, rImage.length).toLowerCase();
                if (ext !== 'jpg' && ext !== 'jpeg' && ext !== 'png') {
                    $('#create-room-alert').text('只支持后缀 .jpg/.jpeg/.png 格式的图片').show();
                    return;
                }

                $('#c-room-time').val(Util.formatDate(new Date(), 'yyyy/mm/dd hh:ii:ss'));
                $('#create-room-form').attr('action','/newRoom').submit();
            });

            // 点击讨论组  选择讨论组
            joinGroupHandle();

            // 点击添加好友  选择好友分组
            changeUserGroup();

            //  折叠房间分类列表
            $('#campus-list-wrap').find('span').eq(0).click(function() {
                $(this).addClass('hide').next().removeClass('hide');
                $('#campus-list-wrap').find('.panel-body').hide();
            });
            // 展开房间分类列表
            $('#campus-list-wrap').find('span').eq(1).click(function() {
                $(this).addClass('hide').prev().removeClass('hide');
                $('#campus-list-wrap').find('.panel-body').show();
            });
            //  折叠房间列表
            $('#room-list-wrap').find('span').eq(0).click(function() {
                $(this).addClass('hide').next().removeClass('hide');
                $('#room-list-wrap').find('.panel-body').hide().next().hide();
            });
            // 展开房间列表
            $('#room-list-wrap').find('span').eq(1).click(function() {
                $(this).addClass('hide').prev().removeClass('hide');
                $('#room-list-wrap').find('.panel-body').show().next().show();
            });
        });
    });
});
