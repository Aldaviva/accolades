bravo
=====

# Installation

	$ npm install

# Configuration

	$ cp config.defaults.json config.json

```json
{
	"paylocity": {
		"company": "B5322", //the company ID you use to log in to Paylocity
		"username": "", //the username that will be logged into Paylocity and create the impressions
		"password": "", //password to log in
		"baseUrl": "https://login.paylocity.com/Escher/Escher_WebUI/" //Paylocity Escher_WebUI root URL
	},
	"httpServer": {
		"port": 8080 //port on which this application will listen for API requests
	},
	"cache": {
		"ttl": 86400000 //how long the application will remember the list of employees before requerying Paylocity
	}
}
```

# Running

	$ node .

To see formatted logs, use [Bunyan](https://github.com/trentm/node-bunyan):

	$ sudo npm install -g bunyan
	$ node . | bunyan

# API

## `GET /employees`

**response type** JSON Array

Returns a list of employees from Paylocity.

**example response**
```json
[{
	"id": 137,
	"fullname": "Benjamin Hutchison",
	"email": "ben@bluejeansnet.com"
},/*...*/]
```

## `POST /employees/:idOrName/impression`

**request type** JSON object in the body
**response type** none, response with code `204`

**idOrName** the Paylocity employee ID (ex: `137`) or full name (ex: `Benjamin Hutchison`). Names will fuzzy match to allow for nicknames and such.
**body** a JSON object with the following required fields:
```json
{
	"author": "Your Name", //your name, which will appear in the impression
	"message": "They did a great job." //text of the impression you want to create
}