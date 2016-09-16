'use strict';
const config            = require('./config');
var path                = require('path');

var FreightFarmsOperations = require('./lib/freightfarmsoperations');
var metafile = path.join(__dirname + '/Data/FreightFarms_Wave_MetaData2.json');
var siteid = '7227efa5-3bd2-442e-8b9b-385bc256ea09';
var url = 'https://spwubihwxj.execute-api.us-east-1.amazonaws.com/dev/sensors?installationId=7227efa5-3bd2-442e-8b9b-385bc256ea09&beforeDate=2016-09-01T15:57:45.302Z&registers=2014,2015,2016,2017,2018,2019';


var ffops = new FreightFarmsOperations(metafile);
ffops.iteratedates(siteid);

// console.log(ffops.gaussianRand());

/*
ffops.AnalyticsString = "Overwrite";
ffops.downloadandprocess(url, function(ret,err){
   console.log (ret);
});
*/

/*
ffops.getdata(url,siteid,function(ret,err){
    console.log("Returned Data: " + ffops.randomizedata(ret));
});
*/





