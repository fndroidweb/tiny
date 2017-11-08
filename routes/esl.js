'use strict';

const formidable = require('formidable');
const xlsx       = require('node-xlsx');
const fs         = require('fs');
const tcp        = require('./tcp.js');
const _          = require('lodash');
const config     = require('config');
const esl        = require('../controller/esl.js');
const session    = require('../common/session');
const log_sku    = require('../common/logger').sku;
const ErrCode    = config.ErrCode; 
const util       = require('../common/util');

/**
 *  添加策略
 *  @params token       分店登陆验证
 *  @params name        策略名
 *  @params sku_type    商品类型 0 全部 1 单个 2 一类
 *  @params barcode     单个 条形码
 *  @params category    一类 类名
 *  @params start_time  开始时间（时间戳）
 *  @params end_time    结束时间（时间戳）
 *  @params cycle_time  循环时间 (分钟) 
 *  @params scheme_type 策略类型 
 *  @params price       价格
 *  @params discount    折扣 
 */
exports.addScheme = (request,response) =>{
	let errCode = null;
	let infos = {};
	let store_id = session.getUser(request.body.token);
	log_sku.info('add scheme start', request.body);
	let SKUTYPE = ['', '单个', '一类'];
	let SHEMETYPE = ['', '时间点', '时间段', '时间周期', '保质期', '库存', '销量'];
	let reg = /^1\d{9}$/;
	let testDate = (date) => {
		if (date && reg.test(date)) {
			return true;
		} else {
			return false;
		}
	}
	let testNumber = (number) => {
		if (number && !isNaN(number)) {
			return true;
		} else {
			return false;
		}
	}

	if (!store_id) {
		errCode = 607;
	} else if (!request.body.name) {
		errCode = 901;
	} else if ( !testNumber(request.body.scheme_type) || !SHEMETYPE[+request.body.scheme_type]) {
		errCode = 903;
	} 
	infos.store_id    = store_id;
	infos.scheme_name = request.body.name;
	infos.scheme_type = +request.body.scheme_type;
	if (infos.scheme_type == 1) {
		if (testDate(request.body.start_time)) {
			infos.start_time = new Date(+request.body.start_time*1000);
		} else {
			errCode = 906;
		}
	} else if(infos.scheme_type == 2) {
		if (testDate(request.body.start_time) && testDate(request.body.end_time)) {
			infos.start_time = new Date(+request.body.start_time*1000);
			infos.end_time = new Date(+request.body.end_time*1000);
		} else {
			errCode = 907;
		}
	} else if(infos.scheme_type == 3){
		if (testDate(request.body.start_time) && testDate(request.body.end_time) && testNumber(request.body.cycle_time)){
			infos.start_time = new Date(+request.body.start_time*1000);
			infos.end_time   = new Date(+request.body.end_time*1000);
			infos.cycle_time = +request.body.cycle_time;
		} else {
			errCode = 908;
		}	
	}

	if (testNumber(request.body.sku_type) && SKUTYPE[+request.body.sku_type]) {
		infos.sku_type = +request.body.sku_type;
		if (infos.sku_type == 1 && request.body.barcode) {
			infos.barcode = request.body.barcode;
		} else if (infos.sku_type == 2 && request.body.category) {
			infos.category = request.body.category;
		} else {
			errCode = 904;
		}
	} else {
		infos.sku_type = 0;
	}

	if (testNumber(request.body.price)) {
		infos.scheme_price = request.body.price;
	} else if (testNumber(request.body.discount) && +request.body.discount < 1) {
		infos.scheme_discount = +request.body.discount;
	} else {
		errCode = 805;
	}

	if(errCode){
		response.status(200).send({
			result_code : errCode,
			result_msg  : ErrCode[errCode]
		});
		return;
	};

	esl.addScheme(infos, (err, data) => {
		if(err){
			response.status(200).send({
				result_code : err,
				result_msg  : ErrCode[err]
			});
		} else {
			response.status(200).send({
				result_code : 200,
				result_msg  : 'save sheme successfully'	
			});
		}
	});
}

