'use strict';

const _             = require('lodash');
const elasticsearch = require('elasticsearch');
const esClient      = new elasticsearch.Client({
	host: '106.14.214.43:9200',
	log: 'error'
});

const search = function search(index, body) {
	return esClient.search({index: index, body: body});
};



exports.searchSKU = (infos, cb) => {
	let body = null;
	if (infos.condition) {
		body = {
			size: infos.limit,
			from: infos.start,
			query: {
				bool : {
					must   : [
					{	
						multi_match : {
							type     : 'cross_fields',
							query    : infos.condition,
							fields   : ['name', 'origin', 'category', 'inner_code', 'supplier'],
							operator : 'and'
			        	}
			        }]
			    }
			}
		};

		if (infos.group_name) {
			body.query.bool.must.push({
				match : {
					group_name : {
						query : infos.group_name,
						type  : 'phrase'
					}
				}
			})
		}

	} else {
		body = {
			size: infos.limit,
			from: infos.start
		}
		if (infos.group_name) {
			body.query = {
				match: {
					group_name: {
						query : infos.group_name,
						type  : 'phrase'
					}
				}			
			}
		} else {
			body.query = {
				match_all: {}
			}		
		}
	}
	console.log(body)
	search('sku', body)
	.then(results => {
		console.log(`found ${results.hits.total} items in ${results.took}ms`);
		cb(null, _.map(results.hits.hits, '_source'), results.hits.total);
	})
	.catch((error) => {
		cb(501, error);
	});
};
