'use strict';
require('date-utils');

let now = new Date();
let a = new Date().addMinutes(10)
let b = new Date().addMinutes(-10)
console.log(now.between(b,a))