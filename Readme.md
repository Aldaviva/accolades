bravo
=====

After the 2014-03-21 biweekly company meeting, Andrew expressed frustration that while 11 employees were recognized for outstanding effort, only 1 of them was an engineer (9%). Engineers make up 24% of the Blue Jeans Mountain View population. He felt this was unfair, given how much effort engineers routinely contribute to hotfixing deployments and pulling other people's asses out of fires.

Andrew and Anand theorized that one of the causes of this discrepency is the difficulty involved in formally nominating people for recognition. This involves a convoluted, unintuitive journey through our corporate HR web portal. Just logging into the site is a challenge in itself. I honestly could not figure it out myself without Xia's help.

I decided to make it easier. This application exposes an HTTP API that will allow clients to submit a formal recognition without dealing with our HR portal at all. No digging up your password or company ID _(hint: it's B5322, duh)_, and no more stumbling through the labyrinthine user interface _(hint: to leave an Impression, you don't click the big Impression button in the navigation bar, you click Directory)_.

Now that we have a platform, all manner of user-facing applications can connect to it. Dashboard in a public area? Easy. [Floorplan](https://github.com/Aldaviva/floorplan) integration? Sure.

I made this as simple as possible so that folks can get recognition even if they're not customer success managers, sales account managers, or marketing associates. Because let's be honest, I love salespeople, but their entire career hinges on being able to effectively promote things. Engineers usually don't have the same mentality.

## Installation

	$ npm install

## Configuration

	$ cp config.defaults.json config.json

```javascript
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
		"ttl": 86400000 //how long the application will remember the list of employees before requerying Paylocity (milliseconds)
	}
}
```
You should aggressively `chmod` this file to prevent other users from seeing your Paylocity password.

## Running

	$ node .

To see formatted logs, use [Bunyan](https://github.com/trentm/node-bunyan):

	$ sudo npm install -g bunyan
	$ node . | bunyan

## API

### `GET /employees`

Returns a list of employees from Paylocity.

**response type:** JSON Array

**example response:**
```javascript
[{
	"id": 137,
	"fullname": "Benjamin Hutchison",
	"email": "ben@bluejeansnet.com"
}, /*...*/]
```

### `POST /employees/:idOrName/impression`

Creates an impression for a certain employee, with a given message.

The impression will technically be created by whichever user you set up Bravo to log into Paylocity as (`config.paylocity.username`), but your name (`author`) will be prepended to the message text.

A random badge will be automatically selected for the impression.

**request type:** JSON object in the body

**response type:** none, response with code `204`

**idOrName (path parameter):** the Paylocity employee ID (ex: `137`) or full name (ex: `Benjamin Hutchison`). Names will fuzzy match to allow for nicknames and maiden names.

**request body:** a JSON object with the `author` and `message` fields

**example request:**
```http
POST /employees/Andrew%20Brindamour/impression HTTP/1.1
Content-Type: application/json

{
	"author": "Ben",
	"message": "Andrew inspired me to make recognitions easier!"
}
