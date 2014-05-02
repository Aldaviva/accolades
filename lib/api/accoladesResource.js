var _               = require('lodash');
var Accolade        = require('../data/model/Accolade');
var accoladeService = require('../service/accoladeService');
var auth            = require('../auth/auth');
var logger          = require('../common/logger')(module);
var mediator        = require('../common/mediator');
var Moment          = require('moment');
var server          = require('./server');

var api = server.apiRouter;

api.get('/accolades', function(req, res, next){
	accoladeService.find(req.query)
		.then(function(accolades){
			res.send(accolades);
		})
		.fail(next);
});

api.post('/accolades', function(req, res, next){
	var accolade = new Accolade(req.body);
	accoladeService.create(accolade)
		.then(function(){
			res.set('Location', getRequestUrl(req)+'/'+accolade.id);
			res.send(201);
		})
		.fail(next);
});

api.get('/accolades/accolades.csv', function(req, res, next){
	var dateCriteria = _.defaults({
		minDate: req.query.min_date,
		maxDate: req.query.max_date
	}, {
		minDate: null,
		maxDate: null
	});

	accoladeService.findByDate(dateCriteria)
		.then(accoladeService.toCSV)
		.then(function(csvText){
			res.type('csv');
			res.send(csvText);
		})
		.fail(next);
});

api.get('/accolades/:id', function(req, res){
	accoladeService.findById(req.params.id)
		.then(function(accolade){
			if(!accolade){
				throw new Error("No accolade found with id = "+req.params.id);
			}
			res.send(accolade);
		})
		.fail(function(err){
			res.send(404, { error: err.message });
		});
});

api.put('/accolades/:id', auth.requireAdminUser, function(req, res, next){
	var accolade = req.body;
	accolade._id = req.params.id;
	accoladeService.updateFull(accolade)
		.then(function(updatedAccolade){
			res.send(updatedAccolade);
		})
		.fail(next);
});

api.patch('/accolades/:id', auth.requireAdminUser, function(req, res, next){
	var accolade = req.body;
	accolade._id = req.params.id;
	accoladeService.updateDelta(accolade)
		.then(function(updatedAccolade){
			res.send(updatedAccolade);
		})
		.fail(next);
});

mediator.subscribe('accolade:approved', function(accolade){
	server.io.sockets.emit('accolade:approved', accolade);
});

function getRequestUrl(req){
	return req.protocol + '://' + req.get('host') + req.originalUrl;
}