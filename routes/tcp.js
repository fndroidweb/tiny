'use strict';

const net     = require('net');
const _       = require('lodash');
const config  = require('config');
const iconv   = require('iconv-lite');
const TCP     = require('../controller/tcp');
const util    = require('../common/util');
const port    = config.tcpPort;
const ErrCode = config.ErrCode;
const log_tcp = require('../common/logger').tcp;
require('date-utils');

let CONNECTS = {};
exports.init = (tcp) => {
    tcp.on('connection', (socket) => {
            let address = socket.remoteAddress;
            let ip = null;
            if (address.indexOf('.') > 0) {
                let client = address.split(':');
                ip = client[client.length - 1];
            } else {
                ip = address;
            }
            let port = socket.remotePort;
            CONNECTS[`${ip}:${port}`] = socket;
            log_tcp.info(`${ip}:${port} connected`);
            socket.on('data', (data) => {
                parseData(data, ip, port);
            });

            socket.on('close', () => { 
                if (CONNECTS[`${ip}:${port}`]) delete CONNECTS[`${ip}:${port}`];
                log_tcp.info(`${ip}:${port} disconnected`);
                TCP.powerOff(ip, port, (err) => {
                    log_tcp.info(`${ip}:${port} powerOff`, err);
                });
            })

            socket.on('error', (err) => {
                log_tcp.error(err)
            })
    });

    tcp.on('error', (err) => {
            log_tcp.error(err);
    });

    tcp.on('close', () => {
            log_tcp.info('server close');
    })

    tcp.listen({port : port}, () => {
    	log_tcp.info(`open tcp server on port ${port}`);
	});
}

function parseData(data, ip, port) {
    log_tcp.info(ip, port, data.toString());
    try {
        data = JSON.parse(data);
    } catch (e) {
        log_tcp.error(e)
        return;
    }
    if (!data.cmd) return;
    
    switch (data.cmd) {
        case 'shake':
            shake(data, ip, port);
            break;
        case 'sku_req_1':
            bind(data, ip, port);
            break;
        case 'sku_update_1':
            updateSKU(data, ip, port);
            break;
        default:
            log_tcp.error('no such command: ', data.cmd);
            break;
    }
} 


function shake(data, ip, port) {
    log_tcp.info(`${ip}:${port} shake start`);
    TCP.powerOn(data, ip, port, (err, doc) => {
        let resMsg = null;
        if (err) {
            resMsg = ErrCode[err];
            log_tcp.error(`${ip}:${port} shake failed`, err);
        } else {
            resMsg = 'success';
            log_tcp.info(`${ip}:${port} shake successfully`);
        }
        if (CONNECTS[`${ip}:${port}`]) {
             CONNECTS[`${ip}:${port}`].write(JSON.stringify({
                cmd      :   data.cmd,
                reqTime  :   data.reqTime,
                store_ID :   data.store_ID,
                req_id   :   data.req_id,
                resMsg   :   resMsg,
                reqBody  :   {}    
            }));           
         } else {
            log_tcp.error(`${ip}:${port} has already disconnected`);
         }

    });
}

function bind(data, ip, port) {
    log_tcp.info(`${ip}:${port} bind start`);
    TCP.bind(data, ip, port, (err, doc) => {
        let resMsg = null;
        if (err) {
            resMsg = ErrCode[err];
            log_tcp.error(`${ip}:${port} bind failed`, err);
        } else {
            resMsg = 'success';
            log_tcp.info(`${ip}:${port} bind successfully`);
        }
        if (CONNECTS[`${ip}:${port}`]) {
             CONNECTS[`${ip}:${port}`].write(JSON.stringify({
                cmd      :   data.cmd,
                reqTime  :   data.reqTime,
                store_ID :   data.store_ID,
                req_id   :   data.req_id,
                resMsg   :   resMsg,
                reqBody  :   {list : [doc]}  
            }));           
         } else {
            log_tcp.error(`${ip}:${port} has already disconnected`);
         }

    });
}

function updateSKU(data, ip, port) {
    log_tcp.info(`${ip}:${port} updateSKU start`);
    TCP.updateSKU(data, ip, port, (err, doc) => {
        let resMsg = null;
        if (err) {
            resMsg = ErrCode[err];
            log_tcp.error(`${ip}:${port} updateSKU failed`, err);
        } else {
            log_tcp.info(`${ip}:${port} updateSKU successfully`);
        }
    });   
}

function updateESL(store, sku, req_id, cb) {
    log_tcp.info('updateESL start', store.store_id, req_id);
    let now     = new Date();
    let reqTime = `${now.getFullYear()}` + (now.getMonth() + 1) + now.getDate()
    + now.getHours() + now.getMinutes() + now.getSeconds() + now.getMilliseconds();
    let body = {
        cmd      :  'sku_update_1',
        reqTime  :  reqTime,
        store_ID :  store.store_id,
        req_id   :  req_id
    }
    let list = [];
    for (let i = 0; i < sku.length; i++) {
        list.push({
            style_id       : "A",
            led_red        : "0",
            led_green      : "0",
            barcode        : sku[i].barcode,
            name           : sku[i].name, 
            specification  : sku[i].specification,
            level          : sku[i].level,
            unit           : sku[i].unit,
            "2d_code"      : sku[i].qrcode,
            inner_code     : sku[i].inner_code,
            sale_price     : sku[i].sale_price ? sku[i].sale_price.toString() : undefined,
            promotion_price: sku[i].promotion_price ? sku[i].promotion_price.toString() :  undefined,
            promotion_start: sku[i].promotion_start ? sku[i].promotion_start.toFormat('YYYY-MM-DD') : undefined,
            promotion_end  : sku[i].promotion_end ? sku[i].promotion_end.toFormat('YYYY-MM-DD') : undefined,
            leaguer_price  : sku[i].leaguer_price ? sku[i].leaguer_price.toString() : undefined,
            inventory_nums : sku[i].inventory,
            price_employee : sku[i].price_employee,
            madein         : sku[i].origin
        });
    }
    console.log(CONNECTS)
    if (CONNECTS[`${store.ip}:${store.port}`]) {
        let num = 0;
        while(num < list.length) {
            doS(num)
            num += 15;
        }

        function doS(num) {
            setTimeout(() => {
                body.reqBody = {list : list.slice(num, num + 15)};
                CONNECTS[`${store.ip}:${store.port}`].write(JSON.stringify(body));
            }, num * 20);
        }
        cb();        
     } else {
        cb(703);
        log_tcp.error(`${store.ip}:${store.port} has already disconnected`);
     }
}

function getOnlineAPs() {
    return _.keys(CONNECTS);
}

exports.updateESL    = updateESL;
exports.getOnlineAPs = getOnlineAPs;
