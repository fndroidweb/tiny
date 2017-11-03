'use strict';

const fs         = require('fs');
const _          = require('lodash');
const async      = require('async');
const config     = require('config');
const util       = require('../common/util');
const SKU        = require('../models/sales');
const initConfig = config.initConfig;
const Payment    = require('wechat-pay').Payment;

exports.wxCallback = (infos, cb) =>{
	async.waterfall([
		(_cb) =>{
			if (!infos.product_id) return _cb(702);
			SKU.findOne({_id: infos.product_id}, (err, doc) => {
				if (err) {
					_cb(500);
				} else if(!doc) {
					_cb(702);
				} else {
					_cb(null, doc);
				};
			})
		},
		(sku, _cb) => {
		  	let order = {
				body             : sku.name,
		 		out_trade_no     : util.getID('trade'),
				total_fee        : Math.round(sku.sale_price * 100),
				spbill_create_ip : '106.14.0.16',
				trade_type       : 'NATIVE',
				notify_url       : 'http://tiny.fndroid.com/wxNotify',
				product_id       : infos.product_id
			};		
			let payment = new Payment(initConfig);
			payment.getBrandWCPayRequestParams(order, (err, payargs) => {
			    if (err) {
			    	_cb(502, err);
			    } else {
			    	let  sendMessage = {
					   	 return_code : 'SUCCESS',
					   	 mch_id      : infos.mch_id,
					   	 result_code : 'SUCCESS'
				 	};
				 	sendMessage.appid = payargs.appId;
				    sendMessage.mch_id = '1481533452';
				    sendMessage.nonce_str = payargs.nonceStr;
				    sendMessage.prepay_id = payargs.package.substring(10);
				    let sign = payment._getSign(sendMessage)
					sendMessage.sign = sign;
					_cb(null, sendMessage);
			    }
			});
		}
	],
	cb
	)
}
