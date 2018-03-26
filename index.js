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
	users: {},
	directAuth: [
		'yTgHnB',
		'tRfGbV',
		'rEdFvC'
	],
	actorID: 0
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
	res.setHeader('Content-Type', 'application/json');			
	res.send(onLiveData.users[clientIp].info);
});

app.get('/pc',function(req,res){
	let clientIp, fakeUser;

	clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
console.log(clientIp, req.query.auth);
	if(req.query.auth){
		fakeUser = {
			user:{
				id:'',
				name:'',
				image_192:''	
			},
			access_token:'',
		};
		switch(req.query.auth){
			case onLiveData.directAuth[0]:
			console.log('muara');
				fakeUser.user.name = 'Maura';
				storeUser(clientIp,fakeUser);
				res.sendFile(__dirname+'/app/pc_screen.html');
				break;
			case onLiveData.directAuth[1]:
				fakeUser.user.name = 'Joey';
				storeUser(clientIp,fakeUser);
				res.sendFile(__dirname+'/app/pc_screen.html');
				break;
			case onLiveData.directAuth[2]:
				fakeUser.user.name = 'Sprogg (Noel)';
				storeUser(clientIp,fakeUser);
				res.sendFile(__dirname+'/app/pc_screen.html');
				break;
			default:
				res.sendFile(__dirname+'/app/peanut_screen.html');
				break;
		}
	}
	else{
		res.sendFile(__dirname+'/app/peanut_screen.html');
	}
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
		console.log('updating backdrops', data);
		io.emit('set backdrop', data);
	});

	socket.on('get sketches', function(){
		io.emit('send sketches', sketches.campaign.valdrin);
	});

	socket.on('update sketch', function (data) {
		console.log('updating sketches',data);
		io.emit('set sketch', data);
	});
	socket.on('hide sketch', function (data) {
		console.log('hide sketches',data);
		io.emit('hide sketch', data);
	});

	socket.on('update emoji', function (data) {
		console.log('setting player emoji',data);
		io.emit('set emoji', data);
	});

	socket.on('display peanut emoji', function (data) {
		console.log('setting peanut emoji',data);
		io.emit('show peanut emoji', data);
	});

	socket.on('add actor', (data, callbkfn) => {
		console.log('adding actor', data);
		data.id = onLiveData.actorID++;
		io.emit('create actor', data);
		callbkfn({id:data.id});
	});
	socket.on('update actor', function (data) {
		console.log('updating actor', data);
		io.emit('set actor', data);
	});
	socket.on('remove actor', function (data) {
		console.log('removing actor', data);
		io.emit('delete actor', data);
	});
});

/** Private Funtions **/

function storeUser(clientIp, userObject){
	console.log(clientIp, userObject);
	onLiveData.users[clientIp] = {
		auth:{
			id: userObject.user.id,
			access_token: userObject.access_token,
		},
		info:{
			name: userObject.user.name,
			icon: userObject.user.image_192,
			character:getPlayerCharacter(userObject.user.name)	
		}
	}
}

function getPlayerCharacter(playerName){
	console.log(playerName);
	switch(playerName){
		case 'Sprogg (Noel)':
			return {
				
					name: 'Garrik Se\'Yamo ',
					portrait: 'http://icons.iconarchive.com/icons/paomedia/small-n-flat/1024/sign-check-icon.png',
					mini: './images/sprites/garrikphase1.png',
					css: 'garrik',
					class:'Cleric: Knowledge Domain',
					orcpub: 'https://orcpub2.com/pages/dnd/5e/characters/17592249352779',
					spells:'http://www.5esrd.com/spellcasting/spell-lists/#clericlist'
				
			}; 	
		case 'Maura':
			return {
					name: 'Velora Vessar',
					portrait: 'http://icons.iconarchive.com/icons/paomedia/small-n-flat/1024/sign-check-icon.png',
					mini: './images/sprites/veloraphase1.png',
					css: 'velora',
					class:'Ranger: Beastmaster',
					orcpub: 'https://orcpub2.com/pages/dnd/5e/characters/17592249352779',
					spells:'http://www.5esrd.com/spellcasting/spell-lists/#rangerlist'
				
			}; 	
		case 'Joey':
		default:
			return {
					name: 'Thomas Black',
					portrait: 'http://icons.iconarchive.com/icons/paomedia/small-n-flat/1024/sign-check-icon.png',
					mini: './images/sprites/thomasphase1.png',
					css: 'thomas',
					class:'Bard: College of Swords',
					orcpub: 'https://www.orcpub2.com/pages/dnd/5e/characters/17592250241064',
					spells:'http://www.5esrd.com/spellcasting/spell-lists/#bardlist'
				
			}; 		
	}
}