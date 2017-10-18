'use strict';

const mongoose = require('mongoose');
const Schema   = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
require('../common/connectMongo');

let schema = new Schema({
	req_id          : {type : String}, //最新的请求ID
	store_id        : {type : String}, //商店ID
	status          : {type : Number}, //绑定的状态  1 绑定 2 开始更新 3、正在更新 4、显示 5、失败
	barcode         : {type : String}, //sku
	model           : {type : String}, //使用中的模板
	shelf_num       : {type : String}, //货架号  
	sale_price      : {type : Number}, //商品价格（CurPrice）
	original_price  : {type : Number}, //原价价格（OriginalPrice）
	leaguer_price   : {type : Number}  //会员价格（ClubPrice)
}, {collection: 'bind_info', timestamps: true});

module.exports = mongoose.model('bind', schema);