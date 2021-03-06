'use strict';

const fs      = require('fs');
const _       = require('lodash');
const async   = require('async');
const SKU     = require('../models/sales');
const Store   = require('../models/store');
const TCP     = require('../routes/tcp');
const Sales   = require('../models/sales');
const util    = require('../common/util');
const config  = require('../config/default');
const Group   = require('../models/group');
const Bind    = require('../models/bind');
const Scheme  = require('../models/scheme');
const Search  = require('../common/elasticsearch');
const Excel   = require('exceljs');
const Status  = ['初始化','绑定','开始更新','正在更新','显示成功','显示失败']


exports.addScheme = (infos, cb) =>{
	async.waterfall([
		(_cb) =>{
			Scheme.create(infos, (err, doc) => {
				if (err) {
					_cb(500);
				} else if(!doc) {
					_cb(905);
				} else {
					_cb();
				};
			})
		}
	],
	cb
	)
}


exports.deleteScheme = (infos, cb) =>{
	async.waterfall([
		(_cb) => { 
			Scheme.findOne(infos, (err, doc) => {
				if (err) {
					_cb(500);
				} else if(!doc) {
					_cb(909);
				} else {
					_cb();
				};
			})
		},
		(_cb) => {
			Scheme.remove(infos, (err) => {
				if (err) {
					_cb(500);
				} else {
					_cb();
				}
			});
		}
	],
	cb
	)
}

exports.getScheme = (infos, cb) => {
	async.waterfall([
		(_cb) =>{
			Scheme.find({store_id: infos.store_id}, (err, docs) => {
				if (err) {
					_cb(500);
				} else {
					let SKUTYPE = ['全部', '单个', '一类'];
					let SHEMETYPE = ['', '时间点', '时间段', '时间周期', '保质期', '库存', '销量'];
					let list = [];
					for (let i = 0; i < docs.length; i++) {
						let item = {};
						item.sku_type        = SKUTYPE[docs[i].sku_type];
						item.scheme_type     = SHEMETYPE[docs[i].scheme_type];
						item.scheme_name     = docs[i].scheme_name;
						item.barcode         = docs[i].barcode;
						item.category        = docs[i].category;
						item.scheme_price    = docs[i].scheme_price;
						item.scheme_discount = docs[i].scheme_discount; 
						item.start_time      = docs[i].start_time ? docs[i].start_time.toFormat("YYYY-MM-DD HH24:MI:SS") : undefined;
						item.end_time        = docs[i].end_time ? docs[i].end_time.toFormat("YYYY-MM-DD HH24:MI:SS"): undefined;
						item.cycle_time      = docs[i].cycle_time ? docs[i].cycle_time.toFormat("YYYY-MM-DD HH24:MI:SS"): undefined;
						list.push(item);
					}
					_cb(null, list);
				};
			})
		}
	],
	cb
	)
}

exports.searchSalesInfo = (infos, cb) =>{
	async.waterfall([
		(_cb) =>{
			SKU.findOne({barcode : infos.barcode}, (err,doc) => {
				if(err){
					_cb(500);
				} else if(!doc){	
					_cb(802);	
				} else {
					_cb(null, doc);
				}
			})
		}
	],
	cb
	)
}

exports.changePrice = (infos, cb) => {
	async.waterfall([
		(_cb) =>{
        	Group.findOne({group_id : infos.group}, (err, doc) => {
        		if (err) {
        			_cb(500);
        		} else if (!doc) {
        			_cb(704);
        		} else {
        			_cb(null, doc);
        		}
        	});
		},
		(group, _cb) => {
			SKU.findOne({barcode: infos.barcode, group_name: group.group_name}, (err, doc) => {
				if (err) {
					_cb(500);
				} else if (!doc){
					_cb(702);
				} else {
					_cb(null, group, doc);
				}				
			});
		},		
		(group, sku, _cb) =>{
			SKU.update({
				barcode :infos.barcode,
				group_name : group.group_name
			}, {sale_price : infos.price}, (err) => {
				if(err){
					_cb(500);
				} else {
					sku.sale_price = infos.price;
					_cb(null, group, sku);
				}
			});
		},
		(group, sku, _cb) => {
       		Store.find({group : group.group_id}, (err, doc) => {
        		if (err) {
        			_cb(500);
        		} else if (!doc.length) {
        			_cb(705);
        		} else {
        			_cb(null, doc, sku);
        		}
        	});			
		},
		(stores, sku, _cb) => {
        	let req_id   = util.getID('price');
        	let count    = 0;
        	async.eachSeries(stores, (store, __cb) => {
        		if (!store.status) return __cb();
 				changeOnePrice(store, sku, req_id, (err) => {
 					if (!err) count++;
 					__cb();
 				});
        	}, (err) => {
                if (err) {
                    _cb(err);
                } else {
                    _cb(null, req_id, count);
                }
            });			
		}
	],
	cb
	)
}

