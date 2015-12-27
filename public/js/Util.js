/**
 * 一些常用的函数方法封装
 */

module.exports = Util;

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
		}

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
		var search = location.href.slice(location.href.indexOf('?'));
		if (!search) {
			return;
		}

		var items = search.split('&');

		for (var i = 0, j = items.length; i < j; i++) {
			var item = items[i].split('=');
			if (item[0] === arg) {
				return item[1];
			} 
		}

		return '';
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
				exp.setMinutes(exp.getMinutes() - 1000),
				path = path || '/';

			document.cookie = name + '=;expires=' + exp.toGMTString() +
				(path ? ';path=' + path : '') +
				(domain ? ';domain=' + domain : '') +
				(secure ? ';secure' : '');
		}
	}
		
};