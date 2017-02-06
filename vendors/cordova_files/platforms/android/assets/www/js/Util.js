/**
 * 一些常用的函数方法封装
 */



var Util = {
    /**
     * 事件绑定
     * @param element HTMLElement 元素节点
     * @param type String 事件名称
     * @param handler Funciton 事件执行的函数
     */
    addEvent: function(element, type, handler) {
        if (!element) {
            return;
        }

        if (element instanceof Array) {
            for (var i = 0, j = element.length; i < j; i++) {
                this.addEvent(element[i], type, handler);
            }
        }

        if (type instanceof Array) {
            for (var i = 0, j = type.length; i < j; i++) {
                this.addEvent(element, type[i], handler);
            }
        }

        if (element.addEventListener) {
            element.addEventListener(type, handler, false);
        } else if (element.attachEvent) {
            element.attachEvent('on' + type, function() {
                handler.call(element);
            });
        } else {
            element['on' + type] = handler;
        }
    },
    /**
     * 事件移除
     * @param element HTMLElement 元素节点
     * @param type String 事件名称
     * @param handler Funciton 事件执行的函数
     */
    removeEvent: function(element, type, handler) {
        if (!element) {
            return;
        }

        if (element instanceof Array) {
            for (var i = 0, j = element.length; i < j; i++) {
                this.removeEvent(element[i], type, handler);
            }
        }

        if (type instanceof Array) {
            for (var i = 0, j = type.length; i < j; i++) {
                this.removeEvent(element, type[i], handler);
            }
        }

        if (element.removeEventListener) {
            element.removeEventListener(type, handler, false);
        } else if (element.detachEvent) {
            element.detachEvent('on' + type, function() {
                handler.call(element);
            });
        } else {
            element['on' + type] = null;
        }
    },
    /**
     * 事件冒泡阻止
     * @param event EVENTOBJ 事件对象
     */
    stopPropagation: function(event) {
        if (event.preventDefault) {
            event.preventDefault();
        } else {
            event.returnValue = false;
        }
    },
    /**
     * 获取事件对象
     * @param  event EVENTOBJ 事件对象
     * @return EVENTOBJ 事件对象
     */
    getEvent: function(event) {
        return event || window.event;
    },
    /**
     * 获取事件的目标DOM
     * @param  event EVENTOBJ 事件对象
     * @return HTMLElement 对象
     */
    getTarget: function(event) {
        return event.target || event.srcElement;
    },
    /**
     * 获取鼠标坐标
     * @param  event EVENTOBJ 事件对象
     * @return Object 当前鼠标坐标
     */
    getCoords: function(event) {
        if (event.pageX || event.pageY) {
            return {
                x: event.pageX,
                y: event.pageY
            };
        } else if (event.x || event.y) {
            return {
                x: event.x,
                y: event.y
            };
        }

        var doc = document.compatMode === 'BackCompat' 
            ? document.body
            : document.documentElement;
        return {
            x: event.clientX + doc.scrollLect - doc.clientLeft,
            y: event.clientY + doc.scrollTop - doc.clientTop
        };
    },
    /**
     * ajax操作简易版
     * @param  method String 请求方法类型
     * @param  url String  请求地址
     * @param  async Boolean 是否异步
     * @param  info Object 请求带的参数数据
     * @param  callback Funciton 请求成功的回调函数
     * @return 
     */
    ajax: function(method, url, async, info, callback) {
        var xhr;
        (function xhrMaker(){
            try {
                xhr = new XMLHTTPRequest();
            } catch (e) {
                try {
                    xhr = new ActiveXObject('Msxml2.XMLHTTP');
                } catch (e) {
                    try {
                        xhr = new ActiveXObject('Microsoft.XMLHTTP');
                    } catch (e) {
                        xhr = null;
                    }
                }
            }
        })();

        if (!xhr) {
            return;
        }

        xhr.open(method, url, async);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    callback(xhr.responseText);
                }
            }
        };

        if (method.toUpperCase() === 'POST') {
            xhr.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
        }

        xhr.send(Util.serialize(info));
    },
    /**
     * 序列化参数
     * @param  data Object 要序列化的json数据
     * @return String 字符串形式的数据
     */
    serialize: function(data) {
        var str = [];
        for (var item in data) {
            if (data.hasOwnProperty(item)) {
                str.push(item + '=' + data[item]);
            }
        }
        return str.join('&');
    },
    // 获取text
    getText: function(element) {
        return element.textContent || element.innerText;
    },
    // 设置text
    setText: function(element, text) {
        if (element.textContent) {
            element.textContent = text;
        } else {
            element.innerText = text;
        }
    },
    // 动态加载脚本文件
    addScript: function(src) {
        var script = document.createElement('script');
        script.type = 'text/javascipt';
        script.src = src;
        document.body.appendChild(script);
    },
    // 获取url参数对应值
    getArgValue: function(arg) {
        var search = location.href.slice(location.href.indexOf('?') + 1);
        if (!search) {
            return null;
        }

        var items = search.split('&');

        for (var i = 0, j = items.length; i < j; i++) {
            var item = items[i].split('=');
            if (item[0] === arg) {
                return item[1];
            } 
        }

        return null;
    },
    // xss 过滤
    xss: function(str, type) {
        // 空过滤
        if (!str) {
            return str === 0 ? '0' : '';
        }

        switch (type) {
            case 'none': // 过度方案
                return '' + str;
                break;

            case 'html': // 过滤html字符串中的xss
                return str.replace(/[&'"<>\/\\\-\x00-\x09\x0b-\x0c\x1f\x80-\xff]/g, function(r){
                    return '&#' + r.charCodeAt(0) + ';';
                }).replace(/ /g, '&nbsp;').replace(/\r\n/g, '<br />').replace(/\n/g,'<br />').replace(/\r/g,'<br />');
                break;

            case 'htmlEp': // 过滤DOM节点属性中的XSS
                return str.replace(/[&'"<>\/\\\-\x00-\x1f\x80-\xff]/g, function(r){
                    return '&#' + r.charCodeAt(0) + ';';
                });
                break;

            case 'url': // 过滤url
                return escape(str).replace(/\+/g, '%2B');
                break;

            case 'miniUrl':
                return str.replace(/%/g, '%25');
                break;

            case 'script':
                return str.replace(/[\\"']/g, function(r){
                    return '\\' + r;
                }).replace(/%/g, '\\x25').replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\x01/g, '\\x01');
                break;

            case 'reg':
                return str.replace(/[\\\^\$\*\+\?\{\}\.\(\)\[\]]/g, function(a){
                    return '\\' + a;
                });
                break;

            default:
                return escape(str).replace(/[&'"<>\/\\\-\x00-\x09\x0b-\x0c\x1f\x80-\xff]/g, function(r){
                    return '&#' + r.charCodeAt(0) + ';';
                }).replace(/ /g, '&nbsp;').replace(/\r\n/g, '<br />').replace(/\n/g,'<br />').replace(/\r/g,'<br />');
                break; 
        }
    },
    // html解码
    decodeHtml: function(content) {
        if (content == null) {
            return '';
        }

        return Util.strReplace(content, {
            "&amp;" : '&',
            "&quot;" : '\"',
            "\\'" : '\'',
            "&lt;" : '<',
            "&gt;" : '>',
            "&nbsp;" : ' ',
            "&#39;" : '\'',
            "&#09;" : '\t',
            "&#40;" : '(',
            "&#41;" : ')',
            "&#42;" : '*',
            "&#43;" : '+',
            "&#44;" : ',',
            "&#45;" : '-',
            "&#46;" : '.',
            "&#47;" : '/',
            "&#63;" : '?',
            "&#92;" : '\\',
            "<BR>" : '\n'
        });
    },

    // 字符串替换
    strReplace: function(str, re, rt) {
        if (rt != undefined) {
            replace(re, rt);
        } else {
            for (var key in re) {
                replace(key, re[key]);
            }
        }

        function replace(a, b) {
            var arr = str.split(a);
            str = arr.join(b);
        }

        return str;
    },

    // 格式化时间
    formatDate: function(date, formatStr) {
        var arrWeek = ['日','一','二','三','四','五','六'];
       
        var str = formatStr.replace(/yyyy|YYYY/, date.getFullYear())
                .replace(/yy|YY/, Util.addZero(date.getFullYear() % 100, 2) )
                .replace(/mm|MM/, Util.addZero(date.getMonth() + 1, 2))
                .replace(/m|M/g, date.getMonth() + 1)
                .replace(/dd|DD/, Util.addZero(date.getDate(), 2) )
                .replace(/d|D/g, date.getDate())
                .replace(/hh|HH/, Util.addZero(date.getHours(), 2))
                .replace(/h|H/g, date.getHours())
                .replace(/ii|II/, Util.addZero(date.getMinutes(), 2))
                .replace(/i|I/g, date.getMinutes())
                .replace(/ss|SS/, Util.addZero(date.getSeconds(), 2))
                .replace(/s|S/g, date.getSeconds())
                .replace(/w/g, date.getDay())
                .replace(/W/g, arrWeek[date.getDay()]);
        return str;
    },

    // 前补0
    addZero: function(v, size) {
        for(var i = 0,len = size - (v + '').length; i < len; i++) {
            v = '0' + v;
        }
        return v + '';
    },
    /**
     * 根据cookie名称获取相应值
     * @param  name String cookie名称
     * @return String cookie值
     */
    getCookie: function(name) {
        var reg = new RegExp('(^| )' + name + '(?:=([^;]*))?(;|$)');
        var val = document.cookie.match(reg);
        return val ? (val[2] ? unescape(val[2]) : '') : '';
    },
    /**
     * 设置cookie
     * @param name String cookie名称
     * @param value String cookie值
     * @param expires Number 过期时间（分钟）
     * @param domain String 域
     * @param path String 路径
     * @param secure Boolean 是否设置为安全
     */
    setCookie: function(name, value, expires, path, domain, secure) {
        if (!name || !value) {
            return;
        }

        var exp = new Date(),
            expires = arguments[2] || null,
            path = arguments[3] || '/',
            domain = arguments[4] || null,
            secure = arguments[5] || false;
        expires ? exp.setMinutes(exp.getMinutes() + parseInt(expires)) : '';

        document.cookie = name + '=' + escape(value) + 
            (expires ? ';expires=' + exp.toGMTString() : '') +
            (path ? ';path=' + path : '') +
            (domain ? ';domain=' + domain : '') +
            (secure ? ';secure' : '');
    },
    /**
     * 删除cookie
     * @param name String cookie名称
     * @param domain String 域
     * @param path String 路径
     * @param secure Boolean 是否设置为安全
     */
    delCookie: function(name, path, domain, secure) {
        var val = Util.getCookie(name);

        if (val) {
            var exp = new Date(),
                path = path || '/';
                exp.setMinutes(exp.getMinutes() - 1000);
                

            document.cookie = name + '=;expires=' + exp.toGMTString() +
                (path ? ';path=' + path : '') +
                (domain ? ';domain=' + domain : '') +
                (secure ? ';secure' : '');
        }
    },

    /**
     * 移动DOM对象节点
     * @param  {[type]} curDom    当前触发事件的dom对象
     * @param  {[type]} targetDom 触发移动操作后将要移动的dom对象
     */
    bindObjMove: function(curDom, targetDom, tag) {
        if (!curDom || !targetDom) {
            return;
        }
        var curPos = diffPos = [];

        curDom.onmousedown = function(e) {
            e = e || window.event;
            curPos = [
                targetDom.offsetLeft,
                targetDom.offsetTop
                // parseInt(targetDom.style.left, 10) ? parseInt(targetDom.style.left, 10) : 0,
                // parseInt(targetDom.style.top, 10) ? parseInt(targetDom.style.top, 10) : 0
            ];
        
            diffPos = [
                Util.getMousePosition(e)[0] - curPos[0],
                Util.getMousePosition(e)[1] - curPos[1]
            ];
            curDom.onmouseup = function() {
                curDom.onmousemove = null;
            };
            curDom.onmousemove = function(e) {
                try {
                    var e = e || window.event;
                    if (tag === 'modal') {
                        targetDom.style.position = 'absolute';
                    }
                    targetDom.style.marginLeft = '0px';
                    targetDom.style.marginTop = '0px';
                    targetDom.style.left = (Util.getMousePosition(e)[0] - diffPos[0]) + 'px';
                    targetDom.style.top = Util.getMousePosition(e)[1] - diffPos[1] + 'px';
                } catch (e) {
                    console.log(e);
                }
            };
            return false;
        };  
    },

    /* 获取鼠标坐标 */
    getMousePosition: function(e) {
        e = e || window.event;
        var pos = [];

        if (typeof e.pageX != 'undefined') {
            pos = [e.pageX, e.pageY];
        } else if (typeof e.clientX != 'undefined') {
            pos = [e.clientX + Util.getScrollPosition()[0], e.clientY + Util.getScrollPosition()[1]];
        }

        return pos;
    },

    /* 获取滚动条位置 */
    getScrollPosition: function(e) {
        var scrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft;
        var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        return [
            scrollLeft ? scrollLeft : 0,
            scrollTop ? scrollTop : 0
        ];
    }
        
};

try {
    module.exports = Util;
} catch (e) {
    
}