function changeOnePrice(store, sku, req_id, cb) {
	async.waterfall([
		(_cb) => {
		    Bind.findOne({store_id : store.store_id, barcode : sku.barcode}, (err, doc) => {
    			if (err) {
    				_cb(500);
    			} else if (!doc) {
    				_cb(702);
    			} else {
    				_cb();
    			}
    		});
		},
		(_cb) => {
			TCP.updateESL(store, [sku], req_id, _cb);
		},
		(_cb) => {
			Bind.update({store_id : store.store_id, barcode : sku.barcode}, {
				req_id : req_id,
				status : 2,
				$unset : {
					sale_price : true
				}
			}, (err) => {
				if (err) {
					_cb(500);
				} else {
					_cb();
				}
			});	
		},
	],
	cb)
}


exports.getMp4url = (infos,cb) =>{
	async.waterfall([
		(_cb) => {
			Sales.findOne({ barcode :infos.barcode },(err,doc) =>{
				if(err){
					_cb(500,err);
				}else{
					var ad = `${config.domain}`+`${":"}`+`${config.port}`+'/'+doc._id+'/'+doc.ad_url;
					_cb(null,ad);
				}

			});
		}
	],
	cb)
}

exports.uploadMp4 = (infos,files,cb) =>{
	async.waterfall([

        (_cb) => {
            Sales.findOne({barcode :infos.barcode}, (err, doc) => {
                if (err) {
                    _cb(500, err);
                } else {
                	if(!doc){
                		
                		_cb(802,"barcode is not exist");
                	}else{
                		_cb(null, doc);
                	}
                    
                }
            })
        }
	,(data,_cb) => {
            fs.exists(`public/${data._id}`,(result) =>{
	    		if(!result){
	    			
	    				/*
	    				*根据用户id和文件名创建文件夹
	    				*/
	    			fs.mkdirSync(`public/${data._id}`);
	    			
	    			fs.rename(`${files.doc.path}`,`public/${data._id}/${files.doc.name}`,(err) =>{
	    				if(err){
	    					console.log(err);
	    				}

	    			});
	    		

	    			
	    		}else{
	    			
	    				fs.rename(`${files.doc.path}`,`public/${data._id}/${files.doc.name}`,(err) =>{
	    				if(err){
	    					console.log(err);
	    				}

	    			});
	    			

	    			
	    		}
	    	});
	    	// console.log(files);
	    	// var uri = `${config.domain}`+`${":"}`+`${config.port}`+'/'+data._id+'/'+files.doc.name;
	    	// var url = encodeURI(uri);
	    	var url = files.doc.name;
	    	console.log(url);
	    	_cb(null,url);
            
        },(url,_cb) =>{
        	console.log(url);
        	Sales.update({ barcode :infos.barcode },{ad_url :url},(err,doc) =>{
        		if(err){
        			_cb(500,err);
        		}else{
        			if (!doc) {
        				_cb(500,err);
        			}else{
        				_cb(null,"update successfully");
        			};
        		}

        	});
        }

		],
		cb)
}

