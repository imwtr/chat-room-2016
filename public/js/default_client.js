var socket = io();

var uId = -1;
var uNickName = '';

// 判断用户是否登录
function checkIsLogin(cb) {
	$.ajax({
		type: 'get',
		url: '/checkIsLogin',
		success: function(data) {
			// 已登录
			if (data.status == 1) {
				uId = data.uId;
				uNickName = data.uNickName;	
			} else {
				console.log('未登录');
			}

			cb(uId, uNickName);
		},
		error: function(e){
			console.log(e);
			console.log(e.textStatus);
		}
	});
}

// 判断会话是否已经在聊天窗口上  如果在 但非active则添加数字
function checkChatInFloatWin(cBelongToID) {
	var isExists = false;
	$('#chat-left-menu').find('li').each(function() {
		var $that = $(this);
		var $span1;
		var cBelongToIDArr = [cBelongToID];

		if (cBelongToID.indexOf('_') !== cBelongToID.lastIndexOf('_')) {
			var temp = cBelongToID.split('_');
			cBelongToIDArr.push([temp[0], temp[2], temp[1]].join('_'));
		}

		if (cBelongToIDArr.indexOf($that.attr('data-val')) !== -1) {
			// 添加消息数量提示
			if (!$that.hasClass('chat-item-active')) {
				$span1 = $that.find('span').eq(1);
				$span1.text(parseInt($span1.text(), 10) + 1).removeClass('hide').show();
			} else {

			}
			
			isExists = true;
			return false;
		} 
	});
	return isExists;
}

// 判断好友面板上是否已有该会话记录  如果有  直接替换相应的项即可
function checkChatInFriendsPanel(msg, type) {
	var isExists = false;
	var $item;
	var $span1;
	var cBelongToIDArr = [msg.cBelongToID];

	if (msg.cBelongToID.indexOf('_') !== msg.cBelongToID.lastIndexOf('_')) {
		var temp = msg.cBelongToID.split('_');
		cBelongToIDArr.push([temp[0], temp[2], temp[1]].join('_'));
	}

	$('#history-chat-list').find('li').each(function() {
		if (cBelongToIDArr.indexOf($(this).attr('data-cBelongToID')) !== -1) {
			$item = $(this);
			isExists = true;
			return false;
		}
	});

	// 不存在才添加
	if ($item) {
		$item.find('p').eq(0).text(msg.cDetail);
		$item.find('span').eq(0).text(msg.cTime);
		$span1 = $item.find('span').eq(1);
		$span1.text(parseInt($span1.text(), 10) + 1);//.removeClass('hide');
		$item.prependTo($('#history-chat-list'));

		if (type === 'show') {
			$span1.removeClass('hide');
		}
	}

	return isExists;
}

function prependChatPMsg(msg) {
	$('#history-chat-list').prepend('<li data-toggle="popover" data-cBelongToID="' + msg.cBelongToID + '" data-cId="' + msg.cId + '">' +
		'<a href="#" class="list-group-item">' +
			'<img src="' + msg.uImage + '" alt="头像" width="30px" height="30px" class="pull-left">' +
			'<h6 class="chat-list-nickname" data-isFriends="' + msg.isFriends + '" data-id="' + msg.uId + '" data-type="chatP" title="' + msg.uNickName + '" data-signature="' + msg.uSignature + '">' + msg.uNickName + '</h6>' +
			'<p class="chat-list-data">' + msg.cDetail + '</p>' +
			'<span class="chat-list-time">' + msg.cTime + '</span>' +
			'<span class="chat-list-num-per badge">1</span>' +
		'</a>' +
	'</li>');
}

function prependChatMsg(msg) {
	console.log(msg);
	console.log(msg.cId)
	$('#history-chat-list').prepend('<li data-toggle="popover" data-cBelongToID="' + msg.cBelongToID + '" data-cId="' + msg.cId + '">' +
		'<a href="#" class="list-group-item">' +
			'<img src="/img/group.png" alt="头像" width="30px" height="30px" class="pull-left">' +
			'<h6 class="chat-list-nickname" data-id="' + msg.gId + '" data-type="chat" title="' + msg.gName + '" data-time="' + msg.gTime +'">' + msg.gName + '</h6>' +
			'<p class="chat-list-data">' + msg.cDetail + '</p>' +
			'<span class="chat-list-time">' + msg.cTime + '</span>' +
			'<span class="chat-list-num-per badge">1</span>' +
		'</a>' +
	'</li>');

}

checkIsLogin(function() {

	socket.on('connect', function() {
		socket.emit('default_socket', uId, uNickName);
	});

	// 监听私聊的消息提示
	socket.on('chatPMsgTip', function(msg) {

		if (!checkChatInFloatWin(msg.cBelongToID)) {
			if (!checkChatInFriendsPanel(msg, 'show')) {
				prependChatPMsg(msg);
			}
		} else {
			if (!checkChatInFriendsPanel(msg, 'hide')) {
				prependChatPMsg(msg);
			}
		}
		$('#history-chat-list').find('li').popover({
			trigger: 'click',
			html: true,
			content: '<ul class="list-unstyled">' +
				'<li><a href="#" data-val="enter-chat">查看会话</a></li>' +
				'<li><a href="#" data-val="remove-chat" class="text-warning">移除此会话</a></li>',
			placement: 'left'
		});
	});


	// 监听讨论组的消息提示
	socket.on('chatMsgTip', function(msg) {

		if (!checkChatInFloatWin(msg.cBelongToID)) {
			if (!checkChatInFriendsPanel(msg, 'show')) {
				prependChatMsg(msg);
			}
		} else {
			if (!checkChatInFriendsPanel(msg, 'hide')) {
				prependChatMsg(msg);
			}
		}

		$('#history-chat-list').find('li').popover({
			trigger: 'click',
			html: true,
			content: '<ul class="list-unstyled">' +
				'<li><a href="#" data-val="enter-chat">查看会话</a></li>' +
				'<li><a href="#" data-val="remove-chat" class="text-warning">移除此会话</a></li>',
			placement: 'left'
		});
	});

	// 监听房间在线人数
	socket.on('roomClientNum', function(rId, num) {
		// 更新
		$('#room-list-wrap').find('.panel-body').find('a').each(function() {
			var $that = $(this);
			if ($that.attr('data-rId') == rId) {
				$that.find('.room-user-num').text(num);
				return false;
			}
		});
		// 储存
		$.ajax({
			type: 'post',
			url: '/updateRoomClientNum',
			data: {
				rId: rId,
				num: num
			},
			success: function(data) {

			},
			error: function(e) {
				console.log(e);
				console.log(e.textStatus);
			}
		});
	});

});

