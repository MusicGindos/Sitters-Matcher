/**
 * Created by Arel on 14/02/2017.
 */
'use strict';

var express		  = require('express'),
    fs			  = require('fs'),
    DEBUG         = true,
    localJSONPath = "data/data.json",
    jsonfile      = require('jsonfile'),
    googleDistance= require('google-distance'),
    finish        = true,
    maindata      = null,
    data          = null,
    origin        = null,
    destination   = null,
    distance      = null,
    score         = null,
    generalScore  = 0,
    locationScore = null,
    experienceScore  = null,
    educationScore  = null,
    hobbiesScore  = null,
    knowledgeScore  = null,
    bonusScore = 5;




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
    googleDistance.apiKey = "AIzaSyBwP7ZYyCO86H41nE-E5eHYPCDir9yBpc0";
    googleDistance.get(
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

var computeDistance = function(origin,destination) {
    computeSync(origin,destination, function(result){

        maindata = result;
    });
    while(finish) {
        require('deasync').sleep(100); // sync for google-distance api
    }
    finish = true;
    return maindata;
};

var syncFunc = function(parent,sitter,filter,distance) {
    computeScore(parent,sitter,filter,distance, function(result){
        maindata = result;
    });
    while(finish) {
        require('deasync').sleep(100);
    }
    finish = true;
    return maindata;
};

var computeScore = function(parent,sitter,filter,distance,callback){
    //TODO: take care of filter
    if(parent.children.age < sitter.minAge || parent.children.age > sitter.maxAge || sitter.hourFee > parent.maxPrice)
        return 0;
    distance = distance.distance.split(' ');
    distance = Number(distance[0]);
    if(distance <= 5)   // calculate location score, for each added 1 km more than 5, reduce 2
        locationScore = 100;
    else{
        locationScore = 100 - ((distance-5) * 2);
    }

    if(sitter.experience >= 4)  // calculate experience by years
        experienceScore = 100;
    else if(sitter.experience >=3)
        experienceScore = 90;
    else if(sitter.experience >=2)
        experienceScore = 70;
    else if(sitter.experience >=1)
        experienceScore = 60;
    else if(sitter.experience >=0)
        experienceScore = 50;
    else
        experienceScore = 0;


    //TODO: implement hobbies and expertise
    if(filter == null){
        //generalScore = (locationScore + experienceScore + educationScore + hobbiesScore + knowledgeScore)/5;
        generalScore = (locationScore + experienceScore)/2;
    }
    else{
        //TODO: implement filter score
    }
    if(sitter.availableNow)
        generalScore += bonusScore;
    if(sitter.mobility)
        generalScore += bonusScore;
    if(sitter.education.includes('college'))
        generalScore += bonusScore;
    if(sitter.education.includes('highSchool'))
        generalScore += bonusScore;

    if(generalScore > 100)
        generalScore = 100;
    maindata = data;
    finish = false;
    callback(generalScore);


};

exports.getMatchScore = function(){
    data = jsonfile.readFileSync(localJSONPath);
    origin = data.parent.address.street + ' ' + data.parent.address.houseNumber + ' ' + data.parent.address.city;
    destination = data.sitter.address.street + ' ' + data.sitter.address.houseNumber + ' ' + data.sitter.address.city;
    distance = computeDistance(origin,destination);
    score = syncFunc(data.parent,data.sitter,null,distance);
    if(score == 0){
        //TODO: return no match
    }
    return score;

};