exports.uploadStorefile = (sales, store_id, cb) =>{
	async.waterfall([
		(_cb) => {
			Store.findOne({store_id}, (err, doc) => {
				if (err) {
					_cb(500);
				} else if (!doc) {
					_cb(701);
				} else {
					_cb(null, doc);
				}
			});
		},
        (store, _cb) => {
        	let barcodes = [];
        	if (!sales || !sales.length) return _cb(612);
        	sales = sales.slice(1);
        	for (let i = 0; i < sales.length; i++) {
 				if (!sales[i][0]) {
	        		return __cb(613);
	        	} else if (!sales[i][1]) {
	        		return __cb(601);
	        	} else if(!sales[i][2]) {
	        		return __cb(614);
	        	} else if(!sales[i][3] || isNaN(sales[i][3])) {
	        		return __cb(615);
	        	} else if(!sales[i][11]){
	        		return __cb(616);
	        	} else if (sales[i][4] && isNaN(sales[i][4])) {
	        		return __cb(617);
	        	} else if (sales[i][5] && isNaN(sales[i][5])) {
	        		return __cb(617);
	        	} else if (sales[i][12] && isNaN(sales[i][12])) {
	        		return __cb(618);
	        	} else if (sales[i][13] && isNaN(sales[i][13])) {
	        		return __cb(618);
	        	} else if (sales[i][17] && isNaN(sales[i][17])) {
	        		return __cb(618);
	        	}
	        	barcodes.push(sales[i][1]);      		
        	}
        	let req_id   = util.getID('request');
    		Bind.find({store_id : store_id, barcode : {$in: barcodes}}, (err, docs) => {
    			if (err) {
    				_cb(500);
    			} else if (!docs.length) {
    				_cb(910);
    			} else {
    				let posts = [];
    				for (let i = 0; i < docs.length; i++) {
    					let index = _.indexOf(barcodes, docs[i].barcode);
    					if (docs[i].sale_price == sales[index][3] &&
    						docs[i].original_price == sales[index][4] &&
    						docs[i].leaguer_price == sales[index][5]) {
    						continue;
    					}
    					posts.push({
    						group_name     : sales[index][0],
    						barcode        : sales[index][1],
    						name           : sales[index][2],
    						sale_price     : sales[index][3],
    						original_price : sales[index][4],
    						leaguer_price  : sales[index][5],
    						unit           : sales[index][6],
    						origin         : sales[index][7],
    						level          : sales[index][8],
    						specification  : sales[index][9],
    						locate_str     : sales[index][10],
    						inner_code     : sales[index][11],
    						promotion_start: new Date(1900, 0, sales[index][12]),
    						promotion_end  : new Date(1900, 0, sales[index][13]),
    						qrcode         : sales[index][14],
    						price_employee : sales[index][15],
    						supper_telphone: sales[index][16],
    						print_date     : new Date(1900, 0, sales[index][17]),
    						exhibition     : sales[index][18],
    						shelf_position : sales[index][19],
    						inventory      : sales[index][20],
    						supplier       : sales[index][21],
    					});
    					Bind.update({store_id : store_id, barcode : docs[i].barcode}, {
    						sale_price : sales[index][3],
    						original_price : sales[index][4],
    						leaguer_price  : sales[index][5]
    					}, (err) => {/*do nothing*/});
    				}
    				if (posts.length) {
    					TCP.updateESL(store, posts, req_id, (err) => {
    						if (err) return _cb(err);
    					});
    				}
    				_cb(null, posts, req_id);
    			}
    		});
        }
	],
	cb
	)
}


