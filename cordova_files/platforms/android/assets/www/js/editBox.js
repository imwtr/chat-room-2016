    
    // 编辑框初始化
    function editBoxPreHandle() {
        var $editBoxEdit = $('#chat-content-editbox-edit');
        var $editBoxSend = $('#chat-content-send').find('button');

        // 编辑框中 将各表情包表情渲染至相应区域
        // tieba
        (function buildTBEmotion() {
            var tdTemp = [];
            var trTemp = [];

            for (var i = 1; i <= 6; i++) {
                tdTemp = [];
                for (var j = 1; j <= 7; j++) {
                    tdTemp.push('<td data-val="' + (i * j) + '">' +
                                    '<img src="img/emotion/tb/' + (i * j) + '.png" alt="emotion">' +
                                '</td>');
                }
                trTemp.push('<tr>' + tdTemp.join('') + '</tr>');
            }
            $('#emotion-tb').html(trTemp.join(''));
        })();

        // QQ
        (function buildQQEmotion() {
            var tdTemp = [];
            var trTemp = [];

            for (var i = 1; i <= 16; i++) {
                tdTemp = [];
                for (var j = 1; j <= 8; j++) {
                    tdTemp.push('<td data-val="' + (i * j) + '">' +
                                    '<img src="img/emotion/qq/' + (i * j) + '.gif" alt="emotion">' +
                                '</td>');
                }
                trTemp.push('<tr>' + tdTemp.join('') + '</tr>');
            }
            $('#emotion-qq').html(trTemp.join(''));
        })();

        // weixin
        (function buildWXEmotion() {
            var tdTemp = [];
            var trTemp = [];

            for (var i = 1; i <= 9; i++) {
                tdTemp = [];
                for (var j = 1; j <= 8; j++) {
                    tdTemp.push('<td data-val="' + (i * j) + '">' +
                                    '<img src="img/emotion/wx/' + (i * j) + '.png" alt="emotion">' +
                                '</td>');
                }
                trTemp.push('<tr>' + tdTemp.join('') + '</tr>');
            }
            $('#emotion-weixin').html(trTemp.join(''));
        })();

        // 颜文字
        (function buildYWZEmotion() {
            var ywz = ['✪ω✪','( ◉ืൠ◉ื)','( ◔ ڼ ◔ )' ,'(ಠ .̫.̫ ಠ)' ,'í﹏ì' ,'ㄟ(◑‿◐ )ㄏ' ,'⊙.⊙' ,'”(*´ｪ`*)”' ,'[(▰˘◡˘▰)]' ,'(●\'◡\'●)ﾉ♥' ,'(●\'◡\'●)ﾉ♥' ,'(☍﹏⁰)' ,'(｡◕ˇ∀ˇ◕）' ,'(♥◠‿◠)ﾉ' ,'~Ⴚ(●ტ●)Ⴢ~' ,'ℰ⋆‿⋆ℰ' ,'(,,Ծ‸Ծ,,)' ,'ಠ_ಠ' ,'(๑꒪◞౪◟꒪๑)' ,'｡◕‿◕｡' ,'(♩￢3￢)' ,'✷(ꇐ‿ꇐ)✷' ,'(๑°3°๑)' ,'(-_-) ' ,'o(≧口≦)o ' ,'╮(￣▽￣")╭ ' ,'╮(╯_╰)╭' ,'╮（﹀＿﹀）╭' ,'(￣y▽,￣)╭ 哎哟哟……' ,'安安啦~~~ o(*￣▽￣*)ブ ' ,'ヾ(≧O≦)〃嗷~' ,'＼(◎o◎)／ ' ,'([▽]) ' ,'(o?□?)o' ,'(￣ ‘i ￣;) ' ,'(＠_＠;)? [不懂] ' ,'（*゜ー゜*） ' ,'-(￣︶￣)-','(。_。) [低头] ' ,'(。?_?。)ノ' ,'对不起~ -(＿　＿)- ' ,'（。?＿?。）? ' ,'(⊙﹏⊙)' ,'("▔□▔) ' ,'(￣┬￣；) ' ,'[飞吻] (*￣3￣)╭ ' ,'ヾ(≧奋≦)〃' ,'(☆′益`)c ' ,'感动！o(*≧▽≦*)m ' ,'Σ(⊙▽⊙"a... ' ,'(＃°Д°)' ,'O口O!' ,'(▽) ' ,'（゜▽＾*））' ,'o(*￣▽￣*)o ' ,'＿（＿＿)ノ彡' ,'（┬＿┬' ,'o(???)o ' ,'/(ㄒoㄒ)/~~ ' ,'(┳＿┳)..' ,'o( =·ω·= )m ' ,'Ψ(￣?￣)Ψ' ,'喵~ _▽_ ' ,'=￣ω￣= ' ,'[秘密] (一-一) ' ,'[蔑视](￣_,￣ ) ' ,'[摸摸头](～￣▽￣)ノ ' ,'Σ( ￣д￣；) 你！！' ,'[念咒]（（（　(-h-)　）））' ,'(o#゜ 曲゜)o ' ,'_(￣0￣)_[哦~]' ,'ｍ(o?ω?o)ｍ' ,'Oh~ no！！！！' ,'( ^ ^) _U~~' ,'(ˉ▽￣～) 切~~' ,'o(-"-;) [我忍!]' ,'(:D)┼─┤死亡中 ' ,'...ψ(。。 )' ,'(((φ(◎ロ◎;)φ))) ' ,'W(￣_￣)W' ,'[猪]^(*￣(oo)￣)^ ' ,'(￣(エ)￣)ノ よー'];
            var tdTemp = [];
            var trTemp = [];
            
            for (var i = 1; i <= 9; i++) {
                tdTemp = [];
                for (var j = 1; j <= 9; j++) {
                    tdTemp.push('<td>' + ywz[i * j - 1] + '</td>');
                }
                trTemp.push('<tr>' + tdTemp.join('') + '</tr>');
            }
            $('#emotion-yanwenzi').html(trTemp.join(''));
        })();

        // tu
        (function buildTUEmotion() {
            var tdTemp = [];
            var trTemp = [];

            for (var i = 1; i <= 7; i++) {
                tdTemp = [];
                for (var j = 1; j <= 5; j++) {
                    tdTemp.push('<td data-val="' + (i * j) + '">' +
                                    '<img src="img/emotion/tu/' + (i * j) + '.gif" alt="emotion">' +
                                '</td>');
                }
                trTemp.push('<tr>' + tdTemp.join('') + '</tr>');
            }
            $('#emotion-tu').html(trTemp.join(''));
        })();

        // 选择菜单事件绑定  选择显示哪个表情
        $('#emotion-menu').click(function(e) {
            e = e || window.event;
            var node = e.target || e.srcElement;

            while (node && node.tagName !== 'LI') {
                node = node.parentNode;
            }

            $(node).addClass('active').siblings().removeClass('active');
            $('#emotion-wrap').find('table').hide();
            // 显示相应表情栏
            $('#emotion-' + $(node).attr('data-val')).show();
            $('#emotion-div').dropdown('toggle');
        });

        // 当点击某个表情时  把其添加到编辑框中
        $('#emotion-wrap').find('table').click(function(e) {
            e = e || window.event;
            var tableNode = node = e.target || e.srcElement;
            var tableID;
            var isTB = isQQ = isWX = isYWZ = isTU = false;

            // 先找出是哪个表情包
            while (tableNode && tableNode.tagName !== 'TABLE') {
                tableNode = tableNode.parentNode;
            }
            tableID = tableNode.getAttribute('id');
            isTB = (tableID.indexOf('tb') !== -1 ? true : false);
            isQQ = (tableID.indexOf('qq') !== -1 ? true : false);
            isWX = (tableID.indexOf('weixin') !== -1 ? true : false);
            isYWZ = (tableID.indexOf('yanwenzi') !== -1 ? true : false);
            isTU = (tableID.indexOf('tu') !== -1 ? true : false);

            // 获取相应表情
            if (node.tagName !== 'TD' && node.tagName !== 'IMG') {
                return;
            }
            node = (node.tagName === 'IMG' ? node.parentNode : node);

            // 颜文字直接取文字text   其他则取表情代号
            if (isYWZ) {
                $editBoxEdit.append($(node).text());
            } else {
                if (isTB) {
                    $editBoxEdit.append('<img data-val="#tb{' + $(node).attr('data-val') + '.png}" src="img/emotion/tb/' + $(node).attr('data-val') + '.png">');
                }
                if (isQQ) {
                    $editBoxEdit.append('<img data-val="#qq{' + $(node).attr('data-val') + '.gif}" src="img/emotion/qq/' + $(node).attr('data-val') + '.gif">');
                }
                if (isWX) {
                    $editBoxEdit.append('<img data-val="#wx{' + $(node).attr('data-val') + '.png}" src="img/emotion/wx/' + $(node).attr('data-val') + '.png">');
                }
                if (isTU) {
                    $editBoxEdit.append('<img data-val="#tu{' + $(node).attr('data-val') + '.gif}" src="img/emotion/tu/' + $(node).attr('data-val') + '.gif">');
                }
            }
        });
        
        // 快捷回复菜单点击处理
        $('#chat-content-editBox-menu').find('ol').click(function(e) {
            e = e || window.event;
            var node = e.target || e.srcElement;
            var response = {
                '1': '谢谢你哈',
                '2': '你好',
                '3': '吃饭没',
                '4': '天黑请闭眼',
                '5': 'o.o 好了好了我知道了'
            };

            if (node.tagName === 'LI') {
                $editBoxEdit.append(response[$(node).attr('data-val')]);
            }
        });


        // 设置快捷键发表
        // 首先从本地存储判断快捷键设置的情况
        (function getSendShortcut() {
            var val;
            var $ul = $('#chat-content-send').find('ul');
            var $li;
            try {
                val = window.localStorage.getItem('sendShortcut');
            } catch (e) {

            }
            if (val) {

                $ul.attr('data-val', val);
                $li = $ul.find('li[data-index="' + val + '"]');
                $li.find('span').eq(0).removeClass('glyphicon-minus').addClass('glyphicon-ok');
                $li.siblings().find('span').eq(0).removeClass('glyphicon-ok').addClass('glyphicon-minus');
            }
        })();

        $('#chat-content-send').find('ul').click(function(e) {
            e = e || window.event;
            var node = e.target || e.srcElement;

            while (node && node.tagName !== 'LI') {
                node = node.parentNode;
            }

            $(this).attr('data-val', $(node).attr('data-index'));
            try {
                window.localStorage.setItem('sendShortcut', $(node).attr('data-index'));
            } catch (e) {

            }
            $(node).find('span').eq(0).removeClass('glyphicon-minus').addClass('glyphicon-ok');
            $(node).siblings().find('span').eq(0).removeClass('glyphicon-ok').addClass('glyphicon-minus');
        });

        // 发送图片附件 处理
        // 创建新的文件输入框  为多图上传做准备
        function buildInputPic(picIndex) {
            $('#chat-form-pic').append('<input type="file" name="chat-input-pic' + picIndex + '" id="chat-input-pic' + picIndex + '">');
            // 在编辑框中预览
            $('#chat-input-pic' + picIndex).change(function() {
                    // 在编辑框中预览
                    if ($(this)[0].files && $(this)[0].files[0]) {
                        var f = $(this)[0].files[0];
                        $editBoxEdit.append('<img data-picname="#pic{' + f.name + '}" data-index="pic' + picIndex + '" src="' + window.URL.createObjectURL(f) + '" width="150px" height="150px">');
                    } else {
                        alert('抱歉，您当前的浏览器类型/版本 不支持使用此功能，请更换高级浏览器访问');
                        return false;
                    }
                    
            });
        }
        // 点击添加图片图标按钮
        var picIndex = 0;
        $('#chat-content-editBox-menu').find('button').eq(2).click(function() {
            alert('Sorry.Image upload is not supported in android platform yet.');
            return;
            buildInputPic(picIndex);
            $('#chat-input-pic' + picIndex).click();
            picIndex++;
        });
    }