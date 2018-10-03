let app = {};

document.addEventListener('DOMContentLoaded', function() {
/****************************Scope Objects*****************************/	
    let socket, gridXCount, gridYCount, battleMap, mapDesign, focus, displayHidden;
    
    app.init = init;
	
	app.init();

/****************************INIT Function*****************************/		
	function init(){
		elements = registerElements();

		registerListeners();
		
		initSocket();
        
        gridXCount = 25;//46;
        gridYCount = 22;//32;
        battleMap = [];
        displayHidden = true;

        //Like setting resolution, 1:1
        elements.mapView.width = elements.mapView.clientWidth;
        elements.mapView.height = elements.mapView.clientHeight;

        buildMapDesign();

        elements.mapContainer.appendChild(mapDesign);
	}

/****************************INIT Function*****************************/
	

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
			hideButton: byCSS('#hidden-button'),
            dataButton: byCSS('#to-data-url'),
            importButton: byCSS('#import-map'),
            exportButton: byCSS('#export-map'),
            textArea: byCSS('#text-overlay'),
			mapContainer: byCSS('#map'),
			mapView: byCSS('#map_view')
		};
	}

	function registerListeners(){

        document.addEventListener('keypress',captureKeyPress);

        elements.hideButton.addEventListener('click', toggleHiddenCellDisplay);
        elements.dataButton.addEventListener('click', sendDataUrl);
        elements.importButton.addEventListener('click', importMap);
        elements.exportButton.addEventListener('click', exportMap);
        elements.textArea.addEventListener('keypress', closeTextArea);
        
    }
    
    function captureKeyPress(event){
        (focus)?focus.updateTile(event.key):false;
    }

    function toggleHiddenCellDisplay(){
        displayHidden = !displayHidden;
        elements.hideButton.innerText = (displayHidden)?'Hide Hidden Cells':'Show Hidden Cells';
        //console.log('click', displayHidden);
        renderTheMap();
        //So I can export image and import img... this is amazing
        //stroke.drawImage(img,0,0);
        //console.log(mapView.toDataURL());
    }

    function importMap(){
        elements.textArea.classList.toggle('hide');
    }
    function exportMap(){
        elements.textArea.value=printTheMap();
        elements.textArea.classList.toggle('hide');
    }
    function closeTextArea(event){
        if(event.key === 'Enter'){
            elements.textArea.classList.toggle('hide');
        }
    }

    function sendDataUrl(){
        //console.log(elements.mapView.toDataURL());
        socket.emit('set_sketch_dm',{'target':'stage','url':elements.mapView.toDataURL()});
        //stage
        //socket.emit('map_send_url',{imgUrl:elements.mapView.toDataURL()});
    }

