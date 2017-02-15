/**
 * Created by Arel on 14/02/2017.
 */
'use strict';

var express		  = require('express'),
    fs			  = require('fs'),
    DEBUG         = true,
    localJSONPath = "data/data.json",
    jsonfile      = require('jsonfile'),
    distance      = require('google-distance'),
    Sync          = require('sync'),
    finish        = true,
    maindata      = null;
var error = function(next, msg, status){
    var err = new Error();
    err.status = status;
    err.message = msg;
    //next(err);
};

var localJson = function(path){
    var obj;
    fs.readFile(path, function(err, json){
        if (err) {
            console.log(err.message);
            //error(next, err.message, 500);
        }
        else{
            obj =  JSON.parse(json);
            return obj;
        }

    });

};

var computeSync = function(origin,destination,callback){
    distance.get(
        {
            origin: origin,
            destination: destination
        },
        function(err, data) {
            if (err) {
                console.error(err);
                return;
            }
            maindata = data;
            finish = false;
            callback(data);
        });
};
function computeDistance(origin,destination) {
    computeSync(origin,destination, function(result){
        maindata = result;
    });
    while(finish) {
        require('deasync').sleep(100); // sync for google-distance api
    }
    return maindata;
}

exports.getMatchScore = function(req,res,next,callback){
    var data = jsonfile.readFileSync(localJSONPath);
    var origin = data.parent.address.street + ' ' + data.parent.address.houseNumber + ' ' + data.parent.address.city;
    var destination = data.sitter.address.street + ' ' + data.sitter.address.houseNumber + ' ' + data.sitter.address.city;

    var distance = computeDistance(origin,destination);


    return distance;

};






