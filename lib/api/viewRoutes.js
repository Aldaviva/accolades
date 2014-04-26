var _      = require('lodash');
var auth   = require('../auth/auth');
var config = require('../common/config');
var logger = require('../common/logger')(module);
var server = require('./server');

var defaultContext = {
	config: JSON.stringify(_.pick(config, ['floorplan', 'httpServer']))
};

server.get('/dashboard', function(req, res){
	var context = _.merge({}, defaultContext);

	res.render('dashboard', context);
});

server.get('/admin', auth.requireAdminUser, function(req, res){
	var context = _.merge({}, defaultContext);

	res.render('admin', context);
});