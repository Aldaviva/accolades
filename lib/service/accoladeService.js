var _        = require('lodash');
var Accolade = require('../data/model/Accolade');
var logger   = require('../common/logger')(module);
var mediator = require('../common/mediator');
var Moment   = require('moment');

module.exports = {
	create      : create,
	find        : find,
	findById    : findById,
	updateFull  : _.partial(update, false),
	updateDelta : _.partial(update, true),
	toCSV       : toCSV
};

function create(accolade){
	delete accolade._id;
	_.extend(accolade, {
		//TODO inserting fixture data
		// status: 'pending',
		// dateCreated: new Moment()
	});

	var savePromise = accolade.savePromise();
	savePromise.then(function(){
		logger.info({ accolade: accolade }, "Created new Accolade.");
		mediator.publish("accolade:created", { accolade: accolade });
	});

	return savePromise;
}

function update(isPatch, accolade){
	var id = accolade._id;
	delete accolade._id;
	return Accolade.findByIdAndUpdatePromise(id, accolade, { overwrite: !isPatch });
}

function find(criteria){
	criteria = _.defaults(criteria || {}, {
		minDate: null,
		maxDate: null
	});

	var query = {};
	_.merge(query,
		criteria.minDate ? { dateCreated: { $gte: criteria.minDate.valueOf() }} : null,
		criteria.maxDate ? { dateCreated: { $lte: criteria.maxDate.valueOf() }} : null
	);

	return Accolade.findPromise(query, null, { sort: { dateCreated: -1 }});
}

function findById(id){
	return Accolade.findByIdPromise(id);
}

function toCSV(accolades){
	return "date,from,to,message,status\r\n"
		+ accolades.map(function(accolade){
			return [
				accolade.dateCreated.format('M/D/YYYY'),
				_escapeCsvString(accolade.fromName),
				_escapeCsvString(accolade.recipientName),
				_escapeCsvString(accolade.message),
				accolade.status
			].join(",");
		}).join('\r\n');
}

function _escapeCsvString(str){
	return '"'+str.replace(/"/g, '""')+'"';
}