var pr_request2 = require('pr-request2');

module.exports = pr_request2.defaults({
	headers: {
		//user-agent header is required for login, otherwise it fails with the message "JavaScript Required"
		'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/33.0.1750.154 Safari/537.36'
	},
	proxy: 'http://sigyn.bluejeansnet.com:9998',
	strictSSL: false
});