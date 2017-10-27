'use strict';
require('date-utils');

let now = new Date();
console.log(Math.round(now.getTime()/1000))
console.log(new Date('2017-10-15T15:54:23.000Z').between(new Date().addMinutes(-10000), new Date()))