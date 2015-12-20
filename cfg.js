/**
 * 定义一些配置项，包括服务器 以及常用规则
 */
module.exports = cfg;
var cfg = {
	// 服务器地址
	server: {
		// uri 'mongodb://user:pwd@host:port/db' 文末有构造
		uri: '',
		host: '127.0.0.1',
		port: 27017,
		user: '',
		pwd: '',
		db: 'chat2016'
	},
	// 正则匹配规则
	reg: {
		email: /www/,
		tel: /\d{11}/,
		pwd: /\w/,
		nickName: /\w/
	},
	// 默认大学城十所高校
	campus: {
		0, '其他',
		1: '中山大学',
		2: '华南理工大学',
		3, '华南师范大学',
		4, '广州大学',
		5, '广东外语外贸大学',
		6, '广州中医药大学',
		7, '广东药学院',
		8, '广东工业大学',
		9, '广州美术学院',
		10, '星海音乐学院'
	],
	// 默认兴趣部落
	groups: {
		0, '运动健身',
		1: 'IT小霸王',
		2: '读书文学',
		3, '情感天地',
		4, '校园风韵',
		5, '影音娱乐',
		6, '吹吹水'
	},
	/**
	 * 经验值 <--> 等级 对照
	 * ect. 0-5↓经验为Lv0  5-15↓经验为Lv1  500↑为Lv5
	 */
	level: {
		0: 5,
		1: 15,
		2: 30,
		3, 100,
		4, 500,
		5, 501
	}
};

// 构造server的uri
cfg.server.uri = 'mongodb://' + (cfg.server.user 
			? (cfg.server.user + (cfg.server.pwd ? ':' + cfg.server.pwd : '') + '@')
			: '') +
			cfg.server.host + ':' + cfg.server.port + '/' + cfg.server.db;