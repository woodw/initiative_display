'use strict';

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const request = require('request');

const server = require('http').Server(app);
const io = require('socket.io')(server);

const backdrops = require(__dirname+'/app/data/backdrops.json');
const sketches = require(__dirname+'/app/data/sketches.json');

/*const stitch = require("mongodb-stitch");
const clientPromise = stitch.StitchClientFactory.create(process.env.stitch_dbconn);*/

const onLiveData = {
	users: {}
};

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));

app.use(express.static('public'));

server.listen((process.env.PORT || 9001));

/* ROUTES */
app.get('/',function(req,res){
	res.sendFile(__dirname+'/app/index.html');
});

app.get('/stage',function(req,res){
	res.sendFile(__dirname+'/app/bot_screen.html');
});

app.get('/userdata',function(req,res){
	let clientIp;

	clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
				
	res.send(onLiveData.users[clientIp].info);
});

app.get('/pc',function(req,res){
	res.sendFile(__dirname+'/app/pc_screen.html');
});

app.get('/dm',function(req,res){
	res.sendFile(__dirname+'/app/dm_screen.html');
});

app.get('/slack/auth', function(req, res){
	let options,headers,clientIp;
	
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

		request(options, function (error, response, content) {
			let jsonObj;
			
			jsonObj = JSON.parse(content);
			
			console.log(jsonObj);
			console.log(error, jsonObj.ok);
			
			if(error || !jsonObj.ok){
				res.sendFile(__dirname+'/app/error.html');
			}
			else{
				clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
				storeUser(clientIp, jsonObj);

				if(process.env.dm_id == onLiveData.users[clientIp].auth.id){
					res.redirect('/pcscreen');
				}
				else{
					res.redirect('/dmscreen');
				}

			}
		});
	}    
	else{
    	res.sendFile(__dirname+'/app/error.html');
	}
});
/** END ROUTES **/

/* Socket IO */
io.on('connection', function (socket) {
	socket.emit('socket connection', { valid: true });

	socket.on('get backdrops', function(){
		io.emit('send backdrops', backdrops.campaign.valdrin);
	});
	
	socket.on('update backdrop', function (data) {
		console.log(data);
		io.emit('set backdrop', data);
	});

	socket.on('get sketches', function(){
		io.emit('send sketches', sketches.campaign.valdrin);
	});

	socket.on('update sketch', function (data) {
		console.log(data);
		io.emit('set sketch', data);
	});
	socket.on('update players', function (data) {
		console.log(data);
		io.emit('set players', data);
	});
	socket.on('update npcs', function (data) {
		console.log(data);
		io.emit('set npcs', data);
	});
});

/** Private Funtions **/
function storeUser(clientIp, userObject){
	onLiveData.users[clientIp] = {
		auth:{
			id: userObject.user.id,
			access_token: userObject.access_token,
		},
		info:{
			name: userObject.user.name,
			icon: userObject.user.image_192,
			character:{
				class:'wizard',
				orcpub: 'https://www.google.com'
			}	
		}
	}
}