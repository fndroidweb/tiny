'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
require('../common/connectMongo');

let schema = new Schema({
	
	user_name : {type : String},
	pass_word : {type : String},
	auth      : {type  : Number}
	//0 代表普通用户 1代表普通管理员 2代表高级管理员
	
}, {collection: 'user_info', timestamps: true});

module.exports = mongoose.model('user', schema);