exports.getScheme = (request,response) =>{
	let errCode = null;
	let infos = {};
	let store_id = session.getUser(request.query.token);	
	if (!store_id) {
		errCode = 607;
	} 
	if (errCode) {
		response.status(200).send({
			result_code : errCode,
			result_msg  : ErrCode[errCode]
		});
		return;
	};
	infos.store_id = store_id;
	esl.getScheme(infos, (err, data) => {
		if(err){
			response.status(200).send({
				result_code : err,
				result_msg  : ErrCode[err]
			});
		} else {
			response.status(200).send({
				result_code : 200,
				result_msg  : data	
			});
		}
	});
}

exports.deleteScheme = (request,response) =>{
	let errCode = null;
	let infos = {};
	let store_id = session.getUser(request.body.token);	
	if (!store_id) {
		errCode = 607;
	} else if (!request.body.name)
	if (errCode) {
		response.status(200).send({
			result_code : errCode,
			result_msg  : ErrCode[errCode]
		});
		return;
	};
	infos.store_id = store_id;
	infos.scheme_name = request.body.name;
	esl.deleteScheme(infos, (err, data) => {
		if(err){
			response.status(200).send({
				result_code : err,
				result_msg  : ErrCode[err]
			});
		} else {
			response.status(200).send({
				result_code : 200,
				result_msg  : 'delte scheme successfully'	
			});
		}
	});
}

exports.searchSalesInfo = (request,response) =>{
	let errCode = null;
	let infos = {};
	if (!request.query.barcode) {
		errCode = 803;
	};
	if (errCode) {
		response.status(200).send({
			result_code : errCode,
			result_msg  : ErrCode[errCode]
		});
		return;
	};

	infos.barcode   =  request.query.barcode;
	esl.searchSalesInfo(infos, (err, data) => {
		if(err){
			response.status(200).send({
				result_code : err,
				result_msg  : ErrCode[err]
			});
		} else {
			response.status(200).send({
				result_code : 200,
				result_msg  : data	
			});
		}
	});
}

exports.changePrice = (request,response) =>{
	let errCode = null;
	let group = session.getUser(request.body.token);
	let infos = {group};
	if (!group) {
		errCode = 607;
	} else if(!request.body.barcode) {
		errCode = 803;
	} else if (!request.body.price || isNaN(request.body.price)) {
		errCode = 805;
	};
	if (errCode) {
		response.status(200).send({
			result_code : errCode,
			result_msg  : ErrCode[errCode]
		});
		return;

	};
	infos.barcode   =  request.body.barcode;
	infos.price     =  +request.body.price;
	esl.changePrice(infos, (err, data, count) => {
		if(err){
			response.status(200).send({
				result_code : err,
				result_msg  : ErrCode[err]
			});
		} else {
			response.status(200).send({
				result_code : 200,
				result_msg  : `change price successfully for ${count} stores`,
				req_id      : data
			});
		}
	});

}

