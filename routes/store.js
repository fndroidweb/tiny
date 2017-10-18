'use strict';
const _         = require('lodash');
const store     = require('../controller/store.js');
const session   = require('../common/session.js');
const config    = require('config');
const ErrCode   = config.ErrCode; 
const log_store = require('../common/logger').store;

/**
* 分店价格修改
*/
exports.changeprice = function(request,response){
	let errCode = null;
	let  infos = {};
	if (!request.body.store_id) {
		errCode = 804;

	}else if(!request.body.barcode){

		errCode = 803;

	}else if (!request.body.price){
		errCode = 805;
	};
	if (errCode) {
		response.status(200).send({
			result_code : errCode,
			result_msg  : ErrCode[errCode]

		});
		return;

	};
	infos.store_id  = request.body.store_id;
	infos.barcode   =  request.body.barcode;
	infos.price =  request.body.price;
	store.changeprice(infos,(err,data) =>{
		if(err){
			response.status(200).send({
				result_code : err,
				result_msg  : ErrCode[err]

			});

		}else{
			response.status(200).send({
				result_code : 200,
				result_msg  : 'change  price successfully'
			});

		}

	});


}
/**
 *  商店加盟
 *  总店添加分店信息
 *  @params store_name 店名
 *  @params token      登陆认证
 */
exports.addStore = function(request, response) {
	let errCode = null;
	let group = session.getUser(request.body.token);
	let infos = {group};
	log_store.info('addStore start', group, request.body);
	if (!request.body.store_name) {
		errCode = 606;
	} else if (!group) {
		errCode = 607;
	} else if (!request.body.passwd) {
		errCode = 603;
	}
	if (errCode) {
		response.status(200).send({
			result_code : errCode,
			result_msg  : ErrCode[errCode]
		});
		return;
	}
		
	infos.store_name  = request.body.store_name;
	infos.area        = request.body.area;
	infos.address     = request.body.address;
	infos.phone       = request.body.phone;
	infos.contact     = request.body.contact;
	infos.desc        = request.body.desc;
	infos.mac         = request.body.mac;
	infos.passwd      = request.body.passwd;

	store.addStore(infos, (err, data) => {
		log_store.info('addStore finished', err, data);
		if(err) {
			response.status(200).send({
				result_code : err,
				result_msg  : ErrCode[err]
			});
		} else {
			response.status(200).send({
				result_code : 200,
				result_msg  : 'add store successfully'
			});
		}
	});
}

/**
 *  获取在线AP列表
 */
exports.getOnlineStore = function(request, response) {	
	log_store.info('getOnlineStore start');
	store.getOnlineStore((err, data) => {
		log_store.info('getOnlineStore finished', err, data);
		if(err){
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

/**
 *  获取门店
 */
exports.getStores = function(request, response) {
	let errCode = null;
	let group = session.getUser(request.query.token);
	log_store.info('getStores start', group, request.query);
	if (!group) {
		errCode = 607;
	}
	if (errCode) {
		response.status(200).send({
			result_code : errCode,
			result_msg  : ErrCode[errCode]
		});
		return;
	}
	let infos = {group : group};
	store.getStores(infos,(err,data) => {
		log_store.info('getStores finished', err, data);
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
	})	
}



/**
 *  管理员登录
 *  @params user
 *  @params passwd
 */
exports.groupLogin = (request, response) => {
	let errCode = null;
	let infos = {};
	log_store.info('groupLogin start', request.body);
	if(!request.body.user){
        errCode = 602;
	}else if(!request.body.passwd){
		errCode = 603;
	}
	if (errCode) {
		response.status(200).send({
			result_code : errCode,
			result_msg : ErrCode[errCode]
		});
		return;
	}
	infos.user = request.body.user;
	infos.passwd = request.body.passwd;
	
	store.groupLogin(infos, (err, data) => {
		log_store.info('groupLogin finished', err, data);
		if (err) {
			response.status(200).send({
				result_code : err,
				result_msg : ErrCode[err]
			});
		} else {
			let token = session.setUser(data.group_id);
			response.status(200).send({
				result_code : 200,
				result_msg : data,
				token : token
			});
		}
	});
}


/**
 *  管理员登录
 *  @params name
 *  @params passwd
 */
exports.storeLogin = (request, response) => {
	let errCode = null;
	let infos = {};
	log_store.info('storeLogin start', request.body);
	if(!request.body.name){
        errCode = 602;
	}else if(!request.body.passwd){
		errCode = 603;
	}
	if (errCode) {
		response.status(200).send({
			result_code : errCode,
			result_msg : ErrCode[errCode]
		});
		return;
	}
	infos.name = request.body.name;
	infos.passwd = request.body.passwd;
	
	store.storeLogin(infos, (err, data) => {
		log_store.info('storeLogin finished', err, data);
		if (err) {
			response.status(200).send({
				result_code : err,
				result_msg : ErrCode[err]
			});
		} else {
			let token = session.setUser(data.store_id);
			response.status(200).send({
				result_code : 200,
				result_msg : data,
				token : token
			});
		}
	});
}

exports.changePasswd = (request,response) =>{
	let errCode = null;
	let infos = {};
	let store_id =  session.getUser(request.body.token);
	log_store.info('changePasswd start', store_id, request.body);
	if (!store_id) {
		errCode = 607;
	} else if (!request.body.passwd){
		errCode = 603;
	} else if (!request.body.repeatpasswd) {
		errCode = 603;
	} else if (request.body.passwd !== request.body.repeatpasswd){
		errCode = 609;
	}
	if(errCode){
		response.status(200).send({
			result_code : errCode,
			result_msg : ErrCode[errCode]
		});
		return;
	}
	infos.store_id     = store_id; 
	infos.passwd       = request.body.passwd;
	store.changePasswd(infos, (err, data) => {
		log_store.info('changePasswd finished', err, data);
		if (err) {
			response.status(200).send({
				result_code: err,
				result_msg :ErrCode[err]
			});
		} else {
			response.status(200).send({
				result_code : 200,
				result_msg : 'change passwd successfully'
			});
		}
	});
}


