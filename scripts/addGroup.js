'use strict';

const Group = require('../models/group');
const async = require('async');
const util  = require('../common/util');

let createGroup = () => {
	async.waterfall([
		(_cb) => {
			Group.findOne({group_name : '丰灼'}, (err, data) => {
				if (err) {
					_cb(err)
				} else if (!data) {
					_cb();
				} else {
					_cb('group already exist');
				}
			});
		},
   		(_cb) => {
   			let group = {
				group_id      : util.getID('group'),
				group_name    : '丰灼',
				desc          : '自建小超市',
				phone         : '18521705356',
				contact       : '卢涛',
				passwd        : '123456',
				user          : 'test'
   			}
   			Group.create(group, _cb);
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

createGroup();
	