var Accolade        = require('../data/model/Accolade');
var accoladeService = require('../service/accoladeService');
var logger          = require('../common/logger')(module);
var Moment          = require('moment');
var server          = require('./server');

server.get('/accolades', function(req, res){
	accoladeService.find()
		.then(function(accolades){
			res.send(200, accolades);
		})
		.done();
});

server.post('/accolades', function(req, res){
	var accolade = new Accolade(req.body);
	accoladeService.create(accolade)
		.then(function(){
			res.set('Location', getRequestUrl(req)+'/'+accolade.id);
			res.send(201);
		})
		.done();
});

server.get('/accolades/accolades.csv', function(req, res, next){
	var query = {
		minDate: req.query.min_date,
		maxDate: req.query.max_date
	};

	accoladeService.find(query)
		.then(function(accolades){
			res.type('csv');
			var body = "date,from,to,message,status\r\n"
				+ accolades.map(function(accolade){
					return [
						accolade.dateCreated.format('M/D/YYYY'),
						_escapeCsvString(accolade.fromName),
						_escapeCsvString(accolade.recipientName),
						_escapeCsvString(accolade.message),
						accolade.status
					].join(",")+"\r\n";
				});
			res.send(200, body);
		})
		.fail(function(err){
			res.send(500, { error: err.stack || err.message || err });
			next(err);
		})
		.done();
});

server.get('/accolades/:id', function(req, res){
	accoladeService.findById(req.params.id)
		.then(function(accolade){
			res.send(200, accolade);
		})
		.fail(function(err){
			res.send(404);
		});
});

server.put('/accolades/:id', function(req, res, next){
	var accolade = req.body;
	accolade._id = req.params.id;
	accoladeService.updateFull(accolade)
		.then(function(updatedAccolade){
			res.send(200, updatedAccolade);
		})
		.done();
});

server.patch('/accolades/:id', function(req, res){
	var accolade = req.body;
	accolade._id = req.params.id;
	accoladeService.updateDelta(accolade)
		.then(function(updatedAccolade){
			res.send(200, updatedAccolade);
		})
		.done();
});

function _escapeCsvString(str){
	return '"'+str.replace(/"/g, '""')+'"';
}

function getRequestUrl(req){
	return req.protocol + '://' + req.get('host') + req.originalUrl;
}