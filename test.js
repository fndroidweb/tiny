'use strict';

const _ = require('lodash');
const net = require('net');
const iconv   = require('iconv-lite');
const Payment = require('wechat-pay').Payment;
const fs = require('fs');
const initConfig = {
        partnerKey: "fndroidsx5708080123456789ABCDEFG",
        appId: "wxf2641e2242fbfb4d",
        mchId: "1481533452",
        pfx: fs.readFileSync("apiclient_cert.p12")
    }
 
let payargs = { appId: 'wxf2641e2242fbfb4d',
  timeStamp: '1509433764',
  nonceStr: 'k6jBDLWRO6RU6p4rPVfAYb4ZVZ60vDtX',
  signType: 'MD5',
  package: 'prepay_id=wx20171031150924cf6771e3f60967969281',
  paySign: '0D7D55126072D384D423D9C884F1FB80',
  code_url: 'weixin://wxpay/bizpayurl?pr=3OtgVdU',
  timestamp: '1509433764' }

  let  message = {
    return_code : 'SUCCESS',
    appid       : payargs.appId,
    mch_id      : '1481533452',
    nonceStr    : payargs.nonceStr,
    prepay_id   : payargs.package.substring(10,40),
    result_code : 'SUCCESS',
    sign        : payargs.paySign

  };
  let payment = new Payment(initConfig);
  console.log(payment.buildXml(message));

  
