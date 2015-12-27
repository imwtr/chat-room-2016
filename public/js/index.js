
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
})