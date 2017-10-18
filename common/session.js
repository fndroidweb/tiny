'use strict';

const _ = require('lodash');
const LRU = require('lru-cache');
let cache = LRU(500);


exports.setUser = (userId) => {
	let token = Math.random().toString(36).substr(2) + new Date().getTime();
	cache.set(token, userId);
	return token;
}

exports.getUser = (token) => {
	let value = cache.get(token);
	if (value) {
		return value;
	} else {
		return;
	}
}

exports.delUser = (token) => {
	let userId = cache.get(token);
	if (!userId) return false;
	cache.forEach((value, key) => {
		if (value == userId) {
			cache.del(key);
		}
	});
	return true;
}

