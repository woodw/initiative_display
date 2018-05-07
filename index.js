'use strict';

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const request = require('request');

const server = require('http').Server(app);
const io = require('socket.io')(server);

const backdrops = require(__dirname+'/app/data/backdrops.json');
const sketches = require(__dirname+'/app/data/sketches.json');
const audioTracks = require(__dirname+'/app/data/audiotracks.json');
const players = require(__dirname+'/app/data/players.json');

/*const stitch = require("mongodb-stitch");
const clientPromise = stitch.StitchClientFactory.create(process.env.stitch_dbconn);*/

const onLiveData = {
	group: 'valdrin',
	users: {},
	directAuth: [
		'qzWXecRV',
		'wxECrvTB',
		'ecRVtbYN',
		'rvTBynUM',
		'tbYNumIm',
		'ynUMimPM',
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
				fakeUser.user.name = 'atticusjack';
				storeUser(clientIp,fakeUser);
				res.sendFile(__dirname+'/app/pc_screen.html');
				break;
			case onLiveData.directAuth[1]:
				fakeUser.user.name = 'Bree';
				storeUser(clientIp,fakeUser);
				res.sendFile(__dirname+'/app/pc_screen.html');
				break;
			case onLiveData.directAuth[2]:
				fakeUser.user.name = 'Nell';
				storeUser(clientIp,fakeUser);
				res.sendFile(__dirname+'/app/pc_screen.html');
				break;
			case onLiveData.directAuth[3]:
				fakeUser.user.name = 'Thal The Thalificient';
				storeUser(clientIp,fakeUser);
				res.sendFile(__dirname+'/app/pc_screen.html');
				break;
			case onLiveData.directAuth[4]:
				fakeUser.user.name = 'Toph\'ee';
				storeUser(clientIp,fakeUser);
				res.sendFile(__dirname+'/app/pc_screen.html');
				break;
			case onLiveData.directAuth[5]:
				fakeUser.user.name = 'Umbar';
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

	socket.on('get_backdrops_dm', function (fn) {
		fn(backdrops.campaign[onLiveData.group]);
	});
	socket.on('get_sketches_dm', function (fn) {
		fn(sketches.campaign[onLiveData.group]);
	});
	socket.on('get_audiotracks_dm', function (fn) {
		fn(audioTracks.campaign[onLiveData.group]);
	});

	standardSocketRelay('set_backdrop_dm','set_backdrop');

	socket.on('set_sketch_dm', function (data) {
		console.log('set_sketch_dm',data);
		socket.broadcast.emit('set_sketch_'+data.target, data);
	});

	standardSocketRelay('set_sketch_pc','set_sketch');
	standardSocketRelay('set_audiotrack_dm','set_audiotrack');

	socket.on('add_actor_dm', (data, callbkfn) => {
		console.log('add_actor_dm', data);
		data.id = onLiveData.actorID++;
		socket.broadcast.emit('add_actor', data);
		callbkfn({id:data.id});
	});

	standardSocketRelay('remove_actor_dm','remove_actor');
	standardSocketRelay('update_actor_dm','update_actor');
	standardSocketRelay('turn_actor','turn_actor_srv');
	standardSocketRelay('play_actor_emoji','play_actor_emoji_srv');
	standardSocketRelay('play_audience_emoji_pg','play_audience_emoji');
	standardSocketRelay('set_actor_stage_presence_pc','set_actor_stage_presence');
	standardSocketRelay('set_actor_stage_presence_dm','set_actor_stage_presence');
	standardSocketRelay('set_private_actor_sketch_dm','set_private_actor_sketch');
	standardSocketRelay('set_actor_sketch_pc','set_actor_sketch');
	standardSocketRelay('actor_stage_presence_request_pc','actor_stage_presence_request');
	standardSocketRelay('toggle_initiative_display_dm','toggle_initiative_display');	
	standardSocketRelay('set_combat_actors_dm','set_combat_actors');		
	
	socket.on('reset_dm', function (data) {
		console.log('reset_dm', data);
		onLiveData.actorID = 0;
		socket.broadcast.emit('reset', data);
	});

	function standardSocketRelay(eventString,broadcastString){
		socket.on(eventString, function (data) {
			console.log(eventString, data);
			socket.broadcast.emit(broadcastString, data);
		});
	}
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
	if(players[onLiveData.group][playerName]){
		return players[onLiveData.group][playerName];
	}
	else{
		return players[onLiveData.group]['Bree'];
	}
}
