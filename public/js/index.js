
// 搜索条件选择
$('#search-menu').click(function(e) {
	var node = e.target || e.srcElement;
	var condition;
	var li;

	if (node.nodeName === 'A') {
		li = $(node.parentNode);
		condition = li.attr('data-val');
		li.addClass('active').siblings('li').removeClass('active');

		$('#search-condition').html(condition + '<span class="caret"></span>');
		$('#search-input').attr('placeholder', condition === '不限' ? '搜索' : '搜索' + condition);
	}

});

// 根据条件进行搜索
$('#search-btn').click(searchByInput);
$('form[name="search-form"]').submit(searchByInput);

function searchByInput(e) {
	var node = e.target || e.srcElement;

	if (node.nodeName !== 'BUTTON') {
		e.preventDefault();
	}

	var inputVal = $.trim($('#search-input').val());
	var condition = $.trim($('#search-condition').text());
	var tag = {
		'不限': 10,
		'房名': 1,
		'房号': 2,
		'昵称': 3
	};

	if (inputVal === '' || !tag[condition]) {
		return;
	}

	location = '/search?tag=' + tag[condition] + '&w=' + encodeURIComponent(inputVal);

}

// 弹出框提示
$('.room-id').popover({
	trigger: 'hover',
	html: true,
	title: '房间信息',
	content: '<p>所属：<span>广东外语外贸大学</span></p>' +
			'<p>当前/总会员：<span>123/1200</span></p>' +
			'<p>活跃：<span>2015-12-31 11:11:20</span></p>',
	placement: 'top'
});

$('.room-owner').popover({
	trigger: 'hover',
	html: true,
	title: 'TA的资料',
	content: '<p>昵称：<span>王小锤子</span></p>' +
			'<p>性别：<span>女</span></p>' +
			'<p><button type="button" class="btn btn-info btn-xs"><span class="glyphicon glyphicon-earphone"></span> 私信给TA</button></p>' +
			'<p><button type="button" class="btn btn-primary btn-xs"><span class="glyphicon glyphicon-plus"></span> 加为好友</button></p>' +
			'<p><button type="button" class="btn btn-info btn-xs"><span class="glyphicon glyphicon-earphone"></span> 讨论组</button></p>' ,
	placement: 'bottom',
	delay: {
		show: 0,
		hide: 1300
	}
});

// 展开/收起好友面板
$('#my-friends').click(function() {
	if ($('#user-friends-panel').hasClass('in')) {
		$('#room-list-wrap').removeClass('col-sm-6').addClass('col-sm-9');
		$('#container-wrap').remove($('#user-friends-panel'));
	} else {
		$('#room-list-wrap').removeClass('col-sm-9').addClass('col-sm-6');
		$('#container-wrap').append($('#user-friends-panel'));
	}
})

// 聊天面板四个功能事件绑定 
$('#user-friends-panel-menu').click(function(e) {
	e = e || window.event;
	var node = e.target || e.srcElement;

	while (node.tagName !== 'LI') {
		node = node.parentNode;
	}

	var index = node.getAttribute('data-index');
	index != '3' && $(node.parentNode).find('button').removeClass('btn-info').eq(index).addClass('btn-info');

	switch (index) {
		case '0':
			$('#history-chat-list').show();
			$('#friends-list').hide();
			$('#discussions-list').hide();
			break;
		case '1':
			$('#history-chat-list').hide();
			$('#friends-list').show();
			$('#discussions-list').hide();
			break;
		case '2':
			$('#history-chat-list').hide();
			$('#friends-list').hide();
			$('#discussions-list').show();
			break;
		case '3':
			window.open(node.getAttribute('data-href'));
			break;
		default:
			break;
	}
})

// 聊天信息右键显示
$('#history-chat-list').contextmenu(function() {
	return false;
}).find('li').popover({
	trigger: 'dblclick',
	html: true,
	content: '<ul class="list-unstyled">' +
		'<li><a href="#">发送消息</a></li>' +
		'<li><a href="#">修改备注</a></li>' +
		'<li><a href="#">删除好友</a></li>' +
		'<li><a href="#">从会话列表中移除</a></li>' +
		'<li><a href="#">访问空间</a></li>',
	placement: 'left'
});

// 修改好友组名
$('.friends-list-group-name').dblclick(function() {
	
})

// 好友分组列表icon展开列表处理
$('#friends-list').children('li').click(function() {
	var $icon = $(this).find('span').eq(0);
	if (!$(this).children('ul').hasClass('in')) {
		$icon.removeClass('glyphicon-chevron-right').addClass('glyphicon-chevron-down');
	} else {
		$icon.removeClass('glyphicon-chevron-down').addClass('glyphicon-chevron-right');
	}
})

$(window).resize(function() {
	var left = $(this).width() / 2;
	var top = $(this).height() / 2;
	$('#chat-wrapper').css({
		'left': (left - 400) + 'px',
		'top': (top - 250) + 'px',
		'margin': 0
	});
});
$(window).resize();

// 绑定聊天面板拖动事件
$('.chat-content-frame').load(function() {
	Util.bindObjsMove(true, 'chat-content-title', 'chat-wrapper');
})

// 注册登录框 
$('#modal-login-btn').click(function() {
	$(this).addClass('btn-success');
	$('#modal-register-btn').removeClass('btn-success');
	$('#modal-register-div').hide();
	$('#modal-login-div').show();
});
$('#modal-register-btn').click(function() {
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