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

app.post('/store/price'        , store.changeprice);

app.post('/store/changepasswd' , store.changePasswd);

app.post('/esl/uploadmp4'      , esl.uploadMp4);

app.get('/esl/mp4/get'         , esl.getMp4url);

app.post('/esl/price'          , esl.changePrice);

app.post('/esl/searchsalesinfo', esl.searchSalesInfo);

app.get('/esl/scheme/get'      , esl.getScheme);





app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});

