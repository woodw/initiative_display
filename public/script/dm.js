let app = {};

document.addEventListener('DOMContentLoaded', function() {
	let socket, backdrops, sketches, audioTracks, elements, actors, uniqueID, initiativePointer;

	app.init = init;
	
	app.init();

	function init(){
		elements = registerElements();

		registerListeners();
		
		initSocket();
		
		actors=[];
		uniqueID = 0;
		initiativePointer = 0;

		app.session = 8;
		app.game = 'tythos';
	}

	function registerElements(){
		return {
			container: byCSS('#container'),
			tabs: document.querySelectorAll('.tab'),
			backdropTab: byCSS('#backdrop_tab'),
			backdropList: byCSS('#backdrop_list'),
			backdropSubmit: byCSS('#backdrop_button'),
			backdropPreview: byCSS('#backdrop_preview'),
			backdropCustomUrl: byCSS('#backdrop_custom'),
			backdropUseCustomUrl: byCSS('#backdrop_use_custom'),
			sketchTab: byCSS('#sketch_tab'),
			sketchList: byCSS('#sketch_list'),
			sketchSet: byCSS('#sketch_button--set'),
			sketchRemove: byCSS('#sketch_button--remove'),
			sketchPreview: byCSS('#sketch_preview'),
			sketchCustomUrl: byCSS('#sketch_custom'),
			sketchUseCustomUrl: byCSS('#sketch_use_custom'),
			audioTab: byCSS('#audio_tab'),
			audioList: byCSS('#audio_list'),
			audioSubmit: byCSS('#audio_button'),
			audioCustomUrl: byCSS('#audio_custom'),
			audioUseCustomUrl: byCSS('#audio_use_custom'),
			actorList: byCSS('#actor_list'),
			actorAdd: byCSS('#actor--add'),
			actorAddSubmit: byCSS('#actor--add button'),
			initiativesClearBtn: byCSS('#initiative--clear'),
			initiativesFillBtn: byCSS('#initiative--fill'),
			initiativeToggleBtn: byCSS('#initiative--toggle'),
			initiativeNextBtn: byCSS('#initiative--next'),
			reset: byCSS('#reset')
		};
	}

	function registerListeners(){

		elements.backdropList.addEventListener('change', newBackdropSelected);
		elements.backdropSubmit.addEventListener('click', setBotBackdrop);

		elements.sketchList.addEventListener('change', newSketchSelected);
		elements.sketchSet.addEventListener('click', setBotSketch);
		elements.sketchRemove.addEventListener('click', removeBotSketch);

		elements.audioList.addEventListener('change', newAudioTrackSelected);
		elements.audioSubmit.addEventListener('click', setBotAudio);

		elements.actorAddSubmit.addEventListener('click', addNewActor);

		elements.initiativesClearBtn.addEventListener('click', clearInitiative);
		elements.initiativesFillBtn.addEventListener('click',fillInitiative);
		elements.initiativeToggleBtn.addEventListener('click',toggleBotInitiativeDisplay);
		elements.initiativeNextBtn.addEventListener('click',advanceInitiative);

		elements.reset.addEventListener('click', reset);
	}

/*-------------------------------SOCKET FUNCTIONS*/
	function initSocket(){
		socket = io.connect(window.location.href.replace(window.location.pathname,''));

		socket.on('socket connection', socketConnection);
		
		socket.emit('get_backdrops_dm', setBackdrops);
		socket.emit('get_sketches_dm', setSketches);
		socket.emit('get_audiotracks_dm', setAudioTracks);

		/** make this in a pc todo list */
		socket.on('actor_stage_presence_request', addNewOnStageRequest);
		socket.on('set_actor_sketch', displayActorSketch);
		
	}
	function socketConnection(data) {
		console.log(data);
	}

	function addNewOnStageRequest(data){
		console.log('addNewOnStageRequest');
	}
	function displayActorSketch(){
		console.log('displayActorSketch');
	}

	function setBackdrops(backdrops){
		backdrops.session[app.session-1].forEach(function(backdrop){
			newSelectOption(elements.backdropList,backdrop);
		});

		if(backdrops.session[app.session-1].length>0){
			elements.backdropList.value = backdrops.session[app.session-1][0].url;
			elements.backdropPreview.style.backgroundImage = 'url('+elements.backdropList.value+')';						
		}
	}
	function setSketches(sketches){
		sketches.session[app.session-1].forEach(function(sketch){
			newSelectOption(elements.sketchList,sketch);
		});
		
		if(sketches.session[app.session-1].length>0){
			elements.sketchList.value = sketches.session[app.session-1][0].url;
			elements.sketchPreview.style.backgroundImage = 'url('+elements.sketchList.value+')';						
		}
	}
	function setAudioTracks(audioTracks){
		console.log(audioTracks);
		audioTracks.session[app.session-1].forEach(function(track){
			newSelectOption(elements.audioList,track);
		});
		
		if(audioTracks.session[app.session-1].length>0){
			elements.audioList.value = audioTracks.session[app.session-1][0].url;						
		}
	}

	/*emits*/

/*----------------- Helper Functions */
	function newSelectOption(selectElm,optionObj){
		var element;
		
		element = document.createElement('option');
		element.value = optionObj.url;
		element.text = optionObj.name;
		
		selectElm.appendChild(element);

	}

	

	function addEventListenerList(list, event, fn) {
		for (var i = 0, len = list.length; i < len; i++) {
			list[i].addEventListener(event, fn, false);
		}
	}

	function byCSS(cssSelector){
		return document.querySelector(cssSelector);
	}
	function byCSSAll(cssSelector){
		return document.querySelectorAll(cssSelector);
	}

	/*-------------------- REGISTER EVENT LISTENERS */
	
	function reset(event){
		actors = [];
		elements.actorList.innerHTML = '';
		socket.emit('reset_dm');
	}
	function newBackdropSelected(event){
		elements.backdropPreview.style.backgroundImage = 'url('+elements.backdropList.value+')';
	}
	function setBotBackdrop(event){
		var url;
		if(elements.backdropCustomUrl.value.length>7 && elements.backdropUseCustomUrl.checked){
			url = elements.backdropCustomUrl.value;
		}
		else{
			url = elements.backdropList.value;
		}

		socket.emit('set_backdrop_dm',{'url':url});
	}
	function newSketchSelected(event){
		elements.sketchPreview.style.backgroundImage = 'url('+elements.sketchList.value+')';
	}
	function setBotSketch(event){
		var url;
		if(elements.sketchCustomUrl.value.length>7 && elements.sketchUseCustomUrl.checked){
			url = elements.sketchCustomUrl.value;
		}
		else{
			url = elements.sketchList.value;
		}

		socket.emit('set_sketch_dm',{'url':url});
	}
	function removeBotSketch(event){
		socket.emit('set_sketch_dm',{'url':false});
	}

	function newAudioTrackSelected(event){
		elements.audioPreview.style.backgroundImage = 'url('+elements.audioList.value+')';
	}
	function setBotAudio(event){
		var url;
		if(elements.audioCustomUrl.value.length>7 && elements.audioUseCustomUrl.checked){
			url = elements.audioCustomUrl.value;
		}
		else{
			url = elements.audioList.value;
		}

		socket.emit('set_audiotrack_dm',{'url':url});
	}

	function addNewActor(event){
		var newActor, actorAddElements;
		
		actorAddElements = {
			classes: byCSS('#actor--add input:nth-child(1)'),
			hitpoints: byCSS('#actor--add input:nth-child(2)'),
			description: byCSS('#actor--add input:nth-child(3)')
		};
		
		if(actorAddElements.classes.value){
			newActor = new Actor(actorAddElements);
			elements.actorList.appendChild(newActor.elements.container);
			actors.push(newActor);
			newActor.arrayIdx = actors.length-1;
		}
	}
	function clearInitiative(event){
		while (elements.actorList.firstChild) {
			elements.actorList.removeChild(elements.actorList.firstChild);
		}
		actors.forEach(function(actor){
			actor.initiative = 0;
			actor.elements.initiative.value = actor.initiative;
		});
		actors.sort(function(a,b){
			return a.id - b.id;
		});
		actors.forEach(function(actor){
			elements.actorList.appendChild(actor.elements.container);
		});
		initiativePointer = 0;
	}
	function fillInitiative(event){
		while (elements.actorList.firstChild) {
			elements.actorList.removeChild(elements.actorList.firstChild);
		}
		actors.forEach(function(actor){
			actor.initiative = actor.initiative||Math.ceil(Math.random()*20);
			actor.elements.initiative.value = actor.initiative;
		});
		actors.sort(function(a,b){
			return b.initiative - a.initiative;
		});
		actors.forEach(function(actor){
			elements.actorList.appendChild(actor.elements.container);
		});

		if(actors.length>=3){
			socket.emit('alert_new_initiative_dm',[
				actors[((initiativePointer-1)<0)?(actors.length-1):(initiativePointer-1)].elements.classes.value,
				actors[initiativePointer].elements.classes.value,
				actors[((initiativePointer+1)>(actors.length-1))?(0):(initiativePointer+1)].elements.classes.value]
			);
		}
	}

	function toggleBotInitiativeDisplay(event){
		socket.emit('toggle_initiative_display_dm');
	}

	function advanceInitiative(event){
		if(actors.length>=3){
			initiativePointer++;
			if(initiativePointer>(actors.length-1)){
				initiativePointer = 0;
			}

			socket.emit('alert_new_initiative_dm',[
				actors[((initiativePointer-1)<0)?(actors.length-1):(initiativePointer-1)].elements.classes.value,
				actors[initiativePointer].elements.classes.value,
				actors[((initiativePointer+1)>(actors.length-1))?(0):(initiativePointer+1)].elements.classes.value]
			);
			
		}
	}

	/*----------------Actor Object Class*/
	function Actor(actorAddElements){
		this.elements = buildNewActor.call(this,actorAddElements);
		this.id = null;
		this.initiative = null;
		this.arrayIdx = null;

		registerActorEventListeners.call(this);
		console.log('sending add actor');
		//send out emit for stage to pick up	
		socket.emit('add_actor_dm', toJSON.call(this), (data) => {
			console.log('i got back an ID from the server');
			this.id = data.id;
		});	

		function toJSON(){
			return {
				id:this.id,
				classes:this.elements.classes.value,
				emoji:this.elements.emoji.value
			};
		};
		
		function buildNewActor(actorAddElements){
			var elements={};

			elements.container = document.createElement('div');
			elements.container.className = 'actor--update';

			elements.classes = document.createElement('input');
			elements.classes.setAttribute("type", "text");
			elements.classes.setAttribute("placeholder", "css classes");
			elements.classes.value = actorAddElements.classes.value;

			elements.container.appendChild(elements.classes);
			
			elements.hitpoints = document.createElement('input');
			elements.hitpoints.setAttribute("type", "number");
			elements.hitpoints.setAttribute("placeholder", "10");
			elements.hitpoints.value = actorAddElements.hitpoints.value;
			
			elements.container.appendChild(elements.hitpoints);  
			
			elements.description = document.createElement('input');
			elements.description.setAttribute("type", "text");
			elements.description.setAttribute("placeholder", "brief description");
			elements.description.value = actorAddElements.description.value;
			
			elements.container.appendChild(elements.description);
			
			elements.initiative = document.createElement('input');
			elements.initiative.setAttribute("type", "number");
			elements.initiative.setAttribute("placeholder", "1");
			
			elements.container.appendChild(elements.initiative);
			
			elements.emoji = document.createElement('input');
			elements.emoji.setAttribute("type", "text");
			elements.emoji.setAttribute("placeholder", "😀");
			
			elements.container.appendChild(elements.emoji);
			
			elements.update = document.createElement('button');
			elements.update.innerText = '✔';
			
			elements.container.appendChild(elements.update);
			
			elements.remove = document.createElement('button');
			elements.remove.innerText = '✖';
			
			elements.container.appendChild(elements.remove);

			elements.point = document.createElement('button');
			elements.point.innerText = '👇';  
			
			elements.container.appendChild(elements.point);

			elements.onstage = document.createElement('button');
			elements.onstage.innerText = 'toggle onstage';  
			
			elements.container.appendChild(elements.onstage);

			elements.turn = document.createElement('button');
			elements.turn.innerText = 'toggle turn';  
			
			elements.container.appendChild(elements.turn);

			elements.sketch = document.createElement('button');
			elements.sketch.innerText = 'send sketch';  
			
			elements.container.appendChild(elements.sketch);

			return elements;
		}

		function registerActorEventListeners(){

			this.elements.update.addEventListener('click', function(event){
				console.log('sending update actor');
				socket.emit('update_actor_dm', toJSON.call(this));		
			}.bind(this));  

			this.elements.remove.addEventListener('click', function(event){
				console.log('sending remove actor talk');
				socket.emit('remove_actor_dm', {id:this.id});
				this.elements.container.parentNode.removeChild(this.elements.container);
				this.alive = false;
				console.log(actors.toString(),actors.length);
				actors.splice(this.arrayIdx,1);
				console.log(actors.toString(),actors.length);
				
			}.bind(this));  

			this.elements.point.addEventListener('click', function(event){
				this.elements.emoji.value = '👇';
				socket.emit('play_actor_emoji', toJSON.call(this));
				this.elements.emoji.value = '';
			}.bind(this));

			this.elements.initiative.addEventListener('change', function(event){
				this.initiative = this.elements.initiative.value;
			}.bind(this));

			this.elements.onstage.addEventListener('click', function(event){
				socket.emit('set_actor_stage_presence_dm', {id:this.id});
			}.bind(this));

			this.elements.turn.addEventListener('click', function(event){
				socket.emit('turn_actor', {id:this.id});
			}.bind(this));

			this.elements.sketch.addEventListener('click', function(event){
				socket.emit('set_private_actor_sketch_dm', {id:this.id});
			}.bind(this));
		}
	}

});	