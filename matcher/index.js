/**
 * Created by Arel on 14/02/2017.
 */
'use strict';

var express		  = require('express'),
    fs			  = require('fs'),
    DEBUG         = true,
    localJSONPath = "/data/data.json'";

var error = function(next, msg, status){
    var err = new Error();
    err.status = status;
    err.message = msg;
    next(err);
};

var localJson = function(req, res, next, path){
    fs.readFile(path, function(err, json){
        if (err) {
            error(next, err.message, 500);
        }
        res.json(JSON.parse(json));
    });
};

var getMatchScore = function(){
    return "hello world";
};






