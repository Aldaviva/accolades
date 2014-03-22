var _       = require('lodash');
var assert  = require('assert-plus');
var config  = require('../common/config');
var logger  = require('../common/logger')(module);
var Q       = require('q');
var request = require('../common/request');

/**
 * @param recipientId numeric ID of recipient employee in Paylocity (ex: 137)
 * @param body the details text field of the recognition
 * @param opts
 *		- jar: request CookieJar to use for session persistence
 */
module.exports.recognize = function(recipientId, body, opts){
	var formUrl = config.paylocity.baseUrl+'Company/Impression/Recognition_Add_Popup?&empId='+recipientId+'&co='+config.paylocity.company;
	var submissionUrl = config.paylocity.baseUrl+'Company/Impression/Recognition_Add';

	return request({
			url: formUrl,
			jar: opts.jar
		})
		.then(function(recognitionForm){
			var companyId  = recognitionForm.body.match(/CompanyId".*?value="(\w+)\"/)[1];
			var employeeId = recognitionForm.body.match(/EmployeeId".*?value="(\w+)\"/)[1];

			var requestForm = decorateFormWithRandomBadge({
				IsPublic   : 'True',
				Details    : body,
				EmployeeId : employeeId,
				CompanyId  : companyId
			});

			return request({
				url    : submissionUrl,
				method : 'post',
				jar    : opts.jar,
				form   : requestForm
			});
		});
};

function decorateFormWithRandomBadge(form){
	var badge = _.sample(BADGES);

	return _.extend({
		Title              : badge.title,
		CBadgeId           : badge.cImpressionsBadgesID,
		BadgeSelectedIndex : badge.index
	}, form);
}

var BADGES = _.map([
	// { index:  0, cImpressionsBadgesID: 169608, title: "Communication"         },
	// { index:  1, cImpressionsBadgesID: 169609, title: "Customer Satisfaction" },
	// { index:  2, cImpressionsBadgesID: 169610, title: "Efficiency"            },
	{ index:  3, cImpressionsBadgesID: 169611, title: "Get It Done"           },
	{ index:  4, cImpressionsBadgesID: 169612, title: "Great Job"             },
	{ index:  5, cImpressionsBadgesID: 169613, title: "Help"                  },
	// { index:  6, cImpressionsBadgesID: 169614, title: "Innovation"            },
	// { index:  7, cImpressionsBadgesID: 169615, title: "Leadership"            },
	// { index:  8, cImpressionsBadgesID: 169616, title: "Mentor"                },
	{ index:  9, cImpressionsBadgesID: 169617, title: "Motivation"            },
	{ index: 10, cImpressionsBadgesID: 169618, title: "Outstanding"           },
	// { index: 11, cImpressionsBadgesID: 169619, title: "Presentation"          },
	{ index: 12, cImpressionsBadgesID: 169620, title: "Problem Solver"        },
	{ index: 13, cImpressionsBadgesID: 169621, title: "Team Player"           },
	{ index: 14, cImpressionsBadgesID: 169622, title: "Thanks"                },
	{ index: 15, cImpressionsBadgesID: 169623, title: "Top Gun"               }
], function(item, index){
	return _.extend({ index: index }, item);
});