'use strict';

const _     = require('lodash');
const net   = require('net');
const iconv = require('iconv-lite');
const async = require('async');
const SKU   = require('../models/sales');
const Store = require('../models/store'); 

let client = net.connect({port: 9009, host: '127.0.0.1'}, function() {
    console.log('connected to server!!!');
    client.write(JSON.stringify({
        cmd      :  'shake',
        reqTime  :  '20170912251646001',
        store_ID :  '9B05AA67B2590300',
        req_id   :  '2233445566',
        reqBody : {}

    }));
});
client.setNoDelay(true);
client.on('data', function(data) {
    data = data.toString()
    console.log(data);
    let reg   = new RegExp("}{", "g");
    let index = 0;
    while ( reg.exec(data) != null) {
        response(data.substring(index, reg.lastIndex -1))
        index = reg.lastIndex - 1;
    }
    response(data.substr(index))
});

function response(data) {
   let json = JSON.parse(data);
    if (json.cmd == 'sku_update_1') {
        let body = {
            cmd      :  'sku_update_1',
            reqTime  :  json.reqTime,
            store_ID :  json.store_ID,
            req_id   :  json.req_id
        }
        client.write(JSON.stringify(body));
        let list = json.reqBody.list;
        for (let i = 0; i < list.length; i++) {
            let response = {
                cmd      :  'sku_update_1',
                reqTime  :  json.reqTime,
                store_ID :  json.store_ID,
                req_id   :  json.req_id,
                resMsg   :  `success (barcode=${list[i].barcode})`               
            }
            sendRes(response, i + 1);
        }
    }
}

function sendRes(body, num) {
    setTimeout(()=>{
         client.write(JSON.stringify(body));
    }, 3000*num);
}

client.on('end', function() {
    console.log('disconnected from server');
});

client.on('error', function(e) {
	console.log(e)
});


exports.bind = (infos, cb) => {
    async.waterfall([
        (_cb) => {
            Store.findOne({store_id: infos.store_id}, (err, doc) => {
                if (err) {
                    _cb(err);
                } else if (!doc) {
                    _cb('商店不存在');
                } else {
                    _cb();
                }
            });
        },
        (_cb) => {
            SKU.findOne({barcode: infos.barcode}, (err, doc) => {
                if (err) {
                    _cb(err);
                } else if (!doc) {
                    _cb('商品不存在');
                } else {
                    _cb();
                }  
            });          
        },
        (_cb) => {
            client.write(JSON.stringify({
                cmd      :  'sku_req_1',
                reqTime  :  '20170912251646001',
                store_ID :  infos.store_id,
                req_id   :  '2233445566',
                resMsg   :  infos.barcode,
                reqBody  : {}
            }));
            _cb();
        }
    ],
    (err) => {
        if (err) {
            cb(500, err);
        } else {
            cb(null, 'success');
        }
    })
}
