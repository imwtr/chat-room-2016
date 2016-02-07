/**
 * 数据库模型
 */
module.exports = {
    // 房间
    room: {
        rId: Number, // 房间ID
        rName: String, // 房间名称
        rOwnerId: Number, // 房主id
        rUserId: Array, // 房间的会员
        rCreatTime: String, // 房间创建日期
        rLastTime: String, // 房间最后活跃时间
        rDesc: String, // 房间描述
        rImage: String, // 房间图片
        rManagersId: Array, // 房间管理员
        rBelongToID: Number, // 房间所属大区
        rTotalCount: {type: Number, default: 0}, // 房间总会员数
        rCurCount: {type: Number, default: 0}, // 房间当前在线人数
        uNickName: String,
        uSignature: String, // 用户签名
        uSex: String,
        aName: String,
        rTotal: Number,
        uLoginState: String,
        uIsFriends: Boolean, // 用户是否为好友
        uIsSelf: Boolean // 查询对象是否为自己
    },
    // 讨论组
    group: {
        gId: Number, // 讨论组ID
        gName: String, // 讨论组名称
        gUserId: Array, // 讨论组成员ID
        gCount: {
            type: Number, // 讨论组成员数量
            default: 2
        },
        gTime: String, // 讨论组创建时间
        lastUser: String, // 最后发表的用户
        lastMsg: String, // 最后发表用户的相应msg
        cUserId: Number,
        cDetail: String,
        cTime: String,
        cId: Number,
        uId: Number,
        uNickName: String,
        uSex: String,
        uImage: String,
        uLoginState: String,
        uIsFriends: Boolean,
        uIsSelf: Boolean,
        cBelongToID: String,
        uSignature: String, // 用户签名
    },

    // 用户好友的组别
    usergroup: {
        ugId: Number, // 组别ID
        ugName: String, // 组别名称
        ugUsersId: Array, // 该组所有的用户ID
        ugBelongToID: Number // 该组所属到用户ID
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
        uFriendsId: Array, // 用户的好友
        uLoginState: {
            type: String, // 用户是否登录状态
            default: 'down'
        },
        isSelfHide: String,
        addUHide: String,
        delUHide: String,
        uIsFriends: Boolean, // 用户是否为好友
        uIsSelf: Boolean, // 查询对象是否为自己
        uSignature: String, // 用户签名
        likeRID: Array // 用户关注的聊天室
    },

    // 区域
    area: {
        aId: Number, // 区域ID
        aRoomsId: Array, // 区域的房间
        aName: String, // 区域名
        aCount: Number // 区域在线会员数
    },

    // 聊天记录
    chat: {
        cId: Number, // 聊天记录ID  
        cBelongToID: String, // 所属房间 [群聊：room_id ][讨论组：chat_id][私聊：chat_id_id]
        cUserId: Number, // 所属用户
        cTime: String, // 创建时间
        cDetail: String, // 信息内容
        cShow: {
            type: Number, // 用于讨论组或好友消息是否在好友面板显示  1显示  0不显示
            default: 1
        },
        uSignature: String, // 用户签名
        uId: Number,
        uNickName: String,
        uImage: String,
        uSex: String,
        uLoginState: String,
        uIsFriends: Boolean, // 用户是否为好友
        uIsSelf: Boolean // 查询对象是否为自己
    }
};