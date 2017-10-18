'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
require('../common/connectMongo');

let schema = new Schema({
	group_name      : {type : String}, //总店名
	barcode         : {type : String}, //商品码   （Code）
	name            : {type : String}, //商品名称（TradeName）
	sale_price      : {type : Number}, //商品价格（CurPrice）
	original_price  : {type : Number}, //原价价格（OriginalPrice）
	reduction_reason: {type : String}, //促销原因 （ReductionReason）
	leaguer_price   : {type : Number}, //会员价格（ClubPrice）
	unit            : {type : String}, //单位 (UnitScript)
	discount_node   : {type : String},//打折（DiscountNode）
	origin          : {type : String}, //产地 (Madein) 
	level           : {type : String}, //合格 (ClassNum)
	specification   : {type : String}, //规格,体积(Specification)
	category        : {type : String}, //分类（Category）
	put_style       : {type : String}, //风格 (PutStyle)
	locate_str      : {type : String}, //位置 (LocateStr)
	inner_code      : {type : String}, //店内码(InnerCode)	
	promotion_start : {type : Date},   //促销开始时间(StartDate)
	promotion_end   : {type : Date},   //促销结束时间(EndDate)
	qrcode          : {type : String}, //二维码网址 (code2D)
	
	price_employee  : {type : String},  //价格员名字（pricer）
	supper_telphone : {type  :String}, //监督电话（suppertelphone）
	print_date      : {type  :Date},   //出厂日期（printdate）
	exhibition      : {type : String}, //存放
	shelf_position  : {type : String}, //货架号
	inventory       : {type : String}, //库存
	supplier        : {type : String}, //供应商
	ad_url          : {type : String}  //广告地址
}, {collection: 'sales_info', timestamps: true});

module.exports = mongoose.model('sales', schema);