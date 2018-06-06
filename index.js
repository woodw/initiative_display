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
const adventures = require(__dirname+'/app/data/adventures.json');

/*const stitch = require("mongodb-stitch");
const clientPromise = stitch.StitchClientFactory.create(process.env.stitch_dbconn);*/

const onLiveData = {
	users: {},
	actorID: 0
};

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));

app.use(express.static('public'));

server.listen((process.env.PORT || 9001));

/* ROUTES */
app.get('/*/stage',function(req,res){
	res.sendFile(__dirname+'/app/bot_screen.html');
});

app.get('/*/peanut',function(req,res){
	res.sendFile(__dirname+'/app/peanut_screen.html');
});

app.get('/shh/*/dm',function(req,res){
	res.sendFile(__dirname+'/app/dm_screen.html');
});

app.get('/userdata',function(req,res){
	let clientIp,response;

	clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	res.setHeader('Content-Type', 'application/json');	
	
	if(onLiveData.users[clientIp]){
		response = onLiveData.users[clientIp].info;
	}
	else{
		response = false;
	}

	res.send(response);
});

app.get('/slack/auth', function(req, res){
	let options,headers,clientIp,workSpaceApp;
	
	workSpaceApp = JSON.parse(process.env[req.query.game]);

	if(req.query.code){
		headers = {
	        'Content-Type': 'application/x-www-form-urlencoded'
		};

		options = {
			url: 'https://slack.com/api/oauth.access',
			method: 'POST',
			headers: headers,
			form: {
				client_id: workSpaceApp.clientId,
				client_secret: workSpaceApp.clientSecret,
				code: req.query.code
			}
		};

		request(options, function (error, response, content) {
			let jsonObj;
			
			jsonObj = JSON.parse(content);
			
			if(error || !jsonObj.ok){
				res.sendFile(__dirname+'/app/error.html');
			}
			else{
				clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

				if(adventures[req.query.game].dungeonMaster.id == jsonObj.user.id){
					res.sendFile(__dirname+'/app/dm_screen.html');
				}
				else{
					storeUser(clientIp, jsonObj);
					res.sendFile(__dirname+'/app/pc_screen.html');
				}

			}
		});
	}    
	else{
    	res.sendFile(__dirname+'/app/error.html');
	}
});

app.get('/*',function(req,res){
	res.sendFile(__dirname+'/app/index.html');
});
/** END ROUTES **/

/* Socket IO */
io.on('connection', function (socket) {
	socket.emit('socket connection', { valid: true });

	socket.on('get_backdrops_dm', function (data, fn) {
		console.log(data.gameName);
		console.log(backdrops.campaign[data.gameName]);

		fn(backdrops.campaign[data.gameName].session[data.sessionNumber-1]);
	});
	socket.on('get_sketches_dm', function (data, fn) {
		fn(sketches.campaign[data.gameName].session[data.sessionNumber-1]);
	});
	socket.on('get_audiotracks_dm', function (data, fn) {
		fn(audioTracks.campaign[data.gameName].session[data.sessionNumber-1]);
	});

	socket.on('get_adventure_indx', (data, callbkfn) => {
		var adventure;
		
		adventure = adventures[data.game];
		callbkfn({meta:(adventure)?adventure.meta:false});
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
	onLiveData.users[clientIp] = {
		auth:{
			id: userObject.user.id,
			access_token: userObject.access_token
		},
		info:{
			name: userObject.user.name,
			icon: userObject.user.image_192,
			character:getPlayerCharacter(userObject.team.name,userObject.user.id)
		}
	}
}

function getPlayerCharacter(workSpaceName, userId){
	if(adventures[workSpaceName]){
		return adventures[workSpaceName].players.find(function(player){
			return player.id === userId;
		});
	}
	else{
		return {};
	}
}
