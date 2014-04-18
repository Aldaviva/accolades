var Accolade        = require('../data/model/Accolade');
var accoladeService = require('../service/accoladeService');
var logger          = require('../common/logger')(module);
var Moment          = require('moment');
var server          = require('./server');

server.apiRouter.get('/accolades', function(req, res, next){
	accoladeService.find()
		.then(function(accolades){
			res.send(accolades);
		})
		.fail(next);
});

server.apiRouter.post('/accolades', function(req, res, next){
	var accolade = new Accolade(req.body);
	accoladeService.create(accolade)
		.then(function(){
			res.set('Location', getRequestUrl(req)+'/'+accolade.id);
			res.send(201);
		})
		.fail(next);
});

server.apiRouter.get('/accolades/accolades.csv', function(req, res, next){
	var query = {
		minDate: req.query.min_date,
		maxDate: req.query.max_date
	};

	accoladeService.find(query)
		.then(accoladeService.toCSV)
		.then(function(csvText){
			res.type('csv');
			res.send(csvText);
		})
		.fail(next);
});

server.apiRouter.get('/accolades/:id', function(req, res){
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

server.apiRouter.put('/accolades/:id', function(req, res, next){
	var accolade = req.body;
	accolade._id = req.params.id;
	accoladeService.updateFull(accolade)
		.then(function(updatedAccolade){
			res.send(updatedAccolade);
		})
		.fail(next);
});

server.apiRouter.patch('/accolades/:id', function(req, res, next){
	var accolade = req.body;
	accolade._id = req.params.id;
	accoladeService.updateDelta(accolade)
		.then(function(updatedAccolade){
			res.send(updatedAccolade);
		})
		.fail(next);
});

function getRequestUrl(req){
	return req.protocol + '://' + req.get('host') + req.originalUrl;
}