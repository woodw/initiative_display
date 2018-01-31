'use strict';

const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));

app.set('port', (process.env.PORT || 9001));

/* ROUTES */
app.get('/',function(req,res){
	res.send('We are up and running');
});
/** END ROUTES **/

app.listen(app.get('port'), function(){
	console.log('Node is listening on port', app.get('port'));
});