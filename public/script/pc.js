let app = {};

//set_private_actor_sketch

document.addEventListener('DOMContentLoaded', function() {
	let socket,character,characterName,elements,onStage;

	app.init = init;
	
	app.init();

	function init(){
		elements = registerElements();
		registerListeners();
		initSocket();
		getUserData();
		onStage=true;
	}

	function initSocket(){
		socket = io.connect(window.location.href.replace(window.location.pathname,''));
		
		socket.on('socket connection', function (data) {
			console.log(data);
		});

		socket.on('set_actor_private_sketch', function(data){
			console.log(data);
		});
	}

	function registerElements(){
		return {
			emojis: document.querySelectorAll('#emojis button'),
			title: byCSS('#player--name'),
			subTitle: byCSS('#player--class'),
			spellListLink: byCSS('#links a:nth-child(2)'),
			characterSheetLink: byCSS('#links a:nth-child(3)'),
			characterPortrait: byCSS('.character-background'),
			actorActionTurn: byCSS('#action_turn'),
			actorActionEnter: byCSS('#action_enter'),
			actorActionLeave: byCSS('#action_leave'),
			privateSketch: byCSS('#private_sketch'),
			buttonSketchRemove: byCSS('#button_sketch-remove'),
			buttonSketchSubmit: byCSS('#button_sketch-submit')
		};
	}

	function getUserData(){
		var xhttp, jsonData;
		
		xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				jsonData = JSON.parse(xhttp.response);
				characterName = jsonData.character.css;
				elements.title.innerText = jsonData.character.name;
				elements.subTitle.innerText = jsonData.character.class;
				elements.spellListLink.setAttribute('href',jsonData.character.spells);
				elements.characterSheetLink.setAttribute('href',jsonData.character.orcpub);
				elements.characterPortrait.style.backgroundImage = 'url('+jsonData.character.mini+')';
				console.log(jsonData);
			}
		};
		xhttp.open("GET", "/userData", true);
		xhttp.send();
	}

	function addEventListenerList(list, event, fn) {
		for (var i = 0, len = list.length; i < len; i++) {
			list[i].addEventListener(event, fn, false);
		}
	}

	function byCSS(cssSelector){
		return document.querySelector(cssSelector);
	}

/********************** register event listeners */
	function registerListeners(){
		addEventListenerList(elements.emojis, 'click', function(event){
			console.log('hello', event);
			socket.emit('set_actor_emoji_pc',{character:characterName,emoji:event.target.innerText});
		});

		elements.actorActionTurn.addEventListener('click', turnActor);
		elements.actorActionEnter.addEventListener('click', actorEnterStage);
		elements.actorActionLeave.addEventListener('click', actorLeaveStage);
		elements.buttonSketchRemove.addEventListener('click', hidePrivateSketch);
		elements.buttonSketchSubmit.addEventListener('click', submitPrivateSketch);
	}
	function turnActor(event){
		console.log('this is working');
		socket.emit('turn_actor_pc');
	}
	function actorEnterStage(event){
		console.log('this is working');
		socket.emit('request_actor_move_pc',{move: 'enter'}, getResponse);
	}
	function actorLeaveStage(event){
		console.log('this is working');
		socket.emit('request_actor_move_pc',{move: 'leave'}, getResponse);
	}
	function hidePrivateSketch(event){
		console.log('this is working');
		console.log('hide sketch');
	}
	function submitPrivateSketch(event){
		console.log('this is working');
		console.log('hide sketch');
	}
	function getResponse(data){
		console.log(data);
	}
});	