exports.getMp4url = (request,response) =>{
	let errCode = null;
	let infos = {
		barcode  : request.query.barcode
		
	};
	if (!request.query.barcode ) {
		errCode = 801;
	} 

	esl.getMp4url(infos, (err, data) => {
		if(err){
			console.log(data);
			response.status(200).send({
				result_code : err,
				result_msg  : ErrCode[err]
			});
		}else{
			response.status(200).send({
				result_code : 200,
				result_msg  : data
				

			});
		}

	});

}
exports.uploadMp4 = (request,response) =>{
	let errMsg = null;
	let infos = {};
	var form = new formidable.IncomingForm();
	form.multiples = true;
	form.encoding = 'utf-8';
	form.uploadDir = './public';
	form.keepExtensions = true;
	form.maxFieldsSize = 2 * 1024 * 1024;
	form.parse(request,(err,fields,files) =>{
		if(errMsg){
			response.status(200).send({
				result_code : 500,
				result_msg : errMsg,

			});
			util.deleteFile(files);
			return;
		}
		infos.barcode = fields.barcode;

		esl.uploadMp4(fields,files,(err,data) =>{


			if(err){
				response.status(200).send({
					result_code :err,
					result_msg : data
				});
				util.deleteFile(files);
			}else{
				response.status(200).send({
					result_code : 200,
					result_msg : data
					

				});
			}

		});

	});

}
/**
* 分店上传商品列表
*
*
*
*
**/
exports.uploadStorefile =(request, response) =>{
	let errCode = 0;

	let infos = {};
	var form = new formidable.IncomingForm();
	form.multiples = true;
	form.encoding = 'utf-8';
	form.uploadDir = './public';
	form.keepExtensions = true;
	form.maxFieldsSize = 2 * 1024 * 1024;
	form.parse(request, (err, fields, files) => {
		let store_id =  session.getUser(fields.token);
		log_sku.info('uploadExcell start', store_id, fields);
		let obj      = null;
		if (!store_id) {
			errCode = 607;
		} else if (!files.sale || !files.sale.size) {
			errCode = 611;
		} else if (files.sale.type != 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
			errCode = 611;
		}

		try {
			obj = xlsx.parse(files.sale.path);
		} catch (e) {
			errCode = 612;
		}

		if (errCode) {
			response.status(200).send({
				result_code : errCode,
				result_msg : ErrCode[errCode]
			});
			return;
			util.deleteFile(files);
		}	

		esl.uploadStorefile(obj[0].data, store_id,(err, data, req_id) => {
			log_sku.info('uploadExcell finished', err, data, req_id);
			if(err){
				response.status(200).send({
					result_code : err,
					result_msg  : ErrCode[err]
				});
			}else{
				response.status(200).send({
					result_code : 200,
					result_msg  : data,
					req_id      : req_id
				});
			}
			util.deleteFile(files);
		});
	});





}

/**
  *	上传商品列表
  * @params   token  总店登入认证
  * @params   sale   excel文件
  */
exports.uploadExcell = (request, response) => {
	let errCode = 0;

	let infos = {};
	var form = new formidable.IncomingForm();
	form.multiples = true;
	form.encoding = 'utf-8';
	form.uploadDir = './public';
	form.keepExtensions = true;
	form.maxFieldsSize = 2 * 1024 * 1024;
	form.parse(request, (err, fields, files) => {
		let group_id =  session.getUser(fields.token);
		log_sku.info('uploadExcell start', group_id, fields);
		let obj      = null;
		if (!group_id) {
			errCode = 607;
		} else if (!files.sale || !files.sale.size) {
			errCode = 611;
		} else if (files.sale.type != 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
			errCode = 611;
		}

		try {
			obj = xlsx.parse(files.sale.path);
		} catch (e) {
			errCode = 612;
		}

		if (errCode) {
			response.status(200).send({
				result_code : errCode,
				result_msg : ErrCode[errCode]
			});
			return;
			util.deleteFile(files);
		}	

		esl.uploadExcell(obj[0].data, group_id, (err, data, req_id) => {
			log_sku.info('uploadExcell finished', err, data, req_id);
			if(err){
				response.status(200).send({
					result_code : err,
					result_msg  : ErrCode[err]
				});
			}else{
				response.status(200).send({
					result_code : 200,
					result_msg  : data,
					req_id      : req_id
				});
			}
			util.deleteFile(files);
		});
	});
}

exports.updateESL = function(request, response){
	let errCode = null;
	let infos = {};
	
	if (!request.body.barcode) {
		errCode = 601;
	} else if (!request.body.store_ID) {
		errCode = 700;
	}

	if (errCode) {
		response.status(200).send({
			result_code : errCode,
			result_msg  : ErrCode[errCode]
		});
		return;
	}
	infos.barcode  = request.body.barcode;
	infos.store_ID = request.body.store_ID;
	esl.updateESL(infos, (err, data) => {
		if(err) {
			response.status(200).send({
				result_code : err,
				result_msg  : ErrCode[err]
			});
		} else {
			response.status(200).send({
				result_code : 200,
				result_msg : 'update esl successfully'
			});
		}
	});
}

exports.getallsales = function(request,response){
	let infos = {};
	esl.getallsales(infos,(err,data) =>{
		if(err){
			response.status(200).send({
				result_code : err

			});
		}else{
			response.status(200).send({
				result_code : 200,
				result_msg : data

			});
		}

	});

}

/**
 *  搜索商品
 *  @params token      总店登陆验证
 *  @params condition  搜索条件
 *  @params start      开始
 *  @params limit      限制
 */
