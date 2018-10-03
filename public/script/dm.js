let app = {};

document.addEventListener('DOMContentLoaded', function() {
/****************************Scope Objects*****************************/	
	let socket, scenes, backdrops, sketches, audioTracks, elements, actors, uniqueID, initiativePointer;

	app.init = init;
	
	app.init();

/****************************INIT Function*****************************/		
	function init(){
		elements = registerElements();

		registerListeners();
		
		initSocket();
		
		actors=[];
		uniqueID = 0;
		initiativePointer = 0;
	}

/****************************INIT Function*****************************/
	function newSelectOption(selectElm,optionValue,optionKey){
		var element;
		
		element = document.createElement('option');
		element.value = optionKey;
		element.text = optionValue;
		
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

/****************************REGISTER Functions*****************************/	
	function registerElements(){
		return {
			container: byCSS('.container'),

			sceneList: byCSS('#scene .card__selection'),
			sceneToggleCombat: byCSS('#scene #toggle-combat'),
			sceneVolumeMusic: byCSS('#scene #volume-music'),
			sceneVolumeAmbience: byCSS('#scene #volume-ambience'),
			sceneCustomBackdrop: byCSS('#scene  #custom-backdrop'),
			sceneCustomMusic: byCSS('#scene  #custom-music'),
			sceneCustomAmbience: byCSS('#scene  #custom-ambience'),
			sceneSubmit: byCSS('#scene .card__emit-button'),

			sketchList: byCSS('#sketch .card__selection'),
			sketchSet: byCSS('#sketch .card__emit-button--on'),
			sketchRemove: byCSS('#sketch .card__emit-button--off'),
			sketchTarget: byCSS('#sketch_target'),
			sketchPreview: byCSS('#sketch .card__image-preview'),
			sketchCustomUrl: byCSS('#sketch  .url-input'),
			sketchUseCustomUrl: byCSS('#sketch  .checkbox__check'),

			actorList: byCSS('#actor-controls'),
			
			actorControls:{
				element: byCSS('#new-actor-controls'),
				newActor: byCSS('#actors-control__add'),
				clear: byCSS('#actors-control__clear'),
				fill: byCSS('#actors-control__fill'),
				toggleOverlay: byCSS('#actors-control__toggle-overlay'),
				sort: byCSS('#actors-control__sort'),
				reset: byCSS('#actors-control__reset'),
			},

			actorRequests: byCSS('.bar__requests'),

			emojis: byCSSAll('#emojis button')
		};
	}

	function registerListeners(){

		elements.sceneToggleCombat.addEventListener('change', setBotCombat);
		elements.sceneVolumeMusic.addEventListener('change', setBotVolumeMusic);
		elements.sceneVolumeAmbience.addEventListener('change', setBotVolumeAmbience);
		elements.sceneSubmit.addEventListener('click', setBotScene);

		elements.sketchList.addEventListener('change', newSketchSelected);
		elements.sketchSet.addEventListener('click', setBotSketch);
		elements.sketchRemove.addEventListener('click', removeBotSketch);

		elements.actorControls.newActor.addEventListener('click', addNewActor);

		elements.actorControls.clear.addEventListener('click', clearInitiative);
		elements.actorControls.fill.addEventListener('click',fillInitiative);
		elements.actorControls.toggleOverlay.addEventListener('click',toggleBotInitiativeDisplay);
		elements.actorControls.sort.addEventListener('click',sortByInitiative);

		elements.actorControls.reset.addEventListener('click', reset);

		addEventListenerList(elements.emojis, 'click', function(event){
			console.log('hello', event);
			socket.emit('play_audience_emoji_pg',{emoji:event.target.innerText});
		});
	}

	function reset(event){
		actors = [];
		elements.actorList.innerHTML = '';
		socket.emit('reset_dm');
	}
	
	function setBotCombat(){
		console.log('toggles');
		var scene = scenes[elements.sceneList.selectedIndex];
		socket.emit('set_music_dm',{'music':(elements.sceneToggleCombat.checked)?scene.battle:scene.music});
	}
	function setBotScene(){
		console.log('clicked');
		var selectedScene = JSON.parse(JSON.stringify(scenes[elements.sceneList.selectedIndex]));
		selectedScene.music = (elements.sceneCustomMusic.value)?elements.sceneCustomMusic.value:(elements.sceneToggleCombat.checked)?selectedScene.battle:selectedScene.music;
		selectedScene.ambience = (elements.sceneCustomAmbience.value)?elements.sceneCustomAmbience.value:selectedScene.ambience;
		selectedScene.backdrop = (elements.sceneCustomBackdrop.value)?elements.sceneCustomBackdrop.value:selectedScene.backdrop;
		selectedScene.musicVolume = elements.sceneVolumeMusic.value;
		selectedScene.ambienceVolume = elements.sceneVolumeAmbience.value;
		socket.emit('set_scene_dm',selectedScene);
	}

	function setBotVolumeMusic(){
		socket.emit('set_music_volume_dm',{'musicVolume':elements.sceneVolumeMusic.value});
	}
	function setBotVolumeAmbience(){
		socket.emit('set_ambience_volume_dm',{'ambienceVolume':elements.sceneVolumeAmbience.value});
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

		socket.emit('set_sketch_dm',{'target':elements.sketchTarget.value,'url':url});
	}

	function removeBotSketch(event){
		socket.emit('set_sketch_dm',{'target':elements.sketchTarget.value,'url':false});
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
			elements.actorList.firstChild.className = 'stage-actor';
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
		
		actors.forEach(function(actor, index){
			elements.actorList.appendChild(actor.elements.container);

			if(actor.elements.container.classList.contains('acting')){				
				setActiveStageActors(getActorIndex(index-1),getActorIndex(index),getActorIndex(index+1));
			}
			
		});

	}

	function toggleBotInitiativeDisplay(event){
		socket.emit('toggle_initiative_display_dm');
	}

	function setActiveStageActors(acted, acting, willAct){
		var ids;

		ids = [{id:actors[acted].id},{id:actors[acting].id},{id:actors[willAct].id}];

		actors.forEach(function(item){
			item.elements.container.className = 'stage-actor';
		});

		actors[acted].elements.container.classList.add('acted');
		actors[acting].elements.container.classList.add('acting');
		actors[willAct].elements.container.classList.add('willAct');

		socket.emit('set_combat_actors_dm',ids);
	}

	function getActorIndex(pointer){
		return (pointer%actors.length + actors.length)%actors.length;
	}

	function sortByInitiative(event){
		while (elements.actorList.firstChild) {
			elements.actorList.removeChild(elements.actorList.firstChild);
		}
		
		actors.sort(function(a,b){
			if(!a.initiative && !b.initiative){
				return 0;
			}
			else
			if(!b.initiative){
				return -1;
			}
			else
			if(!a.initiative){
				return 1;
			}
			else{
				return b.initiative - a.initiative;
			}
		});
		
		actors.forEach(function(actor, index){
			elements.actorList.appendChild(actor.elements.container);

			if(actor.elements.container.classList.contains('acting')){		
				console.log(index,'asasasasas');		
				setActiveStageActors(getActorIndex(index-1),getActorIndex(index),getActorIndex(index+1));
			}
			
		});
	}

/****************************SOCKET Functions*****************************/
	function initSocket(){
		var worldName;
		socket = io.connect(window.location.href.replace(window.location.pathname,''));
		socket.on('socket connection', socketConnection);

		/** make this in a pc todo list */
		socket.on('actor_stage_presence_request', addNewOnStageRequest);
		socket.on('set_actor_sketch', displayActorSketch);
		
		worldName = window.location.pathname.split('/');
		worldName = worldName[worldName.length-2];
		socket.emit('download_world',{'name': worldName}, populateScenes);
		socket.emit('get_sketches_dm', {'name':worldName}, setSketches);
	}

	function socketConnection(data) {
		console.log(data);
	}

	function populateScenes(newScenes){
		console.log(newScenes);
		scenes = newScenes;
		scenes.forEach(function(scene, idx, e){
			console.log(scene.name, idx);
			newSelectOption(elements.sceneList,scene.name, idx);
		});
	}

	function setSketches(sketches){
		sketches.forEach(function(sketch){
			newSelectOption(elements.sketchList,sketch.name,sketch.url);
		});
		
		if(sketches.length>0){
			elements.sketchList.value = sketches[0].url;
			elements.sketchPreview.src = elements.sketchList.value;						
		}
	}

	function addNewOnStageRequest(data){
		console.log('addNewOnStageRequest');
		var newAlert, doAction;
		
		doAction = function(){
			socket.emit('set_actor_stage_presence_pc',{class: data.class, onstage: true});
		};
		
		newAlert = createAlert(data,doAction);
		
		elements.actorRequests.appendChild(newAlert);
	}

	function displayActorSketch(data){
		console.log('displayActorSketch');
		var newAlert, preview, doAction;
		
		doAction = function(){
			socket.emit('set_sketch_dm',{'target':data.class,'url':data.image});
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


	/****************************Actor Object Functions*****************************/
	function Actor(actorAddElements){
		this.elements = buildNewActor.call(this,actorAddElements);
		this.id = null;
		this.initiative = null;
		this.arrayIdx = null;
		this.emoji;

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
				emoji:this.emoji
			};
		};
		
		function buildNewActor(actorAddElements){
			var elements={};

			elements.container = document.createElement('div');
			elements.container.className = 'stage-actor';

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

			this.elements.container.addEventListener('click',function(event){
				if(event.target==this.elements.container){			
					var arrayIdex,myId;
					myId = this.id;

					event.target.classList.add('acting');

					function matchingId(element) {
						return element.id == myId;
					}

					arrayIndex = actors.findIndex(matchingId);

					setActiveStageActors(getActorIndex(arrayIndex-1),getActorIndex(arrayIndex),getActorIndex(arrayIndex+1));
				}
			}.bind(this));

			this.elements.remove.addEventListener('click', function(event){
				event.stopPropagation();
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

				
				if(this.elements.container.classList.contains('acted')){
					setActiveStageActors(getActorIndex(heep-1),getActorIndex(heep+1),getActorIndex(heep+2));
				}
				else
				if(this.elements.container.classList.contains('willAct')){
					setActiveStageActors(getActorIndex(heep-2),getActorIndex(heep-1),getActorIndex(heep+1));
				}
				else
				if(this.elements.container.classList.contains('acting')){
					setActiveStageActors(getActorIndex(heep-1),getActorIndex(heep+1),getActorIndex(heep+2));
				}

				actors.splice(heep,1);
				console.log('id',this.id);
				console.log('array',actors.toString());
				
				

			}.bind(this));  

			this.elements.point.addEventListener('click', function(event){
				event.stopPropagation();
				this.emoji = '👇';
				socket.emit('play_actor_emoji', toJSON.call(this));
				this.emoji = '';
			}.bind(this));

			this.elements.initiative.addEventListener('change', function(event){
				event.stopPropagation();
				this.initiative = this.elements.initiative.value;
			}.bind(this));

			this.elements.onstage.addEventListener('click', function(event){
				event.stopPropagation();
				console.log('do i get in here?');
				socket.emit('set_actor_stage_presence_dm', {id:this.id});
			}.bind(this));

			this.elements.turn.addEventListener('click', function(event){
				event.stopPropagation();
				socket.emit('turn_actor', {id:this.id});
			}.bind(this));
		}
	}
	Actor.prototype.toString = function(){
		return this.id + ' | ' + this.elements.classes.value;
	};

});	