'use strict';

const _       = require('lodash');
const async   = require('async');
const Store   = require('../models/store');
const util    = require('../common/util');
const TCP     = require('../routes/tcp');
const SKU     = require('../models/sales');
const Group   = require('../models/group');
const Bind    = require('../models/bind');
require('date-utils');

/**
*
*
* 分店修改价格
*
*/
exports.changeprice = (infos,cb) =>{
	async.waterfall([
		(_cb) =>{
			
			Store.findOne({store_id: infos.store_id}, (err, doc) => {
				if (err) {
					_cb(500);
				} else if (!doc){
					_cb(701);
				} else {
					_cb(null, doc);
				}
			})
		},
		(store, _cb) =>{
			Bind.update({barcode :infos.barcode},{original_price : infos.price},(err,doc) =>{
				if(err){
					_cb(500);

				}else if(!doc){
					_cb(703);

				}else{

					_cb(null,store);

				}

			});

		},
		(store, _cb) => {
			console.log(infos.barcode);
			SKU.findOne({barcode: infos.barcode}, (err, doc) => {
				if (err) {
					_cb(500);
				} else if (!doc){
					_cb(702);
				} else {
					if (doc.sale_price)      infos.price = doc.sale_price;
					if (doc.promotion_price) infos.price = doc.promotion_price;
					if (doc.leaguer_price)   infos.price = doc.leaguer_price;

					_cb(null, store, doc);
				}				
			});
		},
		(store, sku, _cb) => {
			TCP.updateESL(store, [sku], util.getID('random'), _cb);
		}

		],cb)



}
/**
*查询所有商店
*/
exports.getStores =(infos, cb) =>{
	async.waterfall([
		(_cb) => {
			Store.find(infos, (err, doc) => {
				if(err){
					_cb(500);
				} else {
					_cb(null, doc);
				}
			});
		}
	],
	cb)
}

 /**
  * 商店加盟
  */
exports.addStore = (infos, cb) => {
	async.waterfall([
		(_cb) => {
			Store.findOne({store_name: infos.store_name}, (err, doc) => {
				if (err) {
					_cb(500);
				} else if (doc){
					_cb(600);
				} else {
					_cb();
				}
			})
		},
		(_cb) => {
			infos.store_id = util.getID('store');
			infos.status   = 0;
			Store.create(infos, (err) => {
				if (err) {
					_cb(500, err);
				} else {
					_cb();
				}
			});
		}
	],
	cb
	)
}

/**
  * 获取在线AP列表
  */
exports.getOnlineStore = (cb) => {
	let keys = TCP.getOnlineAPs();
	let list = [];
    async.eachSeries(keys, (key, _cb) => {
        if (!key) return _cb();
        let store = key.split(':'); 
        Store.findOne({ip : store[0], port : store[1]}, (err, doc) => {
            if (err) {
                _cb(500);
            } else if (!doc) {
                _cb();
            } else {
                list.push({
					store_id     : doc.store_id,
					store_name   : doc.store_name,
					ip           : doc.ip,
					port         : doc.port,
					heartbeat    : doc.heartbeat.toFormat("YYYY-MM-DD HH24:MI:SS")
                });
                _cb();
            }
        });
    }, (err) => {
        if (err) {
            cb(err);
        } else {
            cb(null, list);
        }
    });
}

/*
 * 管理员登录
 */
 exports.groupLogin = (infos ,cb) => {
 	async.waterfall([
 		(_cb) =>{
 			Group.findOne({user: infos.user}, (err, doc) => {
 				if(err){
 					_cb(500, err);
 				} else {
 					if(doc) {
 						if (doc.passwd != infos.passwd) {
 							_cb(605);
 						} else {
 							_cb(null, doc);
 						}
 					} else {
 						_cb(604);
 					}
 				}
 			});
 		}
 	],
 	cb
 	)
 }

 /*
 * 管理员登录
 */
 exports.storeLogin = (infos ,cb) => {
 	async.waterfall([
 		(_cb) =>{
 			Store.findOne({store_name: infos.name}, (err, doc) => {
 				if(err){
 					_cb(500, err);
 				} else {
 					if(doc) {
 						if (doc.passwd != infos.passwd) {
 							_cb(605);
 						} else {
 							_cb(null, doc);
 						}
 					} else {
 						_cb(604);
 					}
 				}
 			});
 		}
 	],
 	cb
 	)
 }

/**
 * 修改密码
 */
exports.changePasswd = (infos ,cb) =>{
	async.waterfall([
 		(_cb) =>{
 			Store.findOne({store_id: infos.store_id}, (err, doc) => {
 				if(err){
 					_cb(500, err);
 				} else {
 					if(doc) {
 						if (doc.passwd != infos.passwd) {
 							_cb();
 						} else {
 							_cb(610);
 						}
 					} else {
 						_cb(701);
 					}
 				}
 			});
 		},
 		(_cb) =>{
 			Store.update({passwd : infos.passwd}, (err, doc) => {
 				if(err){
 					_cb(500, err);
 				}else{
 					_cb();
 				}
 			});
 		}
 	],
 	cb
 	)
}
