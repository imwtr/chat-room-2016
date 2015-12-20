/**
 * 数据库模型
 */
module.exports = {
	// 房间
	room: {
		rId: Number, // 房间ID
		rName: String, // 房间名称
		rOwnerId: Number, // 房主id
		rUsersId: Array, // 房间的会员
		rCreateTime: String, // 房间创建日期
		rLastTime: String, // 房间最后活跃时间
		rDesc: String, // 房间描述
		rImage: String, // 房间图片
		rManagersId: Array, // 房间管理员
		rBelongToID: Number, // 房间所属大区
		rTotalCount: Number, // 房间总会员数
		rCurCount: Number // 房间当前在线人数
	},

	// 用户
	user: {
		uId: Number, // 用户ID
		uRoomsId: Array, // 用户所属的房间
		uCreateTime: String, // 用户创建时间
		uLastTime: String, // 用户最后活跃时间
		uImage: String, // 用户头像
		uNickName: String, // 用户昵称
		uSex: String, // 用户性别
		uEmail: String, // 用户邮箱
		uTel: String, // 用户手机号
		uPassword: String, // 用户密码
		uAddress: String, // 用户地址
		uDesc: String, // 用户个人描述
		uIsOwner: Boolean, // 是否为房主
		uIsManager: Boolean, // 是否为管理员
		uFriendsId: Array // 用户的好友
	},

	// 区域
	area: {
		aId: Number, // 区域ID
		aRoomsId: Array, // 区域的房间
		aName: String, // 区域名
		aCount: Number // 区域在线会员数
	},

	// 聊天记录
	chats: {
		cId: Number, // 聊天记录ID
		cRoomId: Number, // 所属房间
		cUserId: Number, // 所属用户
		cTime: String, // 创建时间
		cDetail: String // 信息内容
	}
};