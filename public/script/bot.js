let app = {};

//set_backdrop
//set_sketch
//set_audiotrack
//add_actor
//remove_actor
//update_actor
//turn_actor_srv
//play_actor_emoji_srv
//play_audience_emoji
//set_actor_stage_presence
//set_initiative_display

document.addEventListener('DOMContentLoaded', function() {
	let socket,elements;

	app.init = init;
	
	app.init();

	function init(){
		elements = registerElements();
		initSocket();
	}

	function registerElements(){
		return {
			backdropFront: byCSS('.backdrop.front'),
			backdropBack: byCSS('.backdrop.back'),
			sketchContainer: byCSS('.sketch--container'),
			sketch: byCSS('.sketch'),
			characterLine: byCSS('.stage'),
			audioPlayer: byCSS('audio source'),
			initiativeScreenTop: byCSS('.initiative_cover.top'),
			initiativeScreenBottom: byCSS('.initiative_cover.bottom'),
			stage: byCSS('.stage')
		}
	}

	function initSocket(){
		socket = io.connect(window.location.href.replace(window.location.pathname,''));
		
		socket.on('socket connection', socketConnected);

		socket.on('set_backdrop', setBackdrop);
		socket.on('set_sketch', setSketch);
		socket.on('set_audiotrack', setAudioTrack);
		socket.on('add_actor', addActor);
		socket.on('remove_actor', removeActor);
		socket.on('update_actor', updateActor);
		socket.on('turn_actor_srv', turnActor);
		socket.on('play_actor_emoji_srv', setActorEmoji);
		socket.on('play_audience_emoji',  addPeanutEmoji);
		socket.on('set_actor_stage_presence', moveActor);
		socket.on('toggle_initiative_display', toggleInitiativeDisplay);
		socket.on('set_combat_actors', setCombatActors);
		socket.on('reset', resetActors);
	}

	/*Utilities*/
	function byCSS(cssSelector){
		return document.querySelector(cssSelector);
	}

	function byCSSAll(cssSelector){
		return document.querySelectorAll(cssSelector);
	}

	/*socket functions*/
	function changeTheBackdrop(newImage){
		elements.backdropFront.style.backgroundImage = elements.backdropBack.style.backgroundImage;
		elements.backdropBack.style.backgroundImage = 'url('+newImage+')';
		elements.backdropFront.classList.remove('hide');
		void elements.backdropFront.offsetWidth;
		elements.backdropFront.classList.add('hide');
	}

	function playEmoji(cssSelect, emoji){
		console.log('find this',cssSelect);
		var temp = byCSS(cssSelect);
		temp.classList.remove('play');
		void temp.offsetWidth;
		temp.innerText = emoji;
		temp.classList.add('play');
	}

	/** Sockets */
	function socketConnected(data){
		console.log('I am connected');
	}

	function setCombatActors(data){
		console.log(data.length);
		var was,is,will;

		if(data.length<=0){
			elements.stage.classList.remove('fight');
		}
		else{
			elements.stage.classList.add('fight');

			was = byCSS('.acted');
			if(was){was.classList.remove('acted');}
			
			is = byCSS('.acting');
			if(is){is.classList.remove('acting');}
			
			will = byCSS('.will_act');
			if(will){will.classList.remove('will_act');}

			byCSS('div[dndid="'+data[0].id+'"]').classList.add('acted');
			byCSS('div[dndid="'+data[1].id+'"]').classList.add('acting');
			byCSS('div[dndid="'+data[2].id+'"]').classList.add('will_act');
		}
	}

	function setBackdrop(data){
		changeTheBackdrop(data.url);
		console.log(data);
	}

	function setAudioTrack(data){
		//set the audio
		elements.audioPlayer.setAttribute('src',data.url);
	}

	function setSketch(data){
		console.log(data);
		elements.sketch.style.backgroundImage = 'url('+data.url+')';

		(data.url)?elements.sketchContainer.classList.remove('hide'):elements.sketchContainer.classList.add('hide');;
	}

	function removeSketch(data){
		console.log(data);
		elements.sketchContainer.classList.add('hide');
	}

	function turnActor(data){
		//set the audio
		if(data.id || data.id == 0){
			byCSS('div[dndid="'+data.id+'"]').classList.toggle('turn');
		}
		else if(data.class){
			byCSS('.'+data.class).classList.toggle('turn');
		}
	}

	function moveActor(data, callbkfn){
		console.log('this is me', data);
		if(data.id || data.id == 0){
			console.log('div[dndid="'+data.id+'"]');
			byCSS('div[dndid="'+data.id+'"]').classList.toggle('onstage');
		}
		else if(data.class){
			byCSS('.'+data.class).classList.toggle('onstage');
		}

		
	}

	function addActor(data){
		console.log(data);
		var newActor, em, mi, subClass;
		newActor = document.createElement('div');
		em = document.createElement('div');
		em.className = 'emoji';
		newActor.appendChild(em);
		mi = document.createElement('div');
		mi.className = 'mini';
		newActor.appendChild(mi);
		
		newActor.setAttribute('dndid',data.id);
		
		elements.characterLine.appendChild(newActor);

		newActor.className = data.classes;
		newActor.classList.add('actor');
		newActor.classList.remove('onstage');
		void newActor.offsetWidth;
		newActor.classList.add('onstage');
	}

	function removeActor(data){
		console.log(data);
		var actor;
		actor = elements.characterLine.querySelector('div[dndid="'+data.id+'"]');
		actor.parentNode.removeChild(actor);
	}

	function updateActor(data){
		console.log(data);
		//var actor;
		//actor = elements.characterLine.querySelector('div[dndid="'+data.id+'"]');
		//actor.className = data.classes;
		//actor.classList.add('actor');
		playEmoji('div[dndid="'+data.id+'"] .emoji',data.emoji);
	}

	function setActorEmoji(data) {
		console.log('set emoji',data);
		
		if(data.id || data.id == 0){
			console.log('div[dndid="'+data.id+'"] .emoji');
			playEmoji('div[dndid="'+data.id+'"] .emoji',data.emoji);
		}
		else if(data.class){
			console.log('.'+data.class+' .emoji');
			playEmoji('.'+data.class+' .emoji',data.emoji);
		}
	}

	function addPeanutEmoji(data) {
		console.log('show peanut emoji',data);						
		var temp = document.createElement('div');
		temp.className = 'peanut emoji';
		temp.innerText = data.emoji;
		temp.style.top = Math.round(Math.random()*50)+'vh';
		document.querySelector('body').appendChild(temp);
		console.log(temp,temp.innerText);

		setTimeout(function(){    
			document.querySelector('body').removeChild(temp);
		}, 2000);

	}

	function toggleInitiativeDisplay(data){
		console.log('updateInitiativeDisplay', data);
		elements.initiativeScreenTop.classList.toggle('hide');
		elements.initiativeScreenBottom.classList.toggle('hide');
	}

	function resetActors(){
		byCSSAll('.actor').forEach(function(actor){
			actor.parentNode.removeChild(actor);
		});
	}

});	