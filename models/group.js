'use strict';

const mongoose = require('mongoose');
const Schema   = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
require('../common/connectMongo');

let schema = new Schema({
	group_id      : {type : String},
	group_name    : {type : String},
	desc          : {type : String},
	phone         : {type : String},
	contact       : {type : String},
	passwd        : {type : String},
	user          : {type : String}
}, {collection: 'group_info', timestamps: true});

module.exports = mongoose.model('group', schema);