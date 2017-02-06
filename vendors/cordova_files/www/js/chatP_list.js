var $getChatsMoreBtn = $('#chat-content-chats-more');

// 只在父框架中才能显示
if (!$(window.parent.document).find('#chat-wrapper').length) {
    window.location.href = 'http://closer-chat.coding.io/';
}

var $editBoxEdit = $('#chat-content-editbox-edit');
var $editBoxSend = $('#chat-content-send').find('button');
var $editBoxMenuCover = $('#editBox-menu-cover');

var cId = Util.getArgValue('id');

if (cId === null) {
    window.location.href = 'http://closer-chat.coding.io/';
}

// 用户进入房间到时候默认加载历史消息  从后往前
$getChatsMoreBtn.click(function() {
    getChats('chat', cId, parseInt($(this).attr('data-pn'), 10));
});

$getChatsMoreBtn.click();

// 编辑框初始化
editBoxPreHandle();
$editBoxSend.removeClass('disabled');
$editBoxEdit.text('').attr('contentEditable', 'true');
$editBoxMenuCover.hide();
