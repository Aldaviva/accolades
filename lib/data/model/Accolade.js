var db = require('../db');

var Statuses = [
	'pending',
	'approved',
	'rejected'
];

var accoladeSchema = new db.Schema({
	dateCreated   : { type: 'Moment', index: true },
	fromName      : { type: 'String' },
	message       : { type: 'String', validate: [
		function(val){
			return val.length <= 70;
		},
		"Message must be 70 characters or less."
	] },
	status        : { type: 'String', enum: Statuses },
	recipientId   : { type: 'String' },
	recipientName : { type: 'String' }
});

//none of the fields are arrays and I don't care about ABA problems
accoladeSchema.set('versionKey', false);

module.exports = db.model('Accolade', accoladeSchema);