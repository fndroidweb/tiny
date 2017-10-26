'use strict';


module.exports = {
	mongo: {
		uri : 'mongodb://tiny:123456@106.14.214.43:27017/tiny'
	},
	port: 6886,
	domain: 'http://tiny.fndroid.com',
	tcpPort: 9009,
	ErrCode : {
    	500 : 'system error',
        501 : 'search error',
    	600 : 'store already exists',
    	601 : 'barcode can not be null',
        602 : 'user can not be null',
        603 : 'passwd can not be null',
        604 : 'user no dot exist',
        605 : 'passwd error',
        606 : 'store name can not be null',
        607 : 'please login first',
        608 : 'update failed',
        609 : 'the two passwds are not equal',
        610 : 'the two passwds are the same',
        611 : 'please upload a file of excel',
        612 : 'invalid excel file',
        613 : 'group name can not be null',
        614 : 'sku name can not be null',
        615 : 'sale_price can not be null',
        616 : 'inner_code can not be null',
        617 : 'price must be a number',
        618 : 'date format error',
    	700 : 'store_ID can not be null',
    	701 : 'store do not exist',
    	702 : 'SKU do not exist',
    	703 : 'client has already disconnected',
        704 : 'group do not exist',
        705 : 'group do not have any store',
        706 : 'req_id can not be null',
        707 : 'invalid resMsg',
        708 : 'no update infomation for req_id',
        801 : 'barcode is null',
        802 : 'barcode not exist',
        803 : 'sku need to be sent',
        804 : 'store id need to be sent',
        805 : 'price need to be sent',
        901 : 'scheme_price need to be sent',
        902 : 'store_type need to be sent',
        903 : 'scheme_type need to be sent',
        904 : 'category or barcode need to be sent',
        905 : 'save sheme failed'
    }
}
