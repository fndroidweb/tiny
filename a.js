'use strict';
require('date-utils');
const crypto = require('crypto');
const appId = "wxf2641e2242fbfb4d";
const mchId = "1481533452";
const wxSecret = '8a10a5f62019aa9c1f63973bec4b2ff4';
const partnerKey = "fndroidsx5708080123456789ABCDEFG";
const productId = '123456';
const timeStamp = Math.round(new Date().getTime()/1000);
const nonceStr = Math.random().toString(36).substr(2) + timeStamp;
let string = '';
let data = {
	appid      :  appId,
    mch_id     :  mchId, 
    time_stamp :  timeStamp,
    nonce_str  :  nonceStr,
    product_id :  productId
}
for (let key of Object.keys(data).sort()) {
    string += `${key}=${data[key]}&`
}
string +=  `key=${partnerKey}`;
let sign = crypto.createHash('md5').update(string).digest("hex").toUpperCase();
console.log(`weixin：//wxpay/bizpayurl?sign=${sign}&appid=${appId}&mch_id=${mchId}&product_id=${productId}&time_stamp=${timeStamp}&nonce_str=${nonceStr}`)