var _              = require('lodash');
var _s             = require('underscore.string');
var authenticator  = require('../remote/authenticator');
var cache          = require('../common/cache');
var employeeFinder = require('../remote/employeeFinder');
var logger         = require('../common/logger')(module);
var Q              = require('q');
var recognizer     = require('../remote/recognizer');
var request        = require('../common/request');

var SAME_NAME_MAX_LEVENSHTEIN_DISTANCE = 10;

/**
 * Makes a remote request. To use a cached value when available, use #getEmployees() instead.
 */
function fetchEmployees(){
	var cookieJar = request.jar();

	var employeePromise = authenticator.logIn({ jar: cookieJar })
		.then(function(){
			return employeeFinder.findEmployees({ jar: cookieJar });
		})
		.then(function(employees){
			return _.map(employees, function(employee){
				return {
					id       : Number(employee.EmployeeID),
					fullname : employee.FirstName+' '+employee.LastName,
					email    : employee.Email
				};
			});
		});

	employeePromise.finally(function(){
		return authenticator.logOut({ jar: cookieJar });
	});

	return employeePromise;
};

function getEmployees(){
	return cache.wrapPromise("employeeService.fetchEmployees", fetchEmployees);
}

function findEmployee(idOrName){
	logger.trace({ idOrName: idOrName }, "findEmployee");
	var employeesPromise = getEmployees();
	var employeePromise;
	if(_.isNumber(idOrName)){
		employeePromise = employeesPromise.then(function(employees){
			return _.find(employees, { id: idOrName });
		});
	} else {
		employeePromise = employeesPromise.then(function(employees){
			var minLevDist = Infinity;
			var closestEmployee = _.min(employees, function(employee){
				var levDist = _s.levenshtein(employee.fullname, idOrName);
				minLevDist = Math.min(minLevDist, levDist);
				return levDist;
			});
			if(minLevDist <= SAME_NAME_MAX_LEVENSHTEIN_DISTANCE){
				return closestEmployee;
			} else {
				return null;
			}
		});
	}

	return employeePromise.then(function(employee){
		if(employee){
			return employee;
		} else {
			throw new Error("No employee found with name or id = "+idOrName);
		}
	});
}

function createImpression(recipientEmployee, authorName, message){
	assert.object(recipientEmployee, 'recipientEmployee');
	assert.string(authorName, 'authorName');
	assert.string(message, 'message');

	var cookieJar = request.jar();

	var employeePromise = authenticator.logIn({ jar: cookieJar })
		.then(function(){
			var body = "From: "+authorName+" - "+message;
			return recognizer.recognize(recipientEmployee.id, body, { jar : cookieJar });
		});
}

module.exports.getEmployees = getEmployees;
module.exports.findEmployee = findEmployee;
module.exports.createImpression = createImpression;
