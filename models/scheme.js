'use strict';

const mongoose = require('mongoose');
const Schema   = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
require('../common/connectMongo');

let schema = new Schema({
	
	scheme_name      : {type : String},  //策略名字
	store_type       : {type : String},  //选择商品类型  单个的类型是0，一类的商品类型为1，全部的商品类型为2
	scheme_type      : {type : String},  //策略类型
	scheme_sales     : {type : String},  //策略商品
	scheme_price     : {type : String},  //策略修改的价格
	start_time       : {type : Date},    //价格生效开始时间
	end_time         : {type : Date},    //价格生效结束时间
	cycle_time       : {type : Date},    //周期时间
	barcode          : {type : String},  //商品码
	category         : {type : String}   //商品分类


	
}, {collection: 'scheme_info', timestamps: true});

module.exports = mongoose.model('scheme', schema);