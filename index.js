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
	res.sendFile(__dirname+'/app/index.html');
});

app.get('/dm', function(req,res){
	res.send('DM Screen');
});

app.get('/slack/auth', function(req, res){
	let options;
	
	if(req.query.code){

		options = {
			url: 'https://slack.com/api/oauth.access',
			method: 'GET',
			form: {
				client_id: process.env.client_id,
				client_secret: process.env.client_secret,
				code: req.query.code
			}
		};

		request(options, function (error, response, content) {
			if (!error && response.statusCode == 200) {

			// Print out the response body
			console.log('We got something back');
			console.log(content);
			
			res.sendFile(__dirname+'/app/index.html');
			}
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