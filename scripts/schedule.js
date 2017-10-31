'use strict';

const schedule = require('node-schedule');
const _        = require('lodash');
const async    = require('async');
const Scheme   = require('../models/scheme');
const Group    = require('../models/group');
const Store    = require('../models/store');
const Sales    = require('../models/sales');
const TCP      = require('../routes/tcp');
const util     = require('../common/util');
require('date-utils');

let rule = new schedule.RecurrenceRule();
rule.second = 42;
let doUpdate = (stores, scheme, flag, cb) => {
	let store_ids = _.map(stores, 'store_id');
	let index = store_ids.indexOf(scheme.store_id);
	let store = stores[index];
	console.log('start scheme', scheme.scheme_name, store.store_id);
	async.waterfall([
		(_cb) => {
			Group.findOne({group_id: store.group}, (err, doc) => {
				if (err) {
					_cb(err);
				} else if (!doc) {
					_cb('err group');
				} else {
					_cb(null, doc.group_name);
				}
			})
		},
		(group_name, _cb) => {
			let condition = {group_name};
			if (scheme.barcode) {
				condition.barcode = scheme.barcode;
			} else {
				condition.category = scheme.category;
			}
			Sales.find(condition, (err, docs) => {
				if (err) {
					_cb(err)
				} else if (!docs.length) {
					console.error('no sku finds', scheme.scheme_name);
					_cb();
				} else {
					if (flag) {
						for (let i = 0; i < docs.length; i++) {
							if (scheme.scheme_price) {
								docs[i].sale_price = scheme.scheme_price;
							} else {
								docs[i].sale_price = (scheme.scheme_discount * docs[i].sale_price).toFixed(2);
							}
						}						
					}
					TCP.updateESL(store, docs, util.getID('schedule'), _cb);
					console.log('end scheme', docs);
				}
			});
		}
	],
	cb
	)

}
 
let j = schedule.scheduleJob(rule, function(){
 	console.log('do  check');
  	async.waterfall([
		(cb) => {
			Store.find({status : 1}, (err, docs) => {
				if (err) {
					cb(err);
				} else if(!docs.length) {
					cb('no store accessfull');
				} else {
					cb(null, docs)
				};
			})
		},
		(stores, cb) => {
			let store_ids = _.map(stores, 'store_id');
			console.log('online store_ids :', store_ids);
			Scheme.find({store_id: {$in: store_ids}}, (err, docs) => {
				if (err) {
					cb(err);
				} else if(!docs.length) {
					cb('no scheme exists');
				} else {
					cb(null, stores, docs)
				};				
			})
		},
		(stores, schemes, cb) => {
			async.eachSeries(schemes, (scheme, _cb) => {
        		switch(scheme.scheme_type) {
        			case 1:
        				if (!scheme.start_time) return _cb();
        				if (scheme.start_time.between(new Date().addMinutes(-1), new Date())) {
        					doUpdate(stores, scheme, true, _cb);
        				} else {
        					_cb();
        				}
        				break;
        			case 2:
        				if (!scheme.start_time || !scheme.end_time) return _cb();
        				if (scheme.start_time.between(new Date().addMinutes(-1), new Date())) {
        					doUpdate(stores, scheme, true, _cb);
        				} else if (scheme.end_time.between(new Date().addMinutes(-1), new Date())) {
        					doUpdate(stores, scheme, false, _cb);
        				} else {
        					_cb();
        				}
        				break;
        			default:
        				_cb();
        		}
        	}, (err) => {
                if (err) {
                    cb(err);
                } else {
                    cb();
                }
            });				
		}
	],
	err => {
		if (err) return console.error(err);
		console.log('success');
	})
});

