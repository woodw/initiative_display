'use strict';

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const request = require('request');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));

app.set('port', (process.env.PORT || 9001));

/* ROUTES */
app.get('/',function(req,res){
	console.log('/ Here I have the IP');
	var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	console.log(ip);

	res.sendFile(__dirname+'/app/index.html');
});

app.get('/dm', function(req,res){
	res.send('DM Screen');
});

app.get('/slack/auth', function(req, res){
	let options,headers;
	
	if(req.query.code){
		headers = {
	        'Content-Type': 'application/x-www-form-urlencoded'
		};

		options = {
			url: 'https://slack.com/api/oauth.access',
			method: 'POST',
			headers: headers,
			form: {
				client_id: process.env.client_id,
				client_secret: process.env.client_secret,
				code: req.query.code
			}
		};

console.log('before the request');
console.log(options);
console.log(req.query);

		request(options, function (error, response, content) {
			console.log('I have got something back');
			console.log(error);
			console.log(response.statusCode);

	console.log('/ Here I have the IP');
	var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	console.log(ip);

			res.send(content);
			
		});
	}    
	else{
    	res.sendFile(__dirname+'/app/error.html');
	}
});
/** END ROUTES **/

app.listen(app.get('port'), function(){
	console.log('Node is listening on port', app.get('port'));
});