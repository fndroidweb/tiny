'use strict';
const fs = require('fs');
const _ = require('lodash');


let record = {};

exports.deleteFile = (files) => {
    _.map(files, (file) => {
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    })
}

exports.getID = (name, cb) => {
    let buf  = new Buffer(8);
    let pid  = process.pid;
    let time = Math.round((new Date).getTime()/1000);

    if (record[name] == null) {
        record[name] = 0;
    } else {
        record[name]++;
    }

    let seq = record[name];
    buf.writeUInt16LE(pid&0xffff, 0);
    buf.writeUInt32LE(time, 2);
    buf.writeUInt16LE(seq, 6);
    var id = buf.toString("hex").toUpperCase();
    if(cb) cb(id);
    else return id;
}