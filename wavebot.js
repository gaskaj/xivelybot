'use strict';
const config            = require('./config');
var path                = require('path');

var FreightFarmsOperations = require('./lib/freightfarmsoperations');
var ffops = new FreightFarmsOperations(metafile);

var metafile = path.join(__dirname + '/Data/FreightFarms_Wave_MetaData2.json');

// Sample Start Date
var siteid = '7227efa5-3bd2-442e-8b9b-385bc256ea09';
var url = config.freightfarms.url + "&startDate=2016-8-8&endDate=2016-8-9&installationId=" + siteid;



// Process all Data
ffops.iteratedates(siteid);

/*
 // Sample Downloaded Data
ffops.AnalyticsString = "Overwrite";
ffops.downloadandprocess(url, function(ret,err){
   console.log (ret);
});
*/

/*
// Sample Randomized Data
ffops.getdata(url,siteid,function(ret,err){
    console.log("Returned Data: " + ffops.randomizedata(ret));
});
*/





