var $gName = $('#room-info-content').find('a').eq(1); // 讨论组名称
var $getChatsMoreBtn = $('#chat-content-chats-more');
var $chatContent = $('#chat-content-chats-list');
var $title = $('#chat-content-wrapper').find('a').eq(0);

var $userListNum = $('#userList').find('span');
var $userListUl = $('#userList').find('ul');

// 只在父框架中才能显示
if (!$(window.parent.document).find('#chat-wrapper').length) {
	window.location.href = '/';
}

//添加至父框架区域
// var $userListNumParent = $(window.parent.document).find('#userList').find('span');
// var $userListUlParent = $(window.parent.document).find('#userList').find('ul');

// 已登录的用户并且是该讨论组成员即可参与讨论
var $editBoxEdit = $('#chat-content-editbox-edit');
var $editBoxSend = $('#chat-content-send').find('button');
var $editBoxMenuCover = $('#editBox-menu-cover');

$('[data-toggle="popover"]').popover();
$(document).delegate('[data-toggle="popover"]', 'show.bs.popover', function() {
	$('.popover').popover('hide');
	$(this).next('.popover').popover('show');
});

var cId = Util.getArgValue('id');

if (cId === null) {
	window.location.href = '/';
}

cId = parseInt(cId, 10);

// 用户进入房间到时候默认加载历史消息  从后往前
$getChatsMoreBtn.click(function() {
	getChats('chat', cId, parseInt($(this).attr('data-pn'), 10));
});

$getChatsMoreBtn.click();

// 编辑框初始化
editBoxPreHandle();

// 判断编辑框是否可用  并加载讨论组用户列表
$.ajax({
	type: 'get',
	url: '/checkChatEditBox/:cId=' + cId,
	success: function(data) {
		// 可用
		if (data.status == 1) {
			$editBoxSend.removeClass('disabled');
			$editBoxEdit.text('').attr('contentEditable', 'true');
			$editBoxMenuCover.hide();
		} else if (data.status == 0) {
			// $editBoxSend.addClass('disabled');
			// $editBoxEdit.text('您不是该讨论组成员，暂不能参与讨论').attr('contentEditable', 'false');
			// $editBoxMenuCover.show();
			 window.location = '/';
			return;
		} else {
			// $editBoxSend.addClass('disabled');
			// $editBoxEdit.text('您还未登录，暂不能参与讨论').attr('contentEditable', 'false');
			// $editBoxMenuCover.show();
			 window.location = '/';
			return;
		}

		if (!data.user) {
			return;
		}

		// 渲染用户列表
		$title.text(data.user[0].gName);
		$userListNum.text(data.user[0].gCount);
	//	$userListNumParent.text(data.user[0].gCount);

		var liTemp = [];
		var liParentTemp = [];
		for (var i = 0; i < data.user.length; i++) {
			// 根据用户是否在线选择是否禁用相应按钮
			var btnDisabled = (data.user[i].uLoginState === 'down' ? 'disabled' : '');
			// 判断该用户是否为好友
			var beFriends = data.user[i].uIsFriends ? 'hide' : '';
			var isFriends = data.user[i].uIsFriends ? '' : 'hide';
			var isSelf = data.user[i].uIsSelf;
			
			var userInfoPopoverContent = '<p class="user-login-state">当d前：' + (data.user[i].uLoginState === 'down' ? '不' : '') + '在线</p>' +
										'<p>' +
											'<span style="background-position:0 ' + (data.user[i].uSex === 'girl' ? '-15' : '0') + 'px;" data-sex="' + data.user[i].uSex + '" class="popover-sex"></span>' +
											'<a href="/user?id=' + data.user[i].uId + '">' + data.user[i].uNickName + '</a></p>' +
									'<p><button data-tag="private" type="button" class="btn btn-info btn-xs ' + btnDisabled + '"><span class="glyphicon glyphicon-earphone"></span> 私信给TA</button></p>' +
									'<p><button data-tag="friend" data-act="1" type="button" class="btn btn-primary btn-xs {be ' + beFriends + ' eb}"><span class="glyphicon glyphicon-plus"></span> 加为好友</button></p>' +
									'<p><button data-tag="friend" data-act="0" type="button" class="btn btn-warning btn-xs {is ' + isFriends + ' si}"><span class="glyphicon glyphicon-remove"></span> 删除好友</button></p>' +
									'<p><button data-tag="group" type="button" class="btn btn-info btn-xs ' + btnDisabled + '"><span class="glyphicon glyphicon-earphone"></span> 讨论组</button></p>';
				userInfoPopoverContent = userInfoPopoverContent.replace(/\"/g, '&quot;');	
				// 如果是自己  则其他项无需显示
				if (isSelf) {
					userInfoPopoverContent = '这是你自己';
				}

			// 当前页赋予
			liTemp.push('<li class="data-toggle" data-toggle="popover" data-content="' + userInfoPopoverContent + '">' +
							'<img src="' + data.user[i].uImage + '" alt="头像" width="15px" height="15px">&nbsp;' +
							'<span class="">' + data.user[i].uNickName + '</span>' +
						'</li>');

			// 父框架项赋予
			// type, objId, isFriends, tag, id, img, name, signature, number
			var attr = ['data-type="chatP"',
						'data-id="' + data.user[i].uId + '"',
						'data-isSelf="' + (data.user[i].uIsSelf ? '1' : '0') + '"',
						'data-isFriends="' + (data.user[i].uIsFriends ? '1' : '0') + '"',
						'data-tag="new"',
						'data-val="' + data.user[i].cBelongToID + '"',
						'data-img="' + data.user[i].uImage + '"',
						'data-name="' + data.user[i].uNickName + '"',
						'data-signature="' + data.user[i].uSignature + '"',
						'data-id="' + data.user[i].uId + '"',
						'data-number="0"'
						].join(' ');
			liParentTemp.push('<li ' + attr + ' style="cursor:' + (data.user[i].uIsSelf ? 'default;"' : 'pointer;"') + '>' +
							'<img src="' + data.user[i].uImage + '" alt="头像" width="15px" height="15px">&nbsp;' +
							'<span class="">' + data.user[i].uNickName + '</span>' +
						'</li>');
		}

		window.localStorage.setItem('chat_' + cId, liParentTemp.join(''));
		window.localStorage.setItem('chat_' + cId + '_num', data.user[0].gCount);

		$userListUl.html(liTemp.join(''));
		//$userListUlParent.html(liParentTemp.join('')).attr('data-val', 'chat_' + cId);

		// popover 框初始化
		$userListUl.find('li').popover({
			trigger: 'click',
			html: true,
			title: 'TA的资料',
			placement: 'left'
		});	
	},
	error: function(e) {
		console.log(e);
		console.log(e.textStatus);
	}
});