/****************************SOCKET Functions*****************************/
	function initSocket(){
		socket = io.connect(window.location.href.replace(window.location.pathname,''));

		socket.on('socket connection', socketConnection);
		
	}

	function socketConnection(data) {
		console.log(data);
    }
    
    /*******************************PRIVATE FUNCTIONS************************************* */
    function printTheMap(){
        var exportText='';
        if(elements.mapView){
            for(var i=0;i<gridYCount;i++){
                for(var j=0;j<gridXCount;j++){
                    //console.log('rendering the map');
                    exportText += battleMap[i][j].printTile()+'@';
                }
            }
        }
        return exportText;
    }

    function renderTheMap(){
        for(var i=0;i<gridYCount;i++){
            for(var j=0;j<gridXCount;j++){
                //console.log('rendering the map');
                (elements.mapView)?battleMap[i][j].renderTile():false;
            }
        }
    }

    function buildMapDesign(){
        mapDesign = document.createElement('div');
        mapDesign.id = 'map_design';
    
        for(var i=0;i<gridYCount;i++){
            battleMap[i] = [];
            for(var j=0;j<gridXCount;j++){
                battleMap[i][j] = new Tile(i,j);
                mapDesign.appendChild(battleMap[i][j].element);
            }
        }
    }

    function randomColor(){
        var r,g,b;
        r = Math.round(Math.random()*255);
        g = Math.round(Math.random()*255);
        b = Math.round(Math.random()*255);
        return 'rgba('+r+','+g+','+b+',.5)';
    }

    function setStuff(newDraw){
        if(newDraw.gridX>0){
           if(battleMap[newDraw.gridY][newDraw.gridX-1].east === 1){
              newDraw.west = 0;
              battleMap[newDraw.gridY][newDraw.gridX-1].east = 0;
              //newDraw.renderTile();
              battleMap[newDraw.gridY][newDraw.gridX-1].renderTile();
           }
           else
           if(battleMap[newDraw.gridY][newDraw.gridX-1].east !== 0){
               newDraw.west = 0;
           }
        }
        
        if(newDraw.gridX<gridXCount-1){
           if(battleMap[newDraw.gridY][newDraw.gridX+1].west === 1){
              newDraw.east = 0;
              battleMap[newDraw.gridY][newDraw.gridX+1].west = 0;
              //newDraw.renderTile();
              battleMap[newDraw.gridY][newDraw.gridX+1].renderTile();
           }
           else
           if(battleMap[newDraw.gridY][newDraw.gridX+1].west !== 0){
               newDraw.east = 0;
           }
        }
        
        if(newDraw.gridY>0){
           if(battleMap[newDraw.gridY-1][newDraw.gridX].south === 1){
              newDraw.north = 0;
              battleMap[newDraw.gridY-1][newDraw.gridX].south = 0;
              //newDraw.renderTile();
              battleMap[newDraw.gridY-1][newDraw.gridX].renderTile();
           }
           else
           if(battleMap[newDraw.gridY-1][newDraw.gridX].south !== 0){
               newDraw.north = 0;
           }
        }
        
        if(newDraw.gridY<gridYCount-1){
           if(battleMap[newDraw.gridY+1][newDraw.gridX].north === 1){
              newDraw.south = 0;
              battleMap[newDraw.gridY+1][newDraw.gridX].north = 0;
              //newDraw.renderTile();
              battleMap[newDraw.gridY+1][newDraw.gridX].renderTile();
           }
           else
           if(battleMap[newDraw.gridY+1][newDraw.gridX].north !== 0){
               newDraw.south = 0;
           }
        }
        newDraw.renderTile();
      }

    /***************************TILE OBJECT*********************** */
    function Tile(newgridY, newgridX){
        this.gridX = newgridX;
        this.gridY = newgridY;
        this.north = 0;
        this.east = 0;
        this.south = 0;
        this.west = 0;
        this.floor = 0;
        this.hidden = true;
        this.element = document.createElement('div');
        this.element.addEventListener('mouseover', function(event){
            //console.log('New Focus');
            focus = this;
        }.bind(this));
        this.element.addEventListener('click', function(event){
            //console.log('Toggle Hidden');
            this.hidden = !this.hidden;
            this.renderTile();
        }.bind(this));
    
    }
    Tile.prototype.updateTile = function(key){
        //console.log('Update Tile');
        switch(key){
            case 'o':
                this.north = 1;
                this.east = 1;
                this.south = 1;
                this.west = 1;
                this.floor = 1;
                setStuff(this);
                (elements.mapView)?this.renderTile():'';
                break;
            case 'e':
                this.north = 0;
                this.east = 0;
                this.south = 0;
                this.west = 0;
                this.floor = 0;
                this.hidden = true;
                (elements.mapView)?this.renderTile():'';
                break;
            case 'c':
                this.north = 0;
                this.east = 0;
                this.south = 0;
                this.west = 0;
                this.floor = 2;
                (elements.mapView)?this.renderTile():'';
                break;
            case 'f':
                this.floor = (this.floor+1)%15;
                (elements.mapView)?this.renderTile():'';
                break;
            case ',':
                this.west = (this.west+1)%5;
                (elements.mapView)?this.renderTile():'';
                break;
            case '6':
                this.north = (this.north+1)%5;
                (elements.mapView)?this.renderTile():'';
                break;
            case '.':
                this.east = (this.east+1)%5;
                (elements.mapView)?this.renderTile():'';
                break;
            case 'v':
                this.south = (this.south+1)%5;
                (elements.mapView)?this.renderTile():'';
                break;
          case 'h':
              this.hidden = true;
              (elements.mapView)?this.renderTile():'';
              break;
          case 'u':
              this.hidden = false;
              (elements.mapView)?this.renderTile():'';
              break;
        }
    };
    Tile.prototype.renderTile = function(){
        //open, closed, pit, water, fire
        //open, wall, walldoor, walldooropen,walldoorpit
    
        //console.log('Rendering Tile');
        var stroke = elements.mapView.getContext('2d');
        var floorColors = ['','rgb(255,255,255)','#606060','#c3c3c3','rgb(81,179,15)','rgb(24,165,211)','rgb(206,56,30)','rgb(220,234,55)','rgb(70,52,237)','rgb(215,51,238)','rgb(56,118,74)','rgb(47,78,128)','rgb(194,169,22)','rgb(159,57,83)','rgb(43,174,154)'];
        //'rgb(81,179,15)','rgb(24,165,211)','rgb(206,56,30)','rgb(220,234,55)','rgb(70,52,237)','rgb(215,51,238)','rgb(56,118,74)','rgb(47,78,128)','rgb(194,169,22)','rgb(159,57,83)','rgb(43,174,154)' 
        var doorwayColors = ['',floorColors[2],'#E78A40',floorColors[this.floor],floorColors[3]];
      
        if(displayHidden || !this.hidden){
            //FLOOR
            stroke.fillStyle = floorColors[this.floor];
            if(this.floor === 0){
                stroke.clearRect(
                    (elements.mapView.width/gridXCount*this.gridX),
                    (elements.mapView.height/gridYCount*this.gridY),
                    (elements.mapView.width/gridXCount),
                    (elements.mapView.height/gridYCount)
                );
            }
            else{
                stroke.fillRect(
                    (elements.mapView.width/gridXCount*this.gridX),
                    (elements.mapView.height/gridYCount*this.gridY),
                    (elements.mapView.width/gridXCount),
                    (elements.mapView.height/gridYCount)
                );
            }
      
            //HIDDEN
            if(this.hidden && this.floor != 0){
                stroke.fillStyle = 'rgb(0,255,0)';
                stroke.fillRect(
                    (elements.mapView.width/gridXCount*this.gridX),
                    (elements.mapView.height/gridYCount*this.gridY),
                    (elements.mapView.width/gridXCount * 0.1),
                    (elements.mapView.height/gridYCount * 0.1)
                );
            }
    
            //NORTH
            stroke.fillStyle = doorwayColors[1];
            if(this.north!==0){
                stroke.fillRect(
                    (elements.mapView.width/gridXCount*this.gridX),
                    (elements.mapView.height/gridYCount*this.gridY),
                    (elements.mapView.width/gridXCount),
                    (elements.mapView.height/gridYCount * 0.1)
                );
            }
    
            stroke.fillStyle = doorwayColors[this.north];
            if(this.north!==0){
                if(this.floor === 0 && this.north === 3)
                {
                    stroke.clearRect(
                        (elements.mapView.width/gridXCount*this.gridX + (elements.mapView.width/gridXCount * 0.2)),
                        (elements.mapView.height/gridYCount*this.gridY),
                        (elements.mapView.width/gridXCount - (elements.mapView.width/gridXCount * 0.5)),
                        (elements.mapView.height/gridYCount * 0.1)
                    );
                }
                else {
                    stroke.fillRect(
                        (elements.mapView.width / gridXCount * this.gridX + (elements.mapView.width / gridXCount * 0.2)),
                        (elements.mapView.height / gridYCount * this.gridY),
                        (elements.mapView.width / gridXCount - (elements.mapView.width / gridXCount * 0.5)),
                        (elements.mapView.height / gridYCount * 0.1)
                    );
                }
            }
    
            //EAST
            stroke.fillStyle = doorwayColors[1];
            if(this.east!==0){
                stroke.fillRect(
                    (elements.mapView.width/gridXCount*this.gridX) + (elements.mapView.width/gridXCount * 0.9),
                    (elements.mapView.height/gridYCount*this.gridY),
                    (elements.mapView.width/gridXCount * 0.1),
                    (elements.mapView.height/gridYCount)
                );
            }
    
            stroke.fillStyle = doorwayColors[this.east];
            if(this.east!==0){
                if(this.floor === 0 && this.east === 3)
                {
                    stroke.clearRect(
                        (elements.mapView.width/gridXCount*this.gridX + (elements.mapView.width/gridXCount * 0.9)),
                        (elements.mapView.height/gridYCount*this.gridY + (elements.mapView.height/gridYCount * 0.3)),
                        (elements.mapView.width/gridXCount * 0.1),
                        (elements.mapView.height/gridYCount - (elements.mapView.height/gridYCount * 0.5))
                    );
                }
                else {
                    stroke.fillRect(
                        (elements.mapView.width/gridXCount*this.gridX + (elements.mapView.width/gridXCount * 0.9)),
                        (elements.mapView.height/gridYCount*this.gridY + (elements.mapView.height/gridYCount * 0.3)),
                        (elements.mapView.width/gridXCount * 0.1),
                        (elements.mapView.height/gridYCount - (elements.mapView.height/gridYCount * 0.5))
                    );
                }
            }
    
            //SOUTH
            stroke.fillStyle = doorwayColors[1];
            if(this.south!==0){
                stroke.fillRect(
                    (elements.mapView.width/gridXCount*this.gridX),
                    (elements.mapView.height/gridYCount*this.gridY + (elements.mapView.height/gridYCount * 0.9)),
                    (elements.mapView.width/gridXCount),
                    (elements.mapView.height/gridYCount * 0.1)
                );
            }
    
            stroke.fillStyle = doorwayColors[this.south];
            if(this.south!==0){
                if(this.floor === 0 && this.south === 3)
                {
                    stroke.clearRect(
                        (elements.mapView.width/gridXCount*this.gridX + (elements.mapView.width/gridXCount * 0.3)),
                        (elements.mapView.height/gridYCount*this.gridY + (elements.mapView.height/gridYCount * 0.9)),
                        (elements.mapView.width/gridXCount - (elements.mapView.width/gridXCount * 0.5)),
                        (elements.mapView.height/gridYCount * 0.1)
                    );
                }
                else {
                    stroke.fillRect(
                        (elements.mapView.width/gridXCount*this.gridX + (elements.mapView.width/gridXCount * 0.3)),
                        (elements.mapView.height/gridYCount*this.gridY + (elements.mapView.height/gridYCount * 0.9)),
                        (elements.mapView.width/gridXCount - (elements.mapView.width/gridXCount * 0.5)),
                        (elements.mapView.height/gridYCount * 0.1)
                    );
                }
            }
    
            //WEST
            stroke.fillStyle = doorwayColors[1];
            if(this.west!==0){
                stroke.fillRect(
                    (elements.mapView.width/gridXCount*this.gridX),
                    (elements.mapView.height/gridYCount*this.gridY),
                    (elements.mapView.width/gridXCount) * 0.1,
                    (elements.mapView.height/gridYCount)
                );
            }
    
            stroke.fillStyle = doorwayColors[this.west];
            if(this.west!==0){
                if(this.floor === 0 && this.west === 3)
                {
                    stroke.clearRect(
                        (elements.mapView.width/gridXCount*this.gridX),
                        (elements.mapView.height/gridYCount*this.gridY  + (elements.mapView.height / gridYCount * 0.3)),
                        (elements.mapView.width/gridXCount  * 0.1),
                        (elements.mapView.height/gridYCount - (elements.mapView.height / gridYCount * 0.5))
                    );
                }
                else {
                    stroke.fillRect(
                        (elements.mapView.width/gridXCount*this.gridX),
                        (elements.mapView.height/gridYCount*this.gridY  + (elements.mapView.height / gridYCount * 0.3)),
                        (elements.mapView.width/gridXCount  * 0.1),
                        (elements.mapView.height/gridYCount - (elements.mapView.height / gridYCount * 0.5))
                    );
                }
            }
        }
        else{
            stroke.clearRect(
                (elements.mapView.width/gridXCount*this.gridX),
                (elements.mapView.height/gridYCount*this.gridY),
                (elements.mapView.width/gridXCount),
                (elements.mapView.height/gridYCount)
            );
        }
    };
    Tile.prototype.printTile = function(){
        var returnText='';
        returnTile = this.north+'-'+
            this.east+'-'+
            this.south+'-'+
            this.west+'-'+
            this.floor+'-'+
            ((this.hidden)?'1':'0');
            console.log(returnTile);
        return returnTile;
    };

});