exports.uploadExcell = (sales, group_id, cb) => {
	async.waterfall([
		(_cb) => {
			Group.findOne({group_id}, (err, doc) => {
				if (err) {
					_cb(500);
				} else if (!doc) {
					_cb(701);
				} else {
					_cb(null, doc.group_name);
				}
			});
		},
		(group_name, _cb) => {
			let list = [];
			let diff = [];
            async.eachSeries(sales.slice(1), (sale, __cb) => {
 				if (!sale.length) {
 					return __cb();
 				} else if (!sale[0]) {
	        		return __cb(613);
	        	} else if (!sale[1]) {
	        		return __cb(601);
	        	} else if(!sale[2]) {
	        		return __cb(614);
	        	} else if(!sale[3] || isNaN(sale[3])) {
	        		return __cb(615);
	        	} else if(!sale[15]){
	        		return __cb(616);
	        	} else if (group_name != sale[0]) {
	        		return __cb();
	        	} else if (sale[4] && isNaN(sale[4])) {
	        		return __cb(617);
	        	} else if (sale[6] && isNaN(sale[6])) {
	        		return __cb(617);
	        	} else if (sale[16] && isNaN(sale[16])) {
	        		return __cb(618);
	        	} else if (sale[17] && isNaN(sale[17])) {
	        		return __cb(618);
	        	} else if (sale[21] && isNaN(sale[21])) {
	        		return __cb(618);
	        	}

                Sales.findOne({group_name : sale[0], barcode: sale[1]}, (err, doc) => {
                    if (err) {
                        return __cb(500, err);
                    }
                    let KEYS = [
                    	'group_name', 'barcode', 'name', 'sale_price', 'original_price',
                    	'reduction_reason', 'leaguer_price', 'unit', 'discount_node', 'origin',
                    	'level', 'specification', 'category', 'put_style', 'locate_str',
                    	'inner_code', 'promotion_start', 'promotion_end', 'qrcode', 'price_employee',
                    	'supper_telphone', 'print_date', 'exhibition', 'shelf_position', 'inventory',
                    	'supplier'
                    ]
                    let sku = {};
                    for (let i = 0; i < Math.min(sale.length, KEYS.length); i++) {
                    	let key = KEYS[i];
                    	if (i == 3 || i == 4 || i == 6) {
                    		if (sale[i]) {
                    			sku[key] = +sale[i];
                    		} else {
                    			sku[key] = sale[i];
                    		}
                    	} else if (i == 16 || i == 17 || i == 21) {
                    		if (sale[i]) {
                    			sku[key] = new Date(1900, 0, sale[i]);
                    		} else {
                    			sku[key] = sale[i];
                    		}                  		
                    	} else {
                    		if (sale[i]) sku[key] = sale[i].toString();
                    	}
                    }
                    if (doc) {
                    	let usku = _.cloneDeep(sku);
                    	let flag = false;
                    	_.forEach(sku, (value, key) => {
                    		if (value) {
                    			if (!_.isEqual(value, doc[key])) {
                    				usku[key] = [doc[key], value];
                    				flag = true;
                    			}
                    		}
                    	});
                    	if (flag) {
                    		Sales.update({group_name : sale[0], barcode: sale[1]}, sku, __cb);
                    		list.push(usku);
                    		diff.push(sku);
                    	} else {
                    		__cb();
                    	}
                    } else {
			        	Sales.create(sku, __cb);
			        	list.push(sku);
			        }  
                });
            }, (err, data) => {
                if (err) {
                    _cb(err, data);
                } else {
                    _cb(null, list, diff);
                }
            });                
        },
        (list, diff, _cb) => {
        	Store.find({group : group_id}, (err, doc) => {
        		if (err) {
        			_cb(500);
        		} else if (!doc.length) {
        			_cb(705);
        		} else {
        			_cb(null, doc, list, diff);
        		}
        	});
        },
        (stores, list, diff, _cb) => {
        	let barcodes = _.map(diff, 'barcode');
        	let req_id   = util.getID('request');
        	async.eachSeries(stores, (store, __cb) => {
        		if (!store.status) return __cb();
        		Bind.find({store_id : store.store_id, barcode : {$in: barcodes}}, (err, docs) => {
        			if (err) {
        				__cb(500);
        			} else if (!docs.length) {
        				__cb();
        			} else {
        				let posts = [];
        				for (let i = 0; i < docs.length; i++) {
        					let index = _.indexOf(barcodes, docs[i].barcode);
        					posts.push(diff[index]);
        					Bind.update({store_id : store.store_id, barcode : docs[i].barcode}, {
        						req_id : req_id,
        						status : 2,
        						$unset : {
        							sale_price     : true,
        							original_price : true,
        							leaguer_price  : true
        						}
        					}, (err) => {/*do nothing*/});
        				}
        				TCP.updateESL(store, posts, req_id, __cb);
        			}
        		});
        	}, (err) => {
                if (err) {
                    _cb(err);
                } else {
                    _cb(null, list, req_id);
                }
            });  
        }
	],
	cb)
}

exports.getallsales = (infos,cb) =>{
	async.waterfall([
		(_cb) => {
			Sales.find({},function(err,doc){
				if(err){
					_cb(500,"查询失败");

				}else{
					if(doc){
						_cb(null,doc);
					}else{
						_cb(502,"查询失败");
					}

				}

			});
		}
	],
	cb)

}

