'use strict';

const mongoose = require('mongoose');
const Schema   = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
require('../common/connectMongo');

let schema = new Schema({
	store_id      : {type : String}, //ID号
	store_name    : {type : String}, //店名
	ip            : {type : String}, //IP地址
	mac           : {type : String}, //MAC地址
	desc          : {type : String}, //描述
	port          : {type : String}, //监听端口
	heartbeat     : {type : Date},   //最新心跳时间
	begin_time    : {type : Date},   //工作开始时间
	status        : {type : Number}, //1 在线、0、 不在线
	version       : {type : Number}, //版本号
	sn            : {type : String}, //序列号
	AP_num        : {type : Number}, //ap数量
	ESL_info      : {type : String}, //标签信息
	models        : [{type : String}],//模板信息
	area          : {type : String}, //门店区域
	address       : {type : String}, //门店地址
	phone         : {type : String}, //联系电话
	contact       : {type : String}, //联系人
	group         : {type : String}, //归属总店
	passwd        : {type : String}


	
}, {collection: 'store_info', timestamps: true});

module.exports = mongoose.model('store', schema);