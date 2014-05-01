var _        = require('lodash');
var Accolade = require('../data/model/Accolade');
var logger   = require('../common/logger')(module);
var mediator = require('../common/mediator');
var Moment   = require('moment');

module.exports = {
	create      : create,
	find        : find,
	findById    : findById,
	findByDate  : findByDate,
	updateFull  : _.partial(update, false),
	updateDelta : _.partial(update, true),
	toCSV       : toCSV
};

function create(accolade){
	delete accolade._id;
	_.extend(accolade, {
		status: 'pending',
		dateCreated: new Moment()
	});

	var savePromise = accolade.savePromise();

	savePromise.then(function(){
		logger.info({ accolade: accolade }, "Created new accolade.");
		mediator.publish("accolade:created", accolade);
	});

	return savePromise;
}

function update(isPatch, accolade){
	var id = accolade._id;
	delete accolade._id;

	var updatePromise = Accolade.findByIdAndUpdatePromise(id, accolade, { overwrite: !isPatch });

	if(accolade.status == 'approved'){
		updatePromise
			.then(function(){
				return findById(id);
			})
			.then(function(fullAccolade){
				logger.info({ accolade: fullAccolade }, "Approved accolade.");
				mediator.publish("accolade:approved", fullAccolade);
			});
	}

	return updatePromise;
}

function find(query){
	return Accolade.findPromise(query, null, { sort: { dateCreated: -1 }});
}

function findByDate(dateCriteria){
	dateCriteria = _.defaults(dateCriteria || {}, {
		minDate: null,
		maxDate: null
	});

	var query = {};
	_.merge(query,
		dateCriteria.minDate ? { dateCreated: { $gte: dateCriteria.minDate.valueOf() }} : null,
		dateCriteria.maxDate ? { dateCreated: { $lte: dateCriteria.maxDate.valueOf() }} : null
	);

	return find(query);
}

function findById(id){
	return Accolade.findByIdPromise(id);
}

function toCSV(accolades){
	return "status,date submitted,from,to,message\r\n"
		+ accolades.map(function(accolade){
			return [
				accolade.status,
				accolade.dateCreated.format('M/D/YYYY'),
				_escapeCsvString(accolade.fromName),
				_escapeCsvString(accolade.recipientName),
				_escapeCsvString(accolade.message)
			].join(",");
		}).join('\r\n');
}

function _escapeCsvString(str){
	return '"'+str.replace(/"/g, '""')+'"';
}