exports.addSales = (infos, cb) => {
	async.waterfall([
		(_cb) => {
			Sales.findOne({name: infos.name}, (err, doc) => {
				if (err) {
					_cb(501);
				}else {
					if (doc) {
						_cb(604,"sales exist");
					} else {
						_cb();
					}
				}
			});
		},
		(_cb) => {
			
			Sales.create(infos, (err, doc) => {
				if(err){
					_cb(502,"数据类型不对");
				} else {
					_cb(null, "添加成功");
				}
			});
		}
	],
	cb)
}
 /**
  * 更新标签
  */
exports.updateESL = (infos, cb) => {
	async.waterfall([
		(_cb) => {
			Store.findOne({store_id: infos.store_ID}, (err, doc) => {
				if (err) {
					_cb(500);
				} else if (!doc){
					_cb(701);
				} else {
					_cb(null, doc);
				}
			})
		},
		(store, _cb) => {
			SKU.findOne({barcode: infos.barcode}, (err, doc) => {
				if (err) {
					_cb(500);
				} else if (!doc){
					_cb(702);
				} else {
					_cb(null, store, doc);
				}				
			});
		},
		(store, sku, _cb) => {
			TCP.updateESL(store, [sku], util.getID('random'), _cb);
		}
	],
	cb
	)
}

 /**
  * 搜索商品
  */
exports.searchSKU = (infos, cb) => {
	async.waterfall([
		(_cb) => {
			let data = {
				condition : infos.condition,
				start     : infos.start,
				limit     : infos.limit
			};
			if (infos.group_id) {
				Group.findOne({group_id: infos.group_id}, (err, doc) => {
					if (err) {
						_cb(500);
					} else if (!doc){
						_cb(704);
					} else {
						data.group_name = infos.group_name;
						_cb(null, data);
					}
				})
			} else {
				_cb(null, data);
			}
		},
		(data, _cb) => {
			Search.searchSKU(data, _cb);
		}
	],
	cb
	)
}

 /**
  * 更新状态
  */
exports.statusOfUpdate = (infos, cb) => {
	let group_name = null;
	async.waterfall([
		(_cb) => {
			Group.findOne({group_id: infos.group_id}, (err, doc) => {
				if (err) {
					_cb(500);
				} else if (!doc){
					_cb(704);
				} else {
					group_name = doc.group_name;
					_cb();
				}
			})			
		},
		(_cb) => {
			Store.find({group: infos.group_id}, (err, doc) => {
				if (err) {
					_cb(500);
				} else if (!doc.length){
					_cb(704);
				} else {
					_cb(null, doc);
				}
			})
		},
		(stores, _cb) => {
			let store_IDs = _.map(stores, 'store_id');
			Bind.find({req_id: infos.req_id, store_id: {$in: store_IDs}}, (err, doc) => {
				if (err) {
					_cb(500)
				} else if (!doc.length) {
					_cb(708);
				} else {
					_cb(null, doc, stores);
				}
			});
		},
		(binds, stores, _cb) => {
			let barcodes  = _.map(binds, 'barcode');
			let list = [];
			Sales.find({group_name: group_name, barcode: {$in: barcodes}}, (err, doc) => {
				if (err) {
					_cb(500)
				} else {
					let store_IDs = _.map(stores, 'store_id');
					let skus      = _.map(doc, 'barcode');
					for (let i = 0; i < binds.length; i++) {
						let index = store_IDs.indexOf(binds[i].store_id);
						let num   = skus.indexOf(binds[i].barcode)
						list.push({
							store_name : stores[index].store_name,
							barcode    : binds[i].barcode,
							name       : doc[num].name,
							sale_price : doc[num].sale_price,
							status     : Status[binds[i].status]
						});
					}
					_cb(null, list)
				}
			});
		}
	],
	cb
	)
}
/**
  * 分店获取商品表
  */
