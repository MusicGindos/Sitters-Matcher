/**
 * Created by Arel on 14/02/2017.
 */
'use strict';

var express		    = require('express'),
    fs			    = require('fs'),
    _               = require('lodash'),
    DEBUG           = true,
    localJSONPath   = "data/data.json",
    jsonfile        = require('jsonfile'),
    googleDistance  = require('google-distance'),
    finish          = true,
    maindata        = null,
    data            = null,
    origin          = null,
    destination     = null,
    distance        = null,
    score           = null,
    generalScore    = 0,
    locationScore   = null,
    experienceScore = null,
    hobbiesScore    = null,
    knowledgeScore  = null,
    result          = null,
    bonusScore      = 5;


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
    if(parent.children.specialNeeds.length != 0){
        for (var i = 0, len = parent.children.specialNeeds.length; i < len; i++) {
            if (_.indexOf(sitter.specialNeeds, parent.children.specialNeeds[i]) == -1)
                return 0;  // sitter don't have the speicalNeed that the child need and the match score is 0
        }
    }
    distance = distance.distance.split(' ');
    distance = Number(distance[0]);
    if(distance <= 5)   // calculate location score, for each added 1 km more than 5, reduce 2
        locationScore = 100;
    else{
        locationScore = 100 - ((distance-5) * 2);
    }
    if(locationScore < 0)  // if the sitter is more than 50 kilometer from thr child address
        locationScore = 0;

    if(sitter.experience >= 4)  // calculate experience by years
        experienceScore = 100;
    else if(sitter.experience >= 3)
        experienceScore = 90;
    else if(sitter.experience >= 2)
        experienceScore = 70;
    else if(sitter.experience >= 1)
        experienceScore = 60;
    else if(sitter.experience >= 0)
        experienceScore = 50;
    else
        experienceScore = 0;

    if(parent.children.hobbies.length > 0){
        _.forEach(parent.children.hobbies, function(hobbie) {
            if(_.indexOf(sitter.hobbies,hobbie) > -1){ // check if sitter have the hobbies
                hobbiesScore +=  (100 / parent.children.hobbies.length);
            }
        });
    }
    else{
        hobbiesScore = -1;
    }

    if(parent.children.expertise.length > 0){
        _.forEach(parent.children.expertise, function(exp) {
            if(_.indexOf(sitter.expertise,exp) > -1){ // check if sitter have the expertise
                knowledgeScore +=  (100 / parent.children.expertise.length);
            }
        });
    }
    else{
        knowledgeScore = -1;
    }


    if(filter == null){
        var divide = 2;
        var score = locationScore + experienceScore;
        if(knowledgeScore >= 0 ){
            divide++;
            score += knowledgeScore;
        }
        if(hobbiesScore >= 0){
            divide++;
            score += hobbiesScore;
        }
        generalScore = score/divide;
    }
    else{  // if user want to give priority to category
        //TODO: implement filter score
    }

    if(sitter.availableNow)
        generalScore += bonusScore;
    if(sitter.mobility)
        generalScore += bonusScore;
    if(_.indexOf(sitter.education,'college'))
        generalScore += bonusScore;
    if(_.indexOf(sitter.education,'highSchool'))
        generalScore += bonusScore;

    if(generalScore > 100) // more than 100% match with the bonuses
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
        return {"match_score":0};
    }
    else{
        return {"match_score":Math.ceil(score)};
    }
};
