/**
 * Created by Arel on 14/02/2017.
 */
'use strict';
var express		= require('express'),
    matcher 	= require('./matcher'),
    cors 		= require('cors'),
    bodyParser 	= require('body-parser'),
    port 		= process.env.PORT || 3000,
    app 		= express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, content-type, Accept');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader("Content-Type", "text/html");
    app.set('json spaces', 4);
    res.setHeader("Content-Type", "application/json");
    next();
});

app.get('/getMatchScore', function (req, res) {
    var data = matcher.getMatchScore();
    res.status(200).json(data);
});



app.get('*', function(req,res,next){
    var err = new Error();
    err.status = 404;
    next(err);
});

app.use(function(req,res,err){
    if(err.status == 404){
        return res.status(404).end(err.message);
    }
    else if(err.status == 500){
        return res.status(500).end(err.message);
    }
});

app.listen(port, function(){
    console.log('listening on port '+port);
});