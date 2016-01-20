		var $chatContent = $('#chat-content-chats-list');
		var $getChatsMoreBtn = $('#chat-content-chats-more');

		/**
		 * 加载历史消息
		 * 
		 */
		function getChats(tag, id, pn) {
			if (pn == -1) {
				return;
			}

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

			$.ajax({
				type: 'get',
				url: '/getChats/:cBelongToID=' + tag + '_' + id + '/:pn=' + pn,
				success: function(data) {
					// 获取消息记录成功
					// 余下还有数据
					if (!data.isLast) {
						$getChatsMoreBtn.attr('data-pn', pn + 1);
					} else {
						$getChatsMoreBtn.attr('data-pn', -1).parent().hide();
					}
					
					var liTemp = [];

					for (var i = 0; i < data.c.length; i++) {

						// 根据用户是否在线选择是否禁用相应按钮
						var btnDisabled = (data.c[i].uLoginState === 'down' ? 'disabled' : '');
						// 判断该用户是否为好友
						var beFriends = data.c[i].uIsFriends ? 'hide' : '';
						var isFriends = data.c[i].uIsFriends ? '' : 'hide';
						var isSelf = data.c[i].uIsSelf;
						
						var popoverUserContent = '<p class="user-login-state">当前：' + (data.c[i].uLoginState === 'down' ? '不' : '') + '在线</p>' +
													'<p>' +
														'<span style="background-position:0 ' + (data.c[i].uSex === 'girl' ? '-15' : '0') + 'px;" data-sex="' + data.c[i].uSex + '" class="popover-sex"></span>' +
														'<a href="/user?id=' + data.c[i].uId + '" data-isFriends="{isFriends}">' + data.c[i].uNickName + '</a></p>' +
												'<p><button data-tag="private" type="button" class="btn btn-info btn-xs ' + btnDisabled + '"><span class="glyphicon glyphicon-earphone"></span> 私信给TA</button></p>' +
												'<p><button data-tag="friend" data-act="1" type="button" class="btn btn-primary btn-xs {be ' + beFriends + ' eb}"><span class="glyphicon glyphicon-plus"></span> 加为好友</button></p>' +
												'<p><button data-tag="friend" data-act="0" type="button" class="btn btn-warning btn-xs {is ' + isFriends + ' si}"><span class="glyphicon glyphicon-remove"></span> 删除好友</button></p>' +
												'<p><button data-tag="group" type="button" class="btn btn-info btn-xs ' + btnDisabled + '"><span class="glyphicon glyphicon-earphone"></span> 讨论组</button></p>';
							popoverUserContent = popoverUserContent.replace(/\"/g, '&quot;');	
							// 如果是自己  则其他项无需显示
							if (isSelf) {
								popoverUserContent = '这是你自己';
							}

						liTemp.push('<li class="list-group-item">' +
										'<p>' +
											'<span class="glyphicon glyphicon-leaf blue"></span>&nbsp;' +
											'<a data-uId="' + data.c[i].uId + '" href="#" class="chat-content-nickname user-info-popover" data-toggle="popover" data-content="' + popoverUserContent + '">' + data.c[i].uNickName + '</a>' +
											'<span class="chat-content-time">' + data.c[i].cTime + '</span>' +
										'</p>' +
										'<div class="chat-content-chat">' + rebuildMsg(data.c[i].cDetail) + '</div>' +
									'</li>');
					}

					// 如果是第一次加载则往后添加
					if (pn == 0) {
						$chatContent.append(liTemp.join(''));
						// 滚动条  滚动到底部
						$chatContent.scrollTop($chatContent.height());
					}
					// 否则为查看历史消息操作， 添加至前方
					else {
						$chatContent.find('li').eq(0).before(liTemp.join(''));
					}

					checkIsFriends($chatContent, '.user-info-popover');

					// popover 框初始化
					window.location.pathname === '/room' && $('.user-info-popover').popover({
						trigger: 'click',
						html: true,
						title: 'TA的资料',
						placement: 'right'
					});	

				},
				error: function(e) {
					console.log(e);
					console.log(e.textStatus);
				}
			});
		}

		// 添加到消息列表
		function appendToChatList(user, chat) {
			// 根据用户是否在线选择是否禁用相应按钮

			var btnDisabled = (user.uLoginState === 'down' ? 'disabled' : '');
			var beFriends = '';
			var isFriends = 'hide';

			var popoverUserContent = '<p class="user-login-state">当前：' + (user.uLoginState === 'down' ? '不' : '') + '在线</p>' +
										'<p>' +
											'<span style="background-position:0 ' + (user.uSex === 'girl' ? '-15' : '0') + 'px;" data-sex="' + user.uSex + '" class="popover-sex"></span>' +
											'<a href="/user?id=' + user.uId + '" data-isFriends="{isFriends}">' + user.uNickName + '</a></p>' +
									'<p><button data-tag="private" type="button" class="btn btn-info btn-xs ' + btnDisabled + '"><span class="glyphicon glyphicon-earphone"></span> 私信给TA</button></p>' +
									'<p><button data-tag="friend" data-act="1" type="button" class="btn btn-primary btn-xs {be ' + beFriends + ' eb}"><span class="glyphicon glyphicon-plus"></span> 加为好友</button></p>' +
									'<p><button data-tag="friend" data-act="0" type="button" class="btn btn-warning btn-xs {is ' + isFriends + ' si}"><span class="glyphicon glyphicon-remove"></span> 删除好友</button></p>' +
									'<p><button data-tag="group" type="button" class="btn btn-info btn-xs ' + btnDisabled + '"><span class="glyphicon glyphicon-earphone"></span> 讨论组</button></p>';
				popoverUserContent = popoverUserContent.replace(/\"/g, '&quot;');	
			$chatContent.append('' +
				'<li class="list-group-item">' +
					'<p>' +
						'<span class="glyphicon glyphicon-leaf blue"></span>&nbsp;' +
						'<a data-uId="' + user.uId + '" href="#" class="chat-content-nickname user-info-popover" data-toggle="popover" data-content="' + popoverUserContent + '">' + user.uNickName + '</a>' +
						'<span class="chat-content-time">' + chat.cTime + '</span>' +
					'</p>' +
					'<div class="chat-content-chat">' + chat.cDetail + '</div>' +
				'</li>');

			checkIsFriends($('#chat-content-chats-list'), '.user-info-popover');
			// popover 框初始化
			window.location.pathname === '/room' && $('.user-info-popover').popover({
				trigger: 'click',
				html: true,
				title: 'TA的资料',
				placement: 'right'
			});	

			// 滚动条  滚动到底部
			$chatContent.scrollTop($chatContent.height());
		}

		// 为实时产生的消息 判断所属用户与自己是否为好友
		function checkIsFriends($parent, target) {	
			var theUIDs = [];
			$parent.find(target).each(function() {
				theUIDs.push($(this).attr('data-uId'));
			});
			

			if (!theUIDs.length) {
				return;
			}
			var theUID = [];
			for (var i = 0; i < theUIDs.length; i++) {
				if (theUIDs[i] != 'undefined') {
					theUID[i] = theUIDs[i];
				}
			}

			$.ajax({
				type: 'post',
				url: '/checkIsFriends',
				data: {
					theUID: theUID.join('|')
				},
				success: function(data) {
					// 未登录则无需操作
					if (data.status == 0) {

					} else {
						// 添加好友|删除好友 显隐  是否为好友属性
						var regBE = /(\{be\s)(.*?)(\seb\})/;
						var regIS = /(\{is\s)(.*?)(\ssi\})/;
						var isFriends = /(\{isFriends\})/;
						var newPopoverContent;

						// 再次匹配用户id  
						var i = 0;
						$parent.find(target).each(function() {
							if (data.user[i] && data.user[i].uId == $(this).attr('data-uId')) {
								if (data.user[i].uIsSelf) {
									newPopoverContent = '这是你自己';
								} else {
									// 是好友  显示删除
									if (data.user[i].uIsFriends) {
										newPopoverContent = $(this).attr('data-content').replace(regBE, '$1hide$3').replace(regIS, '$1$3').replace(isFriends, '1');
									} else {
										newPopoverContent = $(this).attr('data-content').replace(regBE, '$1$3').replace(regIS, '$1hide$3').replace(isFriends, '0');
									}
								}
								
								$(this).attr('data-content', newPopoverContent);
							}
							i++;
						});
						
					}
				},
				error: function(e) {
					console.log(e);
					console.log(e.textStatus);
				}
			});
		}