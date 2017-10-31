'use strict';

const http           = require('http');
const path           = require('path');
const logger         = require('morgan');
const config         = require('config');
const express        = require('express');
const bodyParser     = require('body-parser');
const methodOverride = require('method-override');
const esl            = require('./routes/esl');
const store          = require('./routes/store');
const router         = express.Router();
const app            = express();
const net            = require('net');
const tcpServer      = net.createServer();
const tcp            = require('./routes/tcp');
const middleware     = require('wechat-pay').middleware;
const initConfig     = config.initConfig;
const Payment        = require('wechat-pay').Payment;
require('./scripts/schedule');

tcp.init(tcpServer);
app.set('port', config.port);
app.use(logger('dev'));
app.use(methodOverride());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

/*跨域问题*/
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    next();
});
app.use('/wxCallback', middleware(initConfig).getNotify().done((message, req, res, next) => {
	console.log("0");
	let order = {
		                  body             : "丰灼商品",
						  out_trade_no     : "20171111123456",
						  total_fee        : 1,
						  spbill_create_ip : "10.114.110.1",
						  trade_type       : 'NATIVE',
						  notify_url       : 'http://tiny.fndroid.com/wxNotify',
						  product_id       : message.product_id
	};
	console.log("1111111");
	let payment = new Payment(initConfig);
	let  sendmessage = {
    return_code : 'SUCCESS',
    mch_id      : '1481533452',
    result_code : 'SUCCESS',
   

  };
  
	payment.getBrandWCPayRequestParams(order, (err, payargs) => {
			    if (err) {
			    	console.log("1111");
			    	console.log(err);
			    } else {
			    	console.log("222222");
			    	sendmessage.appid = payargs.appId;
			    	sendmessage.mch_id = '1481533452';
			    	sendmessage.nonceStr = payargs.nonceStr;
			    	sendmessage.prepay_id = payargs.package.substring(10,40);
			    	sendmessage.sign = payargs.paySign;


			    	console.log(payargs);
			    }
			});
	let xmlmessage = payment.buildXml(sendmessage);
    //order.wxCallback(message);
   console.log(xmlmessage);
    res.status(200).end(sendmessage);
}));

/*上传/更新 商品列表*/
app.post('/esl/uploadexcell'   , esl.uploadExcell);

app.post('/esl/addsales'       , esl.addSales);

app.get('/esl/getallsales'     , esl.getallsales);

app.post('/esl/update'         , esl.updateESL);
/*商品搜索*/
app.get('/sku/search'          , esl.searchSKU);

app.get('/esl/update/status'   , esl.statusOfUpdate);

app.post('/store/add'          , store.addStore);

app.get('/store/get'           , store.getStores);

app.get('/store/online/get'    , store.getOnlineStore);

app.post('/group/login'        , store.groupLogin);

app.post('/store/login'        , store.storeLogin);

app.post('/store/price'        , store.changePrice);

app.post('/store/changepasswd' , store.changePasswd);
//分店获取商品
app.get('/store/sku/get'       , esl.getSkus);

app.post('/esl/uploadmp4'      , esl.uploadMp4);

app.get('/esl/mp4/get'         , esl.getMp4url);

app.post('/esl/price'          , esl.changePrice);

app.get('/esl/sale/search'     , esl.searchSalesInfo);

app.get('/esl/scheme/get'      , esl.getScheme);

app.post('/esl/scheme/add'     , esl.addScheme);

app.post('/esl/scheme/delete'  , esl.deleteScheme);



app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});

