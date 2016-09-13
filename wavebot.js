'use strict';
const config            = require('./config');
const jsforce           = require('jsforce');

var BusinessOperations = require('./lib/xivelyoperations');
var FreightFarmsOperations = require('./lib/freightfarmsoperations');
var SalesforceAnalytics = require('./lib/salesforceanalytics');

/*
var busops = new BusinessOperations();
busops.connect();
*/

var fs = require('fs');
var path = require('path');

var request = require("request");
var json2csv = require("json2csv");
var https = require("https");

// busops.displayallwavedata();

var metafile = path.join(__dirname + '/Data/FreightFarms_Wave_MetaData2.json');
var datafile = path.join(__dirname + '/Data/FreightFarms_Wave_Data.csv');

// var url="https://spwubihwxj.execute-api.us-east-1.amazonaws.com/dev/sensors?installationId=7227efa5-3bd2-442e-8b9b-385bc256ea09&startDate=2016-07-01&endDate=2016-09-06&registers=2014,2015,2016,2017,2018,2019";
// var url="https://spwubihwxj.execute-api.us-east-1.amazonaws.com/dev/sensors?installationId=7227efa5-3bd2-442e-8b9b-385bc256ea09&endDate=2016-09-06T15:57:45.302Z&registers=2014,2015,2016,2017,2018,2019&startDate=2016-09-01T15:48:45.591Z";
// var url = "https://spwubihwxj.execute-api.us-east-1.amazonaws.com/dev/sensors?installationId=7227efa5-3bd2-442e-8b9b-385bc256ea09&endDate=2016-09-01T15:57:45.302Z&registers=2014,2015,2016,2017,2018,2019&startDate=2016-09-01T15:48:45.591Z";

//getdata(url, function(Data){
//    console.log(Data);
//});
/*
var metafile = path.join(__dirname + '/Data/Wave_MetaData.json');
var datafile = path.join(__dirname + '/Data/Wave_Data.csv');
*/

// processdata(metafile, datafile);
// freightfarms();

// downloadandprocess(metafile, url);

var ffops = new FreightFarmsOperations(metafile);
ffops.iteratedates();

// var SalesforceAnalytics = new SalesforceAnalytics();
// SalesforceAnalytics.displayallwavedata();



function getdata(url, cb) {
    https.get(url, function (response) {
        var body = '';
        response.on('data', function (chunk) {
            body += chunk;
        });
        response.on('end', function () {
            var data = JSON.parse(body);
            var result = json2csv({ data: data["data"]});
            result = result.replaceAll('T',' ').replaceAll('Z',' ');
            result = result.replace('"2014","2015","2016","2017","2018","2019","createdAt"','"Airtemp","Humidity","CO2","Water PH","Water EC","Water Temp","createdAt"');
            // console.log(result);
            cb(result);
        });
    });
}



