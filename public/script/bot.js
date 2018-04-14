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
			backDropFront: byCSS('.backdrop.front'),
			backDropBack: byCSS('.backdrop.back'),
			sketchContainer: byCSS('.sketch--container'),
			sketch: byCSS('.sketch'),
			characterLine: byCSS('.stage'),
			audioPlayer: byCSS('audio source'),
			initiativeOrder: byCSS('#initiative--order'),
			initiativeOrderFirstName: byCSS('#initiative--order h3:first-child'),
			initiativeOrderMiddleName: byCSS('#initiative--order h3:nth-child(2)'),
			initiativeOrderLastName: byCSS('#initiative--order h3:last-child')
			
		}
	}

	function byCSS(cssSelector){
		return document.querySelector(cssSelector);
	}

	function byCSSAll(cssSelector){
		return document.querySelectorAll(cssSelector);
	}

	function changeTheBackDrop(newImage){
		elements.backDropFront.style.backgroundImage = elements.backDropBack.style.backgroundImage;
		elements.backDropBack.style.backgroundImage = 'url('+newImage+')';
		elements.backDropFront.classList.remove('hide');
		void elements.backDropFront.offsetWidth;
		elements.backDropFront.classList.add('hide');
	}

	function playEmoji(cssSelect, emoji){
		console.log('find this',cssSelect);
		var temp = byCSS(cssSelect);
		temp.classList.remove('play');
		void temp.offsetWidth;
		temp.innerText = emoji;
		temp.classList.add('play');
	}

	function initSocket(){
		socket = io.connect(window.location.href.replace(window.location.pathname,''));
		
		
		socket.on('socket connection', socketConnected);

		socket.on('set_backdrop_dm', setBackdrop);
		
		socket.on('set_sketch_dm', setSketch);
		socket.on('remove_sketch_dm', removeSketch);
		
		socket.on('set_audio_dm', setAudio);

		socket.on('set_actor_emoji', setActorEmoji);

		socket.on('add_emoji_peanut',  addPeanutEmoji);

		socket.on('add_actor_dm', addActor);

		socket.on('update_actor_dm', updateActor);
		
		socket.on('remove_actor_dm', removeActor);

		socket.on('turn_actor', turnActor);
		socket.on('move_actor_dm', moveActor);

		socket.on('reset_actors_dm', resetActors);
	}

	/** Sockets */
	function socketConnected(data){
		console.log('I am connected');
	}

	function setBackdrop(data){
		changeTheBackDrop(data.url);
		console.log(data);
	}

	function setAudio(data){
		//set the audio
		elements.audioPlayer.setAttribute('src',data.url);
	}

	function setSketch(data){
		console.log(data);
		elements.sketch.style.backgroundImage = 'url('+data.url+')';
		elements.sketchContainer.classList.remove('hide');
	}

	function removeSketch(data){
		console.log(data);
		elements.sketchContainer.classList.add('hide');
	}

	function turnActor(data){
		//set the audio
		byCSS(data.actor).classList.toggle('turn');
	}

	function moveActor(data){
		//turn the actor
		byCSS(data.actor).classList.toggle('onstage');
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
		//newActor.innerHTML = '<div class="emoji"></div><div class="mini"></div>';
		if(data.classes.indexOf('npc')!== -1){
			elements.characterLine.prepend(newActor);						
		}
		else{
			elements.characterLine.appendChild(newActor);						
		}
		
		/*perform a walk on*/
		if(data.classes.indexOf('onstage')!=-1){
			subClass = data.classes.replace(' onstage','');
			newActor.className = subClass;	
			void newActor.offsetWidth;
			newActor.className = data.classes;
		}
		else{
			newActor.className = data.classes;
		}
	}

	function removeActor(data){
		console.log(data);
		var actor = elements.characterLine.querySelector('div[dndid="'+data.id+'"]');
		actor.parentNode.removeChild(actor);
	}

	function updateActor(data){
		console.log(data);
		var actor = elements.characterLine.querySelector('div[dndid="'+data.id+'"]');
		actor.className = data.classes;
		playEmoji('div[dndid="'+data.id+'"] .emoji',data.emoji);
	}

	function setActorEmoji(data) {
		console.log('set emoji',data);
		playEmoji('div[dndid="'+data.id+'"] .emoji',data.emoji);
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

	function resetActors(){
		byCSSAll('.actor').forEach(function(actor){
			actor.parentNode.removeChild(actor);
		});
	}

	/*
		socket.on('toggle initiative display', function (data) {
			console.log('showing combat deck', data);
			
			elements.initiativeOrder.classList.toggle('hide');
		});

		socket.on('set deck', function(data){
			console.log(data);
			elements.initiativeOrderFirstName.classList.toggle('hide');
			elements.initiativeOrderMiddleName.classList.toggle('hide');
			elements.initiativeOrderLastName.classList.toggle('hide');
			setTimeout(function(){
				elements.initiativeOrderFirstName.innerText = data[0].split(' ')[1];
				elements.initiativeOrderMiddleName.innerText = data[1].split(' ')[1];
				elements.initiativeOrderLastName.innerText = data[2].split(' ')[1];

				elements.initiativeOrderFirstName.classList.toggle('hide');
				elements.initiativeOrderMiddleName.classList.toggle('hide');
				elements.initiativeOrderLastName.classList.toggle('hide');
			},1000);
		});
	*/
});	