'use strict';

const SKU = require('../models/sales');
const async = require('async');

let createSKU = () => {
	async.waterfall([
		(_cb) => {
			SKU.findOne({borcode : '6903254205778'}, (err, data) => {
				if (err) {
					_cb(err)
				} else if (!data) {
					_cb();
				} else {
					_cb('already exist');
				}
			});
		},
   		(_cb) => {
   			let sku = {
   				name            : '冰红茶',
				sale_price      : 4.50,
				promotion_price : 4.00,
				leaguer_price   : 4.30,
				barcode         : "6903254205778",
				qrcode          : "www.hek.cn",
				inner_code      : "211320",
				origin          : "厦门",
				specification   : "PET600ML",
				unit            : "瓶",
				level           : "合格",
				exhibition      : "阴凉干燥处",
				shelf_position  : "0001",
				inventory       : "280",
				supplier        : "惠尔康",
				sku             : "10001",
				promotion_start : new Date(),  
				promotion_end   : new Date(2017, 10, 8),   
				price_employee  : "王路浩"
   			}
   			SKU.create(sku, _cb);
   		}
	],
	(err) => {
		if (err) {
			console.log(err);
		} else {
			console.log('success');
		}
		process.exit();
	})
}

createSKU();
	