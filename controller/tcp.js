'use strict';

const _       = require('lodash');
const async   = require('async');
const Store   = require('../models/store');
const Sales   = require('../models/sales');
const Group   = require('../models/group');
const Bind    = require('../models/bind');

exports.powerOn = (infos, ip, port, cb) => {
	async.waterfall([
		(_cb) => {
			if (!infos.store_ID) return _cb(700);
			Store.findOne({store_id: infos.store_ID}, (err, doc) => {
				if (err) {
					_cb(500);
				} else if (!doc) {
					_cb(701);
				} else {
					_cb(null, doc);
				}
			});
		},
		(store, _cb) => {
			let now = new Date();
			Store.update({store_id: infos.store_ID}, {
				ip         : ip,
				status     : 1,
				begin_time : now,
				heartbeat  : now,
				port       : port
			}, (err) => {
				if (err) {
					_cb(err);
				} else {
					_cb();
				}
			});
		}
	],
	cb)
}

exports.powerOff = (ip, port, cb) => {
	async.waterfall([
		(_cb) => {
			Store.findOne({ip: ip, port: port}, (err, doc) => {
				if (err) {
					_cb(500);
				} else if (!doc) {
					_cb(701);
				} else {
					_cb(null, doc);
				}
			});
		},
		(store, _cb) => {
			Store.update({store_id: store.store_id}, {
				status     : 0
			}, (err) => {
				if (err) {
					_cb(err);
				} else {
					_cb();
				}
			});
		}
	],
	cb)
}

exports.updateSKU = (infos, ip, port, cb) => {
	async.waterfall([
		(_cb) => {
			if (!infos.store_ID) return _cb(700);
			if (!infos.req_id) return _cb(706);
			Store.findOne({store_id: infos.store_ID}, (err, doc) => {
				if (err) {
					_cb(500);
				} else if (!doc) {
					_cb(701);
				} else {
					_cb(null, doc);
				}
			});
		},
		(store, _cb) => {
			let status = 0;
			let condition = {store_id: infos.store_ID};
			if (infos.resMsg == 'success') {
				condition.req_id = infos.req_id;
				status = 3;
			} else {
				let resMsg = infos.resMsg.match(/ESL .*\[(\d+)\]/);
				if (!resMsg) return _cb(707);
				condition.barcode = resMsg[1];
				status = 4;
			}
			Bind.update(condition, {status}, {multi: true}, (err) => {
				if (err) {
					_cb(err);
				} else {
					_cb();
				}
			});
		}
	],
	cb)
}

exports.bind = (infos, ip, port, cb) => {
	async.waterfall([
		(_cb) => {
			if (!infos.store_ID) return _cb(700);
			if (!infos.resMsg) return _cb(801);
			Store.findOne({store_id: infos.store_ID}, (err, doc) => {
				if (err) {
					_cb(500);
				} else if (!doc) {
					_cb(701);
				} else {
					_cb(null, doc);
				}
			});
		},
		(store, _cb) => {
			Group.findOne({group_id: store.group}, (err, doc) => {
				if (err) {
					_cb(500);
				} else if (!doc) {
					_cb(704);
				} else {
					_cb(null, doc);
				}
			});
		},
		(group, _cb) => {
			Sales.findOne({group_name: group.group_name, barcode: infos.resMsg}, (err, doc) => {
				if (err) {
					_cb(500);
				} else if (!doc) {
					_cb(702);
				} else {
					_cb(null, doc, group);
				}				
			});
		},
		(sku, group, _cb) => {
			let reqBody = {
				style_id       : "A",
	            led_red        : 0,
	            led_green      : 0,
	            barcode        : sku.barcode,
	            name           : sku.name, 
	            specification  : sku.specification,
	            level          : sku.level,
	            unit           : sku.unit,
	            "2d_code"      : sku.qrcode,
	            inner_code     : sku.inner_code,
	            sale_price     : sku.original_price ? sku.original_price.toString() : undefined,
	            promotion_price: sku.sale_price ? sku.sale_price.toString() :  undefined,
	            promotion_start: sku.promotion_start ? sku.promotion_start.toFormat('YYYY-MM-DD') : undefined,
	            promotion_end  : sku.promotion_end ? sku.promotion_end.toFormat('YYYY-MM-DD') : undefined,
	            leaguer_price  : sku.leaguer_price ? sku.leaguer_price.toString() : undefined,
	            inventory_nums : sku.inventory,
	            price_employee : sku.price_employee,
	            madein         : sku.origin
			};
			Bind.findOne({store_id: infos.store_ID, barcode: sku.barcode}, (err, doc) => {
				if (err) {
					return _cb(500)
				} else if (doc) {
					if (doc.sale_price)      reqBody.sale_price = doc.sale_price;
					if (doc.promotion_price) reqBody.sale_price = doc.promotion_price;
					if (doc.leaguer_price)   reqBody.sale_price = doc.leaguer_price;
				}
				_cb(null, reqBody);
			});
		},
		(reqBody, _cb) => {
			Bind.update({store_id: infos.store_ID, barcode: reqBody.barcode}, {
				status : 1,
				model  : 'A',
				req_id : infos.req_id
			}, {upsert: true}, (err) => {
				if (err) {
					_cb(500);
				} else {
					_cb(null, reqBody);
				}
			})
		}
	],
	cb)
}