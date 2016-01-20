// room_list
// global.modelHandle('room').findOne({
	// 	rId: rId
	// }, function(err, data) {
	// 	if (err) {
	// 		console.log(err);
	// 	} else {
	// 		if (data) {
	// 			json.rId = data.rId;
	// 			json.rName = data.rName;
	// 			json.rImage = data.rImage;
	// 			json.rDesc = data.rDesc;
	// 			json.rCurCount = data.rCurCount;
	// 			json.rOwner = {};
	// 			json.rManagers = [];
	// 			var rManagersId = data.rManagersId;
	// 			for (var i = 0; i < rManagersId.length; i++) {
	// 				json.rManagers[i] = {};
	// 			}
				
	// 			// 获取房间所属分类信息
	// 			global.modelHandle('area').findOne({
	// 				aId: data.rBelongToID
	// 			}, function(err, data) {
	// 				if (err) {
	// 					console.log(err);
	// 				} else {
	// 					if (data) {
	// 						json.rBelongTo = data.aName;
	// 					}
	// 				}
	// 			});

	// 			// 判断目前登录中到用户是否已关注此房间
	// 			if (isLogin) {
	// 				global.modelHandle('user').findOne({
	// 					uId: req.session.uId
	// 				}, function(err, data) {
	// 					if (err) {
	// 						console.log(err);
	// 					} else {
	// 						if (data) {
	// 							// 存在
	// 							if (data.likeRID.indexOf(rId) !== -1) {
	// 								json.isLiked = 1;  // 登录的用户已关注
	// 							} else {
	// 								json.isLiked = 0;  // 登录到用户未关注
	// 							}
	// 						}
	// 					}
	// 				});
	// 			} else {
	// 				json.isLiked = -1; // 未登录的用户
	// 			}
				

	// 			// 获取房主信息
	// 			global.modelHandle('user').findOne({
	// 				uId: data.rOwnerId
	// 			}, function(err, data) {
	// 				if (err) {
	// 					console.log(err);
	// 				} else {
	// 					if (data) {
	// 						json.rOwner.uId = data.uId;
	// 						json.rOwner.uNickName = data.uNickName;
	// 						json.rOwner.uSex = data.uSex;
	// 					}
	// 				}
	// 			});

	// 			// 获取管理员信息
	// 			for (var i = 0; i < rManagersId.length; i++) {
	// 				(function(_i) {
	// 					global.modelHandle('user').findOne({
	// 						uId: rManagersId[_i]
	// 					}, function(err, data) {
	// 						if (err) {
	// 							console.log(err);
	// 						} else {
	// 							if (data) {
	// 								json.rManagers[_i].uId = data.uId;
	// 								json.rManagers[_i].uNickName = data.uNickName;
	// 								json.rManagers[_i].uSex = data.uSex;
	// 							}
	// 						}

	// 						// 当执行完最后一个查询时再返回
	// 						if (_i === rManagersId.length - 1) {
	// 							status = 1;
	// 							json.status = status;
	// 							res.json(json);
	// 						}
		
	// 					});
	// 				})(i);
					
	// 			}
				
	// 		}
	// 	}
	// });
	// 
	// 

// index
// 
// global.modelHandle('room').find(condition, function(err, data) {
	// 	if (err) {
	// 		console.log(err);
	// 	} else {
	// 		// 先获取总数
	// 		var rTotal = data.length;

	// 		// 再根据pn值获取该页数据
	// 		global.modelHandle('room').find(condition, function(err, data) {
	// 			if (err) {
	// 				console.log(err);
	// 			} else {
	// 				// 再根据房间房主id获取房主信息 & 房间所属
	// 				for (var i = 0, j = data.length; i < j; i++) {
	// 					data[i].rTotal = rTotal;
	// 					// 房主信息
	// 					(function(_i) {
	// 						global.modelHandle('user').findOne({
	// 							uId: data[_i].rOwnerId
	// 						}, function(err, _data) {
	// 							if (err) {
	// 								console.log(err);
	// 							} else {
	// 								data[_i].uNickName = _data.uNickName;
	// 								data[_i].uSex = _data.uSex;
	// 							}
	// 						});		
	// 						// 房间所属信息
	// 						global.modelHandle('area').findOne({
	// 							aId: data[_i].rBelongToID
	// 						}, function(err, _data) {
	// 							if (err) {
	// 								console.log(err);
	// 							} else {
	// 								data[_i].aName = _data.aName;

	// 								// 获取完数据再返回
	// 								if (_i == data.length - 1) {
	// 									res.json(data);
	// 								}
	// 							}
	// 						});			
	// 					})(i);
	// 				}
	// 			}
	// 		})
	// 		.sort({
	// 			'rCurCount': -1
	// 		})
	// 		.skip((pn - 1) * pSize)
	// 		.limit(pSize);

	// 	}
	// });