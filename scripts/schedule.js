'use strict';

const schedule = require('node-schedule');
const _        = require('lodash');
const async    = require('async');
const log_sku  = require('../common/logger').sku;
const Scheme   = require('../models/scheme');
const Store    = require('../models/store');
const Sales    = require('../models/sales');
require('date-utils');

let rule = new schedule.RecurrenceRule();
rule.second = 42;
let doUpdate = (stores, scheme, flag, cb) => {
	log_sku.info('start scheme', scheme.scheme_name);
	let store_ids = _.map(stores, 'store_id');
	let index = store_ids.indexOf(scheme.store_id);
	let store = stores[index];
	let condition = {store_id: scheme.store_id};
	if (scheme.barcode) {
		condition.barcode = scheme.barcode;
	} else {
		condition.category = scheme.category;
	}
	Sales.find(condition, (err, docs) => {
		if (err) {
			cb(err)
		} else if (!docs.length) {
			log_sku.error('no sku finds', scheme.scheme_name);
			cb();
		} else {
			for (let i = 0; i < docs.length; i++) {
				if (scheme.scheme_price) {
					docs[i].sale_price = scheme.scheme_price;
				} else {
					docs[i].sale_price = (scheme.discount * docs[i].sale_price).toFixed(2);
				}
			}
			log_sku.info('end scheme',docs);
			cb();
		}
	});
}
 
// let j = schedule.scheduleJob(rule, function(){
//   console.log('The answer to life, the universe, and everything!');
// });
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
			log_sku.info('online store_ids :', store_ids);
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
		if (err) return log_sku.error(err);
		log_sku.info('success');
	})

TCP.updateESL(store, [sku], req_id, __cb);
