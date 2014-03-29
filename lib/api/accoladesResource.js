var Accolade        = require('../data/model/Accolade');
var accoladeService = require('../service/accoladeService');
var logger          = require('../common/logger')(module);
var server          = require('./server');
var Moment = require('moment');

server.get('/accolades', function(req, res){
	accoladeService.find({
			minDate: null,
			maxDate: null
		})
		.then(function(accolades){
			res.send(200, accolades);
		})
		.done();
});

server.post('/accolades', function(req, res){
	var accolade = new Accolade(req.body);
	accoladeService.insert(accolade)
		.then(function(){
			res.send(201);
		})
		.done();
});