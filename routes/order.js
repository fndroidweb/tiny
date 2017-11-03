'use strict';

const _          = require('lodash');
const config     = require('config');
const util       = require('../common/util');
const order      = require('../controller/order');
const log_sku    = require('../common/logger').sku;
const ErrCode    = config.ErrCode; 

exports.wxCallback = (message, cb) =>{
	order.wxCallback(message, cb);
}