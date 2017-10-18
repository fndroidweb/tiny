'use strict';

const elasticsearch = require('elasticsearch');
const SKU = require('../models/sales');
const async = require('async');

const esClient = new elasticsearch.Client({
  host: '106.14.214.43:9200',
  log: 'error'
 });

const bulkIndex = (index, type, data) => {
	let bulkBody = [];
	
	data.forEach(item => {
		bulkBody.push({
			index: {
				_index: index,
				_type: type,
				_id: item.barcode
			}
		});
		bulkBody.push(item);
	});
	
	esClient.bulk({body: bulkBody})
	.then(response => {
		let errorCount = 0;
		response.items.forEach(item => {
			if (item.index && item.index.error) {
				console.log(++errorCount, item.index.error);
			}
		});
		console.log(`Successfully indexed ${data.length - errorCount} out of ${data.length} items`);
		process.exit();
	})
	.catch(console.err);
};

SKU.find({}, {_id : false, sale_price : false, leaguer_price : false, original_price: false}, (err, docs) => {
	bulkIndex('sku', 'group', docs);
});