exports.searchSKU = function(request, response){
	let group_id =  session.getUser(request.query.token);
	let infos = {
		group_id  : group_id,
		condition : request.query.condition
	};
	if (request.query.start && !isNaN(request.query.start)) {
		infos.start = parseInt(request.query.start);
	} else {
		infos.start = 0;
	}
	if (request.query.limit && !isNaN(request.query.limit)) {
		infos.limit = parseInt(request.query.limit);
	} else {
		infos.limit = 10;
	}

	esl.searchSKU(infos, (err, data, total) => {
		if(err){
			console.log(data);
			response.status(200).send({
				result_code : err,
				result_msg  : ErrCode[err]
			});
		}else{
			response.status(200).send({
				result_code : 200,
				result_msg  : data,
				total       : total

			});
		}
	});
}

/**
 *  更新的状态
 *  @params token   分店ID
 *  @params req_id  条码
 */
exports.statusOfUpdate = function(request, response){
	let errCode = null;
	let infos = {};
	let group_id =  session.getUser(request.query.token);
	if (!group_id) 
	{
		errCode = 607;
	} else if (!request.query.req_id) 
	{
		errCode = 706;
	}

	if (errCode) {
		response.status(200).send({
			result_code : errCode,
			result_msg  : ErrCode[errCode]
		});
		return;
	}
	infos.group_id  = group_id;
	infos.req_id    = request.query.req_id;

	esl.statusOfUpdate(infos, (err, data) => {
		if(err){
			log_sku.info('statusOfUpdate finished', err, data);
			response.status(200).send({
				result_code : err,
				result_msg  : ErrCode[err]
			});
		}else{
			response.status(200).send({
				result_code : 200,
				result_msg  : data
			});
		}
	});
}

exports.addSales = function(request,response){
	let infos = {};
	
	infos.name            = request.body.name;
	infos.sale_price      = parseFloat(request.body.sale_price);
	infos.promotion_price = parseFloat(request.body.promotion_price);
	infos.leaguer_price   = parseFloat(request.body.leaguer_price);
	infos.barcode         = request.body.barcode;
	infos.qrcode          = request.body.qrcode;
	infos.inner_code      = request.body.inner_code;
	infos.origin          = request.body.origin;
	infos.specification   = request.body.specification;
	infos.unit            = request.body.unit;
	infos.level           = request.body.level;
	infos.exhibition      = request.body.exhibition;
	infos.shelf_position  = request.body.shelf_position;
	infos.inventory       = request.body.inventory;
	infos.supplier        = request.body.supplier;
	infos.sku             = request.body.sku;
	infos.promotion_start = request.body.promotion_start;
	infos.promotion_end   = request.body.promotion_end;
	infos.price_employee  = request.body.price_employee;
	esl.addsales(infos,(err,data) =>{
		if(err){
			response.status(200).send({
				result_code : err

			});
		}else{
			response.status(200).send({
				result_code : 200,
				result_msg : data

			});
		}

	});
}


exports.getSkus = (request, response) => {
	
	let store_id =  session.getUser(request.query.token);
	let infos = {store_id};
	let errCode = null;
	log_sku.info('store get Skus start', store_id);
	if (!store_id) {
		errCode = 607;
	} 
	if(errCode){
		response.status(200).send({
			result_code : errCode,
			result_msg : ErrCode[errCode]
		});
		return;
	}
	esl.getSkus(infos, (err, data) => {
		if (err) {
			response.status(200).send({
				result_code : err,
				result_msg : ErrCode[err]
			});
		} else {
			response.status(200).send({
				result_code : 200,
				result_msg : data
			});
		}
	});
}

exports.getExcell =(request, response) =>{
	let store_id = session.getUser(request.query.token);
	let infos    = {store_id};
	let errCode  = null;

	if (!store_id) {
		errCode = 607;
	} 
	if(errCode){
		response.status(200).send({
			result_code : errCode,
			result_msg : ErrCode[errCode]
		});
		return;
	}
	esl.getExcell(infos, (err, data) => {
		if (err) {
			response.status(200).send({
				result_code : err,
				result_msg : ErrCode[err]
			});
		} else {
			response.status(200).send({
				result_code : 200,
				result_msg : data
			});
		}
	});
}
