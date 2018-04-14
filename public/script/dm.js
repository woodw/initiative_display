let app = {};

document.addEventListener('DOMContentLoaded', function() {
	let socket,backdrops,sketches,elements, actors, uniqueID, initiativePointer;

	app.init = init;
	
	app.init();

	function init(){
		elements = registerElements();
		registerListeners();
		initSocket();
		actors=[];
		uniqueID = 0;
		initiativePointer = 0;
	}

	function initSocket(){
		socket = io.connect(window.location.href.replace(window.location.pathname,''));
		
		socket.on('socket connection', function (data) {
			console.log(data);
		});

		socket.emit('get backdrops');

		socket.emit('get sketches');

		socket.on('send backdrops', function(data){
			backdrops = data;
			
			backdrops.session[0].forEach(function(backdrop){
				newBackDropOption(elements.backDropList,backdrop);
			});

			if(backdrops.session[0].length>0){
				elements.backDropList.value = backdrops.session[0][0].url;
				elements.backDropPreview.style.backgroundImage = 'url('+elements.backDropList.value+')';						
			}
		});

		socket.on('send sketches', function(data){
			sketches = data;
			
			sketches.session[0].forEach(function(sketch){
				newBackDropOption(elements.sketchList,sketch);
			});
			
			if(sketches.session[0].length>0){
				elements.sketchList.value = sketches.session[0][0].url;
				elements.sketchPreview.style.backgroundImage = 'url('+elements.sketchList.value+')';						
			}
		});
	}

	function newBackDropOption(selectElm,optionObj){
		var element;
		
		element = document.createElement('option');
		element.value = optionObj.url;
		element.text = optionObj.name;
		
		selectElm.appendChild(element);

	}

	function registerElements(){
		return {
			container: byCSS('#container'),
			tabs: document.querySelectorAll('.tab'),
			backDropTab: byCSS('#back-drop_tab'),
			backDropList: byCSS('#back-drop_list'),
			backDropSubmit: byCSS('#back-drop_button'),
			backDropPreview: byCSS('#back-drop_preview'),
			backDropCustomUrl: byCSS('#back-drop_custom'),
			backDropUseCustomUrl: byCSS('#back-drop_use_custom'),
			sketchTab: byCSS('#sketch_tab'),
			sketchList: byCSS('#sketch_list'),
			sketchShow: byCSS('#sketch_button--show'),
			sketchHide: byCSS('#sketch_button--hide'),
			sketchPreview: byCSS('#sketch_preview'),
			sketchCustomUrl: byCSS('#sketch_custom'),
			sketchUseCustomUrl: byCSS('#sketch_use_custom'),
			actorList: byCSS('#actor_list'),
			actorAdd: byCSS('#actor--add'),
			actorAddSubmit: byCSS('#actor--add button'),
			initiativesClearBtn: byCSS('#initiative--clear'),
			initiativesFillBtn: byCSS('#initiative--fill'),
			initiativeToggleBtn: byCSS('#initiative--toggle'),
			initiativeNextBtn: byCSS('#initiative--next')
		};
	}

	function addEventListenerList(list, event, fn) {
		for (var i = 0, len = list.length; i < len; i++) {
			list[i].addEventListener(event, fn, false);
		}
	}

	function byCSS(cssSelector){
		return document.querySelector(cssSelector);
	}

	function registerListeners(){

		elements.backDropList.addEventListener('change', function(event, no){
			elements.backDropPreview.style.backgroundImage = 'url('+elements.backDropList.value+')';
		});
		elements.backDropSubmit.addEventListener('click', function(event){
			if(elements.backDropCustomUrl.value.length>7 && elements.backDropUseCustomUrl.checked){
				socket.emit('update backdrop',{'url':elements.backDropCustomUrl.value});
			}
			else{
				socket.emit('update backdrop',{'url':elements.backDropList.value});
			}
		});

		elements.sketchList.addEventListener('change', function(event, no){
			elements.sketchPreview.style.backgroundImage = 'url('+elements.sketchList.value+')';
		});
		elements.sketchShow.addEventListener('click', function(event){

			if(elements.sketchCustomUrl.value.length>7 && elements.sketchUseCustomUrl.checked){
				socket.emit('update sketch',{'url':elements.sketchCustomUrl.value});
			}
			else{
				socket.emit('update sketch',{'url':elements.sketchList.value});
			}
		});
		elements.sketchHide.addEventListener('click', function(event){
			console.log('hude');
			socket.emit('hide sketch');
		});
		elements.actorAddSubmit.addEventListener('click', function(){
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
			}
		});

		elements.initiativesClearBtn.addEventListener('click',function(event){
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
		});

		elements.initiativesFillBtn.addEventListener('click',function(event){
			console.log('we are in the fill', actors);
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
console.log('im going to emit');

				socket.emit('set deck',[
					actors[
						((initiativePointer-1)<0)?(actors.length-1):(initiativePointer-1)
					].elements.classes.value,
					actors[initiativePointer].elements.classes.value,
					actors[
						((initiativePointer+1)>(actors.length-1))?(0):(initiativePointer+1)
					].elements.classes.value]
				);
			}
		});

		elements.initiativeToggleBtn.addEventListener('click',function(event){
			socket.emit('toggle initiative display');
		});

		elements.initiativeNextBtn.addEventListener('click',function(event){
			console.log(actors.length);
			if(actors.length>=3){
				initiativePointer++;
				if(initiativePointer>(actors.length-1)){
					initiativePointer = 0;
				}

				socket.emit('set deck',[
					actors[
						((initiativePointer-1)<0)?(actors.length-1):(initiativePointer-1)
					].elements.classes.value,
					actors[initiativePointer].elements.classes.value,
					actors[
						((initiativePointer+1)>(actors.length-1))?(0):(initiativePointer+1)
					].elements.classes.value]
				);
				
			}
		});
	}

	/*Actor Object Class*/
	function Actor(actorAddElements){
		this.elements = buildNewActor.call(this,actorAddElements);
		this.id = null;
		this.initiative = null;
		
		registerActorEventListeners.call(this);
		console.log('sending add actor');
		//send out emit for stage to pick up	
		socket.emit('add actor', toJSON.call(this), (data) => {
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

		function registerActorEventListeners(){

			this.elements.update.addEventListener('click', function(event){
				console.log('sending update actor');
				socket.emit('update actor', toJSON.call(this));		
			}.bind(this));  

			this.elements.remove.addEventListener('click', function(event){
				console.log('sending remove actor talk');
				socket.emit('remove actor', {id:this.id});
				this.elements.container.parentNode.removeChild(this.elements.container);
				this.alive = true;
			}.bind(this));  

			this.elements.point.addEventListener('click', function(event){
				this.elements.emoji.value = '👇';
				socket.emit('update actor', toJSON.call(this));
				this.elements.emoji.value = '';
			}.bind(this));

			this.elements.initiative.addEventListener('change', function(event){
				this.initiative = this.elements.initiative.value;
			}.bind(this));

			this.elements.onstage.addEventListener('click', function(event){
				if(this.elements.classes.value.indexOf('onstage')!=-1){
					this.elements.classes.value = this.elements.classes.value.replace(' onstage','');
					
				}else{
					this.elements.classes.value = this.elements.classes.value+' onstage';
				
				}
				this.elements.emoji.innerText = '';
				socket.emit('update actor', toJSON.call(this));
			}.bind(this));

			this.elements.turn.addEventListener('click', function(event){
				if(this.elements.classes.value.indexOf('turn')!=-1){
					this.elements.classes.value = this.elements.classes.value.replace(' turn','');
					
				}else{
					this.elements.classes.value = this.elements.classes.value+' turn';
				
				}
				this.elements.emoji.innerText = '';
				socket.emit('update actor', toJSON.call(this));
			}.bind(this));
		}
		
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

			return elements;
		}
	}

});	