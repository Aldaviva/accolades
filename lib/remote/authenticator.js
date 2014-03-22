var config  = require('../common/config');
var logger  = require('../common/logger')(module);
var Q       = require('q');
var request = require('../common/request');
var assert  = require('assert-plus');


/**
 * @param opts
 *		jar - cookie jar to store authentication, created by request.jar()
 */
module.exports.logIn = function(opts){
	assert.object(opts.jar, 'opts.jar');

	logger.debug({ company: config.paylocity.company, username: config.paylocity.username }, "Logging in to Paylocity.");

	var loginUrl = config.paylocity.baseUrl+'views/login/login.aspx';

	//must GET the login page before POSTing our credentials so we get a sessionId cookie
	return request({
			url    : loginUrl,
			method : 'get',
			jar    : opts.jar
		})
		.then(function(res){
			return request({
				url            : loginUrl,
				method         : 'post',
				followRedirect : false,
				jar            : opts.jar,
				form           : {
					coCode                       : config.paylocity.company,
					loginName                    : config.paylocity.username,
					password                     : config.paylocity.password,
					__EVENTTARGET                : "loginButton",
					__EVENTARGUMENT              : '',
					browserWidth                 : 1920,
					browserHeight                : 1172,
					redirectUrl                  : '',
					hdnVendorNavPage             : '',
					radXmlHttpPanel1_ClientState : '',
					chkRemember                  : 'off'
				}
			});
		})
		.then(function(res){
			if(res.statusCode !== 302){
				//TODO extract error message from HTML response using some sort of SGML parsing library if we care
				var error        = new Error("Failed to log in");
				error.username   = config.paylocity.username;
				error.company    = config.paylocity.company;
				error.statusCode = res.statusCode;
				error.url        = url;
				error.cause      = res.body.match(/criticalmessage[^]*<li>(.*)<\/li>/)[1];
				// error.body       = res.body;

				logger.warn({ error: error }, error.message);

				throw error;
			} else {
				logger.debug({ company: config.paylocity.company, username: config.paylocity.username }, "Logged in.");
			}
		});
};

/**
 * @param opts
 *		jar - cookie jar to remove authentication from, created by request.jar()
 */
module.exports.logOut = function(opts){
	assert.object(opts.jar, 'opts.jar');

	logger.debug("Logging out of Paylocity.");
	return request({
			url            : config.paylocity.baseUrl+'views/login/logout.aspx',
			method         : 'get',
			followRedirect : false,
			jar            : opts.jar
		})
		.then(function(){
			logger.debug("Logged out.");
		});
};