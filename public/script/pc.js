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
			actorActionMove: byCSS('#action_move'),
			privateSketch: byCSS('#sketch_preview'),
			sketchPreviewImage: byCSS('#sketch_preview--image'),
			buttonSketchRemove: byCSS('#button_sketch-remove'),
			inputSketchSubmit: byCSS('#input_sketch-submit'),
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

				socket.on('set_sketch_'+characterName, function(data){
					
					if(data.url){
						elements.privateSketch.classList.remove('hide');
						elements.sketchPreviewImage.style.backgroundImage = 'url('+data.url+')';
						elements.privateSketch.scrollIntoView();
						console.log(data);
					}
					else{
						hidePrivateSketch();
					}
				});
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
			socket.emit('play_actor_emoji',{class:characterName,emoji:event.target.innerText});
		});

		elements.actorActionTurn.addEventListener('click', turnActor);
		elements.actorActionMove.addEventListener('click', actorMoveStage);
		
		elements.buttonSketchRemove.addEventListener('click', hidePrivateSketch);
		elements.buttonSketchSubmit.addEventListener('click', submitPrivateSketch);
	}
	function turnActor(event){
		console.log('this is working');
		socket.emit('turn_actor', {class: characterName});
	}
	function actorMoveStage(event){
		console.log('this is working');

		socket.emit('actor_stage_presence_request_pc',{
			title: characterName+' request',
			class: characterName,
			detail: 'wants to move'
		});
		
	}
	function hidePrivateSketch(event){
		console.log('this is working');
		elements.privateSketch.classList.add('hide');
	}
	function submitPrivateSketch(event){
		console.log('this is working');
		if(elements.inputSketchSubmit.value){
			socket.emit('set_actor_sketch_pc',{
				title: characterName+' request',
				class: characterName,
				detail: 'wants to show sketch',
				image: elements.inputSketchSubmit.value
			});
		}
	}
	function getResponse(data){
		console.log(data);
	}
});	