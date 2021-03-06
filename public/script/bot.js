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

var music,ambience, musicVolume=100, ambienceVolume=100;
function onYouTubeIframeAPIReady() {
  music = new YT.Player('music', {
    height: '100',
    width: '100',
    vq: 'small',
    videoId: '1APFIJN-ubU',
    suggestedQuality: 'small',
    playerVars: { 'autoplay': 1, 'controls': 0},
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
  });
  
  ambience = new YT.Player('ambience', {
    height: '100',
    width: '100',
    vq: 'small',
    videoId: 'qrqzMy2gF8g',
    suggestedQuality: 'small',
    playerVars: { 'autoplay': 1, 'controls': 0},
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
  });
  
  
}

// 4. The API will call this function when the video player is ready.
function onPlayerReady(event) {
  event.target.setPlaybackQuality('small');
  event.target.setVolume((event.target.a.id === 'music')?musicVolume:ambienceVolume);
  event.target.playVideo();
}

function onPlayerStateChange(event) {
  if (event.data == YT.PlayerState.ENDED) {
    event.target.playVideo();
  }
}

document.addEventListener('DOMContentLoaded', function() {
	let socket,elements;

	app.init = init;
	
	app.init();

	function init(){
	
		elements = registerElements();
		initSocket();
  
		/*Pushing Script*/
		var tag = document.createElement('script');
		tag.src = "https://www.youtube.com/iframe_api";
		var firstScriptTag = document.getElementsByTagName('script')[0];
		firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

	}

	function registerElements(){
		return {
			backdropFront: byCSS('.backdrop.front'),
			backdropBack: byCSS('.backdrop.back'),
			sketchContainer: byCSS('.sketch--container'),
			sketch: byCSS('.sketch'),
			characterLine: byCSS('.stage'),
			youtubePlayer: byCSS('#youtube_audio'),
			initiativeScreenTop: byCSS('.initiative_cover.top'),
			initiativeScreenBottom: byCSS('.initiative_cover.bottom'),
			stage: byCSS('.stage')
		}
	}

	function initSocket(){
		socket = io.connect(window.location.href.replace(window.location.pathname,''));
		
		socket.on('socket connection', socketConnected);

		socket.on('set_scene',setScene);
		socket.on('set_music',setMusic);
		socket.on('set_music_volume',setMusicVolume);
		socket.on('set_ambience_volume',setAmbienceVolume);
		socket.on('set_sketch_stage', setSketch);
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

			was = byCSSAll('.acted');
			if(was){
				was.forEach(function(item){
					item.classList.remove('acted');
				});
			}

			is = byCSSAll('.acting');
			if(is){
				is.forEach(function(item){
					item.classList.remove('acting');
				});
			}

			will = byCSSAll('.will_act');
			if(will){
				will.forEach(function(item){
					item.classList.remove('will_act');
				});
			}

			byCSS('div[dndid="'+data[0].id+'"]').classList.add('acted','turn');
			byCSS('div[dndid="'+data[1].id+'"]').classList.add('acting','turn');
			byCSS('div[dndid="'+data[2].id+'"]').classList.add('will_act','turn');
		}
	}

	function setMusic(data){
		music.loadVideoById(data.music,0,'small');
	}

	function setMusicVolume(data){
		musicVolume = data.musicVolume;
		music.setVolume(musicVolume);
	}
	function setAmbienceVolume(data){
		ambienceVolume = data.ambienceVolume;
		ambience.setVolume(ambienceVolume);
	}

	function setScene(data){
		console.log(data);
		changeTheBackdrop(data.backdrop);
		music.loadVideoById(data.music,0,'small');
		musicVolume = data.musicVolume;
		music.setVolume(musicVolume);
		ambience.loadVideoById(data.ambience,0,'small');
		ambienceVolume = data.ambienceVolume;
		ambience.setVolume(ambienceVolume);
	}

	function setBackdrop(data){
		changeTheBackdrop(data.url);
		console.log(data);
	}

	function setAudioTrack(data){
		//set the audio
		console.log(data, elements.youtubePlayer);
		var shortName;
		if(data.url){
			shortName = data.url.replace('https://www.youtube.com/watch?v=','');
			elements.youtubePlayer.src = 'https://www.youtube.com/embed/'+shortName+'?autoplay=1&vq=small&controls=0&html5=1&loop=1&playlist='+shortName;
		}
		else{
			elements.youtubePlayer.src = '';
		}
	}

	function setSketch(data){
		console.log(data);
		if(data.url){
			elements.sketch.style.backgroundImage = 'url('+data.url+')';
			elements.sketchContainer.classList.remove('hide')
		}
		else{
			elements.sketchContainer.classList.add('hide');
		}
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
		temp.className = 'peanut-emoji';
		temp.innerText = data.emoji;
		temp.style.left = (20 + Math.round(Math.random()*60))+'vw';
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
