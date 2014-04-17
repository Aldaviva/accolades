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
	updateDelta : _.partial(update, true)
};

function create(accolade){
	_.extend(accolade, {
		pipelineState: 'pending',
		dateCreated: new Moment()
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

	return Accolade.findPromise(query);
}

function findById(id){
	return Accolade.findByIdPromise(id);
}