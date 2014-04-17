var db = require('../db');

var Statuses = [
	'pending',
	'accepted',
	'rejected'
];

var accoladeSchema = new db.Schema({
	dateCreated   : { type: 'Moment', index: true },
	fromName      : { type: 'String' },
	message       : { type: 'String' },
	status        : { type: 'String', enum: Statuses },
	recipientId   : { type: 'String' },
	recipientName : { type: 'String' }
});

//none of the fields are arrays and I don't care about ABA problems
accoladeSchema.set('versionKey', false);

module.exports = db.model('Accolade', accoladeSchema);