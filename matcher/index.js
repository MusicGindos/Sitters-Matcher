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

var computeDistance = function(query,callback){
    distance.get(
        {
            origin: 'San Francisco, CA',
            destination: 'San Diego, CA'
        },
        function(err, data) {
            if (err) {
                console.error(err);
                return;
            }
            console.log('done');
            maindata = data;
            finish = false;
            callback(data)

            //your custom logic...
        });
};


exports.getMatchScore = function(req,res,next,callback){
    var data = jsonfile.readFileSync(localJSONPath);
    var dd;
    var asyncToSync = syncFunc();

    function syncFunc() {
        computeDistance("hello", function(result){
            dd = result;
        });
        while(finish) {
            require('deasync').sleep(100);
        }
        console.log('111');
        return dd;
    }
    return asyncToSync;

};






