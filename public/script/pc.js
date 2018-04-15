let app = {};

			document.addEventListener('DOMContentLoaded', function() {
				let socket,character,characterName,elements;

				app.init = init;
				
				app.init();

				function init(){
					elements = registerElements();
					registerListeners();
					initSocket();
					getUserData();
				}

				function initSocket(){
					socket = io.connect(window.location.href.replace(window.location.pathname,''));
					
					socket.on('socket connection', function (data) {
						console.log(data);
					});

					socket.on('get initiative', function(data){
						console.log(data);
					});

					socket.on('get message', function(data){
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
						characterPortrait: byCSS('.character-background')
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

				function registerListeners(){
					addEventListenerList(elements.emojis, 'click', function(event){
						console.log('hello', event);
						socket.emit('update emoji',{character:characterName,emoji:event.target.innerText});
					});
				}
			});	