exports.getExcell = (infos, cb) =>{
	async.waterfall([
		(_cb) =>{
			Store.findOne({store_id : infos.store_id},(err, doc) => {
				if(err){
 					_cb(500, err);
 				} else if (!doc) {
 					_cb(701);
 				} else {
 					_cb(null, doc.group);
 				}
 			});	
		},
		(group_id, _cb) => {
			Group.findOne({group_id}, (err, doc) => {
 				if(err){
 					_cb(500, err);
 				} else if (!doc) {
 					_cb(704);
 				} else {
 					_cb(null, doc.group_name);
 				}				
			});
		},
		(group_name, _cb) => {
			Bind.find({store_id: infos.store_id}, (err, docs) => {
 				if(err){
 					_cb(500, err);
 				} else {
 					_cb(null, docs);
 				}
			});
		},
		(skus,_cb) => {
			let barcodes = _.map(skus, 'barcode');
			let workbook = new Excel.stream.xlsx.WorkbookWriter({
               	filename: './public/sku.xlsx'
            });
            let worksheet = workbook.addWorksheet('Sheet');
    		SKU.find({ barcode : {$in: barcodes}}, (err, docs) => {
    			if (err) {
    				_cb(500);
    			} else if (!docs.length) {
    				_cb(910);
    			} else {
    				worksheet.columns = [
                    { header: 'group_name',     key: 'group_name' },
                    { header: 'barcode',        key: 'barcode' },
                    { header: 'name',           key: 'name' },
                    { header: 'sale_price',     key: 'sale_price' },
                    { header: 'original_price', key: 'original_price' },
                    { header: 'leaguer_price',  key: 'leaguer_price' },
                    { header: 'unit',           key: 'unit' },
                    { header: 'origin',         key: 'origin' },
                    { header: 'level',          key: 'level' },
                    { header: 'specification',  key: 'specification' },
                    { header: 'locate_str',     key: 'locate_str' },
                    { header: 'inner_code',     key: 'inner_code' },
                    { header: 'promotion_start',key: 'promotion_start' },
                    { header: 'promotion_end',  key: 'promotion_end' },
                    { header: 'qrcode',         key: 'qrcode' },
                    { header: 'price_employee', key: 'price_employee' },
                    { header: 'supper_telphone',key: 'supper_telphone' },
                    { header: 'print_date',     key: 'print_date' },
                    { header: 'exhibition',     key: 'exhibition' },
                    { header: 'shelf_position', key: 'shelf_position' },
                    { header: 'inventory',      key: 'inventory' },
                    { header: 'supplier',       key: 'supplier' }];

	            	for(let i in docs) {
				  		worksheet.addRow(docs[i]).commit();
                    }
                    workbook.commit();
                    let filepath = "tiny.fndroid.com:6886/sku.xlsx";
    				_cb(null, filepath);		
        		}
        	});
        }   	
	],
	cb
	)
}


 /**
  * 分店查询商品
  */
exports.getSkus = (infos, cb) => {
	async.waterfall([
		(_cb) => {
 			Store.findOne({store_id: infos.store_id}, (err, doc) => {
 				if(err){
 					_cb(500, err);
 				} else if (!doc) {
 					_cb(701);
 				} else {
 					_cb(null, doc.group);
 				}
 			});
		},
		(group_id, _cb) => {
			Group.findOne({group_id}, (err, doc) => {
 				if(err){
 					_cb(500, err);
 				} else if (!doc) {
 					_cb(704);
 				} else {
 					_cb(null, doc.group_name);
 				}				
			});
		},
		(group_name, _cb) => {
			Bind.find({store_id: infos.store_id}, (err, docs) => {
 				if(err){
 					_cb(500, err);
 				} else {
 					_cb(null, docs, group_name);
 				}
			});
		},
		(binds, group_name, _cb) => {
			if (!binds.length) return _cb(null, []);
			let barcodes = _.map(binds, 'barcode');
			Sales.find({group_name: group_name, barcode : {$in: barcodes}}, (err, docs) => {
				if(err){
	 				_cb(500, err);
	 			} else {
	 				for (let i = 0; i < docs.length; i++) {
	 					let index = barcodes.indexOf(docs[i].barcode);
	 					if (binds[index].sale_price) {
	 						docs[i].sale_price = binds[index].sale_price
	 					}
	 				}
	 				_cb(null, docs);
	 			}
			});
		}
	],
	cb
	)
}