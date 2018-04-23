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
			container: byCSS('.container'),

			backdropList: byCSS('#backdrop .card__selection'),
			backdropSubmit: byCSS('#backdrop .card__emit-button'),
			backdropPreview: byCSS('#backdrop .card__image-preview'),
			backdropCustomUrl: byCSS('#backdrop .url-input'),
			backdropUseCustomUrl: byCSS('#backdrop .checkbox__check'),

			sketchList: byCSS('#sketch .card__selection'),
			sketchSet: byCSS('#sketch .card__emit-button--on'),
			sketchRemove: byCSS('#sketch .card__emit-button--off'),
			sketchPreview: byCSS('#sketch .card__image-preview'),
			sketchCustomUrl: byCSS('#sketch  .url-input'),
			sketchUseCustomUrl: byCSS('#sketch  .checkbox__check'),

			audioContainer: byCSS('#audio'),
			audioList: byCSS('#audio .card__selection'),
			audioSet: byCSS('#audio .card__emit-button--on'),
			audioRemove: byCSS('#audio .card__emit-button--off'),
			audioPreviewContainer: byCSS('#audio .card__audio-preview-container'),
			audioPreview: byCSS('#audio .card__audio-preview'),
			audioCustomUrl: byCSS('#audio  .url-input'),
			audioUseCustomUrl: byCSS('#audio  .checkbox__check'),

			actorList: byCSS('#actor-controls'),
			
			actorControls:{
				element: byCSS('#new-actor-controls'),
				newActor: byCSS('#actors-control__add'),
				clear: byCSS('#actors-control__clear'),
				fill: byCSS('#actors-control__fill'),
				toggleOverlay: byCSS('#actors-control__toggle-overlay'),
				advance: byCSS('#actors-control__advance'),
				reset: byCSS('#actors-control__reset'),
			},

			actorRequests: byCSS('.bar__requests')
		};
	}

	function registerListeners(){

		elements.backdropList.addEventListener('change', newBackdropSelected);
		elements.backdropSubmit.addEventListener('click', setBotBackdrop);

		elements.sketchList.addEventListener('change', newSketchSelected);
		elements.sketchSet.addEventListener('click', setBotSketch);
		elements.sketchRemove.addEventListener('click', removeBotSketch);

		elements.audioList.addEventListener('change', newAudioTrackSelected);
		elements.audioSet.addEventListener('click', setBotAudio);
		elements.audioRemove.addEventListener('click', removeBotAudio);//

		elements.actorControls.newActor.addEventListener('click', addNewActor);

		elements.actorControls.clear.addEventListener('click', clearInitiative);
		elements.actorControls.fill.addEventListener('click',fillInitiative);
		elements.actorControls.toggleOverlay.addEventListener('click',toggleBotInitiativeDisplay);
		elements.actorControls.advance.addEventListener('click',advanceInitiative);

		elements.actorControls.reset.addEventListener('click', reset);
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

	//Request coming from the player
	function addNewOnStageRequest(data){
		console.log('addNewOnStageRequest');
		var newAlert, doAction;
		
		doAction = function(){
			socket.emit('set_actor_stage_presence_pc',{class: data.class, onstage: true});
		};
		
		newAlert = createAlert(data,doAction);
		
		elements.actorRequests.appendChild(newAlert);
	}
	//request coming from the player
	function displayActorSketch(data){
		console.log('displayActorSketch');
		var newAlert, preview, doAction;
		
		doAction = function(){
			socket.emit('set_sketch_pc',{'url':data.image});
		};
		
		newAlert = createAlert(data,doAction);
		
		preview = document.createElement('img');
			preview.className = 'alert__image';
			preview.src = data.image;
			newAlert.insertBefore(preview, newAlert.querySelector('button'));
		
			elements.actorRequests.appendChild(newAlert);
	}

	function createAlert(data, doAction){
		var newAlert, alertTitle, alertDetails, alertAccpet, alertDecline;
		newAlert = document.createElement('div');
		newAlert.className = 'alert';

		alertTitle = document.createElement('h4');
			alertTitle.className = 'alert__title';
			alertTitle.innerText = data.title;
			newAlert.appendChild(alertTitle);
		alertDetails = document.createElement('p');
			alertDetails.className = 'alert__details';
			alertDetails.innerText = data.detail;
			newAlert.appendChild(alertDetails);
		alertAccept = document.createElement('button');
			alertAccept.className = 'alert__button';
			alertAccept.innerText = 'Accept';
			alertAccept.addEventListener('click', function(){
				doAction();
				elements.actorRequests.removeChild(newAlert);
			});
			newAlert.appendChild(alertAccept);
		alertDecline = document.createElement('button');
			alertDecline.className = 'alert__button';
			alertDecline.innerText = 'Decline';
			alertDecline.addEventListener('click', function(){
				elements.actorRequests.removeChild(newAlert);
			});
			newAlert.appendChild(alertDecline);
		return newAlert;
	}

	function setBackdrops(backdrops){
		console.log(backdrops);
		backdrops.session[app.session-1].forEach(function(backdrop){
			newSelectOption(elements.backdropList,backdrop);
		});

		if(backdrops.session[app.session-1].length>0){
			elements.backdropList.value = backdrops.session[app.session-1][0].url;
			elements.backdropPreview.src = elements.backdropList.value;						
		}
	}
	function setSketches(sketches){
		sketches.session[app.session-1].forEach(function(sketch){
			newSelectOption(elements.sketchList,sketch);
		});
		
		if(sketches.session[app.session-1].length>0){
			elements.sketchList.value = sketches.session[app.session-1][0].url;
			elements.sketchPreview.src = elements.sketchList.value;						
		}
	}
	function setAudioTracks(audioTracks){
		console.log(audioTracks);
		audioTracks.session[app.session-1].forEach(function(track){
			newSelectOption(elements.audioList,track);
		});
		
		if(audioTracks.session[app.session-1].length>0){
			var shortName;
			elements.audioList.value = audioTracks.session[app.session-1][0].url;	
				
			shortName = elements.audioList.value.replace('https://www.youtube.com/watch?v=','');
			elements.audioPreview.src='https://www.youtube.com/embed/'+shortName;
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

		elements.backdropPreview.src = elements.backdropList.value;
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
		elements.sketchPreview.src = elements.sketchList.value;
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
		shortName = elements.audioList.value.replace('https://www.youtube.com/watch?v=','');
		elements.audioPreview.src='https://www.youtube.com/embed/'+shortName;
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
	function removeBotAudio(event){
		socket.emit('set_audiotrack_dm',{'url':false});
	}

	function addNewActor(event){
		var newActor, actorAddElements;
		
		actorAddElements = {
			classes: byCSS('#new-actor__css'),
			hitpoints: byCSS('#new-actor__hp'),
			description: byCSS('#new-actor__desc')
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
		socket.emit('set_combat_actors_dm',[]);
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
			socket.emit('set_combat_actors_dm',getCombatPlayers());
		}
	}

	function toggleBotInitiativeDisplay(event){
		socket.emit('toggle_initiative_display_dm');
	}

	function getCombatPlayers(){
		return [
			{
				id:validArraySpot(initiativePointer-1).id
			},
			{
				id:validArraySpot(initiativePointer).id
			},
			{
				id:validArraySpot(initiativePointer+1).id
			}
		];
	}
	function validArraySpot(idx){
		//05 15 25 35 45 55 65/05
		while(idx<0){
			idx+=actors.length;
		}
		while(idx>(actors.length-1)){
			idx-=actors.length;
		}

		return actors[idx];
	}

	function advanceInitiative(event){
		initiativePointer++;
		if(actors.length>=3){
			socket.emit('set_combat_actors_dm',getCombatPlayers());
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
				classes:this.elements.classes.value
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

			return elements;
		}

		function registerActorEventListeners(){

			this.elements.remove.addEventListener('click', function(event){
				console.log('sending remove actor talk');
				socket.emit('remove_actor_dm', {id:this.id});
				console.log('id',this.id);
				console.log('array',actors.toString());
				
				var heep;

				heep = actors.findIndex((element) => {
					console.log(element, element.id, this.id);
					console.log((element.id == this.id));
					return element.id == this.id;
				});

				console.log('index',heep);
				

				this.elements.container.parentNode.removeChild(this.elements.container);
				this.alive = false;

				actors.splice(heep,1);
				console.log('id',this.id);
				console.log('array',actors.toString());
				fillInitiative(event);
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
				console.log('do i get in here?');
				socket.emit('set_actor_stage_presence_dm', {id:this.id});
			}.bind(this));

			this.elements.turn.addEventListener('click', function(event){
				socket.emit('turn_actor', {id:this.id});
			}.bind(this));
		}
	}
	Actor.prototype.toString = function(){
		return this.id + ' | ' + this.elements.classes.value;
	};

});	