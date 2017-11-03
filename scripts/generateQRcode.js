'use strict';

const _     = require('lodash');
const async = require('async');
const SKU   = require('../models/sales');
const crypto = require('crypto');
const appId = "wxf2641e2242fbfb4d";
const mchId = "1481533452";
const partnerKey = "fndroidsx5708080123456789ABCDEFG";
const productId = '59df06f691fdbddf5e4fe102';
const timeStamp = Math.round(new Date().getTime()/1000);

    async.waterfall([
        (_cb) => {
            SKU.find({barcode:'6924743919211'}, null, {lean:true}, (err, docs) => {
                if (err) {
                    _cb(err);
                } else {
                    _cb(null, docs);
                }
            });
        },
        (skus, _cb) => {
            async.eachSeries(skus, (sku, __cb) => {
                let productId = sku._id;
                let nonceStr = Math.random().toString(36).substr(2) + timeStamp;
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
                let qrcode = `weixin://wxpay/bizpayurl?sign=${sign}&appid=${appId}&mch_id=${mchId}&product_id=${productId}&time_stamp=${timeStamp}&nonce_str=${nonceStr}`;
                SKU.update({_id: sku._id}, {qrcode}, __cb)
            }, _cb); 
        }
    ],
    (err) => {
        if (err) {
            console.log(err);
        } else {
            console.log('success');
        }
    })

