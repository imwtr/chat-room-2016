
$(function() {
	 $('#friends-panel-wrap').load('/friends_panel', function() {
	 	searchMenuHandle();
		friendPanelHandle();
		floatChatbindEvent();

		// tooltip提示栏初始化
		$('[data-toggle="tooltip"]').tooltip();
		$('[data-toggle="popover"]').popover();
		$(document).delegate('[data-toggle="popover"]', 'show.bs.popover', function() {
			$('.popover').popover('hide');
			$(this).next('.popover').popover('show');
		});

		var $rId = $('#room-info-content').find('a').eq(0), // 房号
			$rName = $('#room-info-content').find('a').eq(1), // 房名
			$rBelongTo = $('#room-info-content').find('p').eq(1).find('span'), // 房间所属分类
			$likeBtn = $('#room-info-content').find('p').eq(2).find('button'), // 关注/取消关注房间的按钮
			$rDesc = $('#room-info-content').find('p').eq(4), // 房间描述
			$rImage = $('#room-info-content').find('p').eq(5).find('img'), // 房间logo
			$rOwner = $('#room-info-content').find('p').eq(6), // 房主
			$rManagers = $('#room-info-content').find('p').eq(7), // 房间管理员
			$rCurCount = $('#room-info-content').find('p').eq(8).find('span'), // 房间当前在线

			$rTitle = $('#chat-content-title').find('a').eq(0), // 房间标题 房名
			$rTitleDesc = $('#chat-content-title').find('span').eq(1), // 房间标题 的房间描述

			$userListCurCount = $('#chat-content-userList').find('span').eq(0); // 用户列表到当前在线人数

		var $getChatsMoreBtn = $('#chat-content-chats-more');
		var $chatContent = $('#chat-content-chats-list');

		// 编辑框是否可用
		var $editBoxEdit = $('#chat-content-editbox-edit');
		var $editBoxSend = $('#chat-content-send').find('button');

		var $editBoxMenuCover = $('#editBox-menu-cover');

		var rId = Util.getArgValue('id');

			if (rId === null) {
				window.location.href = '/';
			}

			rId = parseInt(rId, 10);

		getRoomInfo();
		// 拉取房间基本信息
		function getRoomInfo() {	

			$.ajax({
				type: 'get',
				url: '/getRoomInfo/:id=' + rId,
				success: function(data) {
					// 拉取成功
					if (data.status == 1) {
						$rId.text(data.rId);
						$rName.text(data.rName);
						$rBelongTo.text(data.rBelongTo);

						// 判断是否为已关注
						if (data.isLiked == 1) {
							$likeBtn.attr('data-act', '1');  // 当点击的时候则为取消关注操作
							$likeBtn.html('<span class="glyphicon glyphicon-minus"></span> 取消关注');
							$editBoxSend.removeClass('disabled');
							$editBoxEdit.text('').attr('contentEditable', 'true');
							$editBoxMenuCover.hide();
						} else if (data.isLiked == 0) {
							$likeBtn.attr('data-act', '0');  // 当点击到时候则为关注操作  --- 已登录用户
							$likeBtn.html('<span class="glyphicon glyphicon-plus"></span> 关注此房间');
							$editBoxSend.addClass('disabled');
							$editBoxEdit.text('关注后才能进行聊天哦').attr('contentEditable', 'false');
							$editBoxMenuCover.show();
						} else if (data.isLiked == -1) {
							$likeBtn.attr('data-act', '-1');  // 当点击到时候则为关注操作  --- 未登录用户
							$likeBtn.html('<span class="glyphicon glyphicon-plus"></span> 关注此房间');
							$editBoxSend.addClass('disabled');
							$editBoxEdit.text('关注后才能进行聊天哦').attr('contentEditable', 'false');
							$editBoxMenuCover.show();
						}

						$rDesc.text(data.rDesc);
						$rImage.attr('src', data.rImage);
						// 聊天区的房名以及描述
						$rTitle.text(data.rName);
						$rTitleDesc.text(data.rDesc).attr('title', data.rDesc);

						// 根据用户是否在线选择是否禁用相应按钮
						var btnDisabled = (data.rOwner.uLoginState === 'down' ? 'disabled' : '');
						// 判断该用户是否为好友
						var beFriends = data.rOwner.uIsFriends ? 'hide' : '';
						var isFriends = data.rOwner.uIsFriends ? '' : 'hide';
						var isFriend = data.rOwner.uIsFriends ? 1 : 0;
						var isSelf = data.rOwner.uIsSelf;
						// 房主
						var popoverOwnerContent = '<p class="user-login-state">当前：' + (data.rOwner.uLoginState === 'down' ? '不' : '') + '在线</p>' +
													'<p>' +
														'<span style="background-position:0 ' + (data.rOwner.uSex === 'girl' ? '-15' : '0') + 'px;" data-sex="' + data.rOwner.uSex + '" class="popover-sex"></span>' +
														'<a href="/user?id=' + data.rOwner.uId + '" data-isFriends="' + isFriend + '">' + data.rOwner.uNickName + '</a></p>' +
												'<p><button data-tag="private" type="button" class="btn btn-info btn-xs ' + btnDisabled + '"><span class="glyphicon glyphicon-earphone"></span> 私信给TA</button></p>' +
												'<p><button data-tag="friend" data-act="1" type="button" class="btn btn-primary btn-xs {be ' + beFriends + ' eb}"><span class="glyphicon glyphicon-plus"></span> 加为好友</button></p>' +
												'<p><button data-tag="friend" data-act="0" type="button" class="btn btn-warning btn-xs {is ' + isFriends + ' si}"><span class="glyphicon glyphicon-remove"></span> 删除好友</button></p>' +
												'<p><button data-tag="group" type="button" class="btn btn-info btn-xs ' + btnDisabled + '"><span class="glyphicon glyphicon-earphone"></span> 讨论组</button></p>';
							popoverOwnerContent = popoverOwnerContent.replace(/\"/g, '&quot;');
							// 如果是自己  则其他项无需显示
							if (isSelf) {
								popoverOwnerContent = '这是你自己';
							}

						$rOwner.html('房主：<a href="#"  class="user-info-popover" data-toggle="popover" data-content="' + popoverOwnerContent + '">' + data.rOwner.uNickName + '</a>');
						
						// 管理员
						// var rManagersTemp = ['管理员：'];
						// for (var i = 0; i < data.rManagers.length; i ++) {
						// 	// 根据用户是否在线选择是否禁用相应按钮
						// 	var btnDisabled = (data.rManagers[i].uLoginState === 'down' ? 'disabled' : '');
						// 	// 判断该用户是否为好友
						// 	var beFriends = data.rManagers[i].uIsFriends ? 'hide' : '';
						// 	var isFriends = data.rManagers[i].uIsFriends ? '' : 'hide';
						// 	var isSelf = data.rManagers[i].uIsSelf;
						// 	var popoverManagerContent = '<p class="user-login-state">当前：' + (data.rManagers[i].uLoginState === 'down' ? '不' : '') + '在线</p>' +
						// 								'<p>' +
						// 									'<span style="background-position:0 ' + (data.rManagers[i].uSex === 'girl' ? '-15' : '0') + 'px;" data-sex="' + data.rManagers[i].uSex + '" class="popover-sex"></span>' +
						// 									'<a href="/user?id=' + data.rManagers[i].uId + '">' + data.rManagers[i].uNickName + '</a></p>' +
						// 							'<p><button data-tag="private" type="button" class="btn btn-info btn-xs ' + btnDisabled + '"><span class="glyphicon glyphicon-earphone"></span> 私信给TA</button></p>' +
						// 							'<p><button data-tag="friend" data-act="1" type="button" class="btn btn-primary btn-xs {be ' + beFriends + ' eb}"><span class="glyphicon glyphicon-plus"></span> 加为好友</button></p>' +
						// 							'<p><button data-tag="friend" data-act="0" type="button" class="btn btn-warning btn-xs {is ' + isFriends + ' si}"><span class="glyphicon glyphicon-remove"></span> 删除好友</button></p>' +
						// 							'<p><button data-tag="group" type="button" class="btn btn-info btn-xs ' + btnDisabled + '"><span class="glyphicon glyphicon-earphone"></span> 讨论组</button></p>';
						// 		popoverManagerContent = popoverManagerContent.replace(/\"/g, '&quot;');
						// 		// 如果是自己  则其他项无需显示
						// 		if (isSelf) {
						// 			popoverManagerContent = '这是你自己';
						// 		}

						// 	rManagersTemp.push('<a href="#"  class="user-info-popover" data-toggle="popover" data-content="' + popoverManagerContent + '">' + data.rManagers[i].uNickName + '</a>');
						// }
						// $rManagers.html(rManagersTemp.join(' | ').replace('|', ''));

						// 在线人数
						$rCurCount.text(0);
						$userListCurCount.text(0);

						// popover 框初始化
						$('.user-info-popover').popover({
							trigger: 'click',
							html: true,
							title: 'TA的资料',
							placement: 'bottom'
						});	
						
					} else {
						console.log('找不到该房间到信息');
					}
				},
				error: function(e) {
					console.log(e);
					console.log(e.textStatus);
				}
			});
		}

		// 当点击信息按钮时 重点突出左侧描述
		$('#chat-content-title').find('span').eq(0).click(function() {
			$rDesc.css({
				'border': '1px solid green',
				'border-radius': '3px'
			});
			setTimeout(function() {
				$rDesc.css('border', 'none');
			}, 1000);
		});

		// 关注/取消关注房间的按钮 事件绑定
		$likeBtn.click(function() {
			var act = $(this).attr('data-act');
			
			// 当前未登录  显示提示框
			if (act == -1) {
				$('#tips-div').modal('show');
			}

			// 当前已登录  则执行相应操作
			$.ajax({
				type: 'post',
				url: '/likeRoom',
				data: {
					rId: rId,
					act: act
				},
				success: function(data) {
					// 执行失败
					if (data.status == -1) {
						return;
					}
					// 执行关注操作成功
					if (data.status == 1) {
						$likeBtn.attr('data-act', '1');  // 当点击的时候则为取消关注操作
						$likeBtn.html('<span class="glyphicon glyphicon-minus"></span> 取消关注');
						$editBoxSend.removeClass('disabled');
						$editBoxEdit.text('').attr('contentEditable', 'true');
						$editBoxMenuCover.hide();
					}
					// 执行取消关注成功
					if (data.status == 0) {
						$likeBtn.attr('data-act', '0');  // 当点击到时候则为关注操作  --- 已登录用户
						$likeBtn.html('<span class="glyphicon glyphicon-plus"></span> 关注此房间');
						$editBoxSend.addClass('disabled');
						$editBoxEdit.text('关注后才能进行聊天哦').attr('contentEditable', 'false');
						$editBoxMenuCover.show();
					}
					// 刷新以同步右侧用户列表
					location.reload();
				},
				error: function(e) {
					console.log(e);
					console.log(e.textStatus);
				}

			});

		});

		// 用户进入房间时默认加载历史消息  从后往前
		$getChatsMoreBtn.click(function() {
			getChats('room', rId, parseInt($(this).attr('data-pn'), 10));
		});
		$getChatsMoreBtn.click();

		// 编辑框初始化
		editBoxPreHandle();

		// 点击讨论组  选择讨论组
		joinGroupHandle();

		// 点击添加好友  选择好友分组
		changeUserGroup();
		
	});
});

