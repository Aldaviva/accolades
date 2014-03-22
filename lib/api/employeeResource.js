var _               = require('lodash');
var employeeService = require('../service/employeeService');
var logger          = require('../common/logger')(module);
var server          = require('./server');


server.get({ path: '/employees', name: 'listEmployees' }, function(req, res, next){
	employeeService.getEmployees()
		.then(function(employees){
			res.send(employees);
		})
		.fail(function(err){
			res.send(403, { error: err });
			logger.error(err);
		});
});

server.post({ path: /\/employees\/([^\/]+)\/impression/, name: 'createImpression' }, function(req, res, next){
	var query;
	if(!_.isNaN(Number(req.params[0]))){
		query = Number(req.params[0]);
	} else {
		query = decodeURIComponent(req.params[0]);
	}

	employeeService.findEmployee(query)
		.then(function(employee){
			var author = req.body.author;
			var message = req.body.message;
			return employeeService.createImpression(employee, author, message);
		})
		.then(function(){
			res.send(204);
		})
		.fail(function(err){
			res.send(404, err);
		});
});