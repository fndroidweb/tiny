'use strict';

const _ = require('lodash');
const net = require('net');
const iconv   = require('iconv-lite');

    let client = net.connect({port: 9009, host: '127.0.0.1'}, function() { 
        console.log('connected to server!!!');
        client.write(JSON.stringify({
            cmd      :  'shake',
            reqTime  :  '20170912251646001',
            store_ID :  '9B05AA67B2590300',
            req_id   :  '2233445566',
            req_body : {}

        }));
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
