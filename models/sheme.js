'use strict';

const mongoose = require('mongoose');
const Schema   = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
require('../common/connectMongo');

let schema = new Schema({
	store_id         : {type : String},
	scheme_name      : {type : String},  //策略名字
	sku_type         : {type : Number},  //选择商品类型  单个的类型是1，一类的商品类型为2，全部的商品类型为0
	barcode          : {type : String},  //商品码
	category         : {type : String},  //商品分类
	scheme_price     : {type : Number},  //策略修改的价格
	scheme_discount  : {type : Number},  //策略修改的折扣
	scheme_type      : {type : Number},  //策略类型     1 时间点 2 时间段 3 时间周期 4保质期	5、库存 6、销量
	start_time       : {type : Date},    //价格生效开始时间
	end_time         : {type : Date},    //价格生效结束时间
	cycle_time       : {type : Number}   //周期时间



	
}, {collection: 'scheme_info', timestamps: true});

module.exports = mongoose.model('scheme', schema);