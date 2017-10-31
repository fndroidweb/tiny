'use strict';
const _         = require('lodash');
const config    = require('config');
const ErrCode   = config.ErrCode; 


/**
* 分店价格修改
*/
exports.callBack = function(request,response){
	console.log(request.body, request.query)
}
