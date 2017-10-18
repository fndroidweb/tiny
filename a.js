'use strict';

let resMsg = 'ESL image changed succsse.(88.1.3.3)[6925303773106]'
let ret = resMsg.match(/ESL .*\[(\d+)\]/);
console.log(ret)