var _      = require('lodash');
var config = require('../common/config');
var logger = require('../common/logger')(module);
var server = require('./server');

server._router.get('/dashboard', function(req, res){
	logger.debug("get dashboard view");

	var context = {
		config: JSON.stringify(_.pick(config, ['floorplan', 'httpServer']))
	};

	res.render('dashboard', context);
});
