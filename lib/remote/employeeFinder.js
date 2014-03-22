var _       = require('lodash');
var assert  = require('assert-plus');
var config  = require('../common/config');
var logger  = require('../common/logger')(module);
var Q       = require('q');
var request = require('../common/request');

var PAGE_SIZE = 29;

/**
 * @param opts
 *		jar - cookie jar to store authentication, created by request.jar()
 */
module.exports.findEmployees = function(opts){
	assert.object(opts.jar, 'opts.jar');

	//pages are numbered starting from 1, and contain at most 29 items (regardless of pageSize parameter)
	logger.debug("Finding employees.")
	return requestPage(1, { jar: opts.jar })
		.then(function(page1res){
			assert.arrayOfObject(page1res.body.Data, 'page1res.body.Data');
			var totalEmployeeCount = page1res.body.Total;
			var totalPages = Math.ceil(totalEmployeeCount / PAGE_SIZE);

			return Q.all([page1res].concat(
				_(2)
					.range(totalPages+1)
					.map(function(pageNum){
						return requestPage(pageNum, { jar: opts.jar });
					})
					.value()));
		})
		.then(function(pages){
			return _(pages)
			.map(function(res){
				assert.arrayOfObject(res.body.Data, 'res.body.Data');
				return res.body.Data;
			})
			.flatten()
			.value();
		});
};

function requestPage(pageNum, opts){
	logger.debug({ pageNum: pageNum }, "Downloading a page of employees.");

	return request(_.extend({
		url    : config.paylocity.baseUrl + 'Company/Employee/AdvancedSearch',
		method : 'post',
		form   : {
			page     : pageNum,
			pageSize : PAGE_SIZE,
			filter   : "alphabet~eq~'All'",
			sort     : '',
			group    : ''
		},
		json: true
	}, opts));
}