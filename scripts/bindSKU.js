'use strict';

const _     = require('lodash');
const net   = require('net');
const iconv = require('iconv-lite');
const async = require('async');
const SKU   = require('../models/sales');
const Store = require('../models/store'); 

let options  = process.argv;
let barcode  = options[2];
let store_id = options[3];

if (!barcode || !store_id) {
    console.error('please provide barcode and store_ID');
    process.exit(0)
}

let client = net.connect({port: 9009, host: '127.0.0.1'}, function() {
    console.log('connected to server!!!');
    async.waterfall([
        (_cb) => {
            Store.findOne({store_id}, (err, doc) => {
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
            SKU.findOne({barcode}, (err, doc) => {
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
                cmd      :  'bind',
                reqTime  :  '20170912251646001',
                store_ID :  store_id,
                req_id   :  '2233445566',
                req_body : {
                    barcode : barcode
                }
            }));
        }
    ],
    (err) => {
        if (err) {
            console.log(err);
        } else {
            console.log('success');
        }
        client.end();
    })
});

client.on('data', function(data) {
    console.log(data.toString());
});

client.on('end', function() {
    console.log('disconnected from server');
});

client.on('error', function(e) {
	console.log(e)
});
