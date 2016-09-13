'use strict';
const https                     = require("https");
const json2csv                  = require("json2csv");
const fs                        = require('fs');
var path                        = require('path');

const config                    = require('../config');
const SalesforceAnalytics       = require("./SalesforceAnalytics");

var sfdcanalytics = new SalesforceAnalytics();
sfdcanalytics = new SalesforceAnalytics();
var AnalyticsString = "Append";

module.exports = class FreightFarmsOperations {

    constructor(metadatafile, setoverride){
        if (metadatafile==""){
            metadatafile=path.join(__dirname + '/../Data/FreightFarms_Wave_MetaData2.json');
        }
        if (setoverride!="" && setoverride!=null){
            AnalyticsString=setoverride;
        }
        this.metadatafile=metadatafile;
        this.salesforceanalytics = sfdcanalytics;
    }

    getdata(url, cb) {
        https.get(url, function (response) {
            var body = '';
            response.on('data', function (chunk) {
                body += chunk;
            });
            response.on('end', function () {
                try{
                    var data = JSON.parse(body);
                    var result = json2csv({ data: data["data"]});
                    result = result.replaceAll('T',' ').replaceAll('Z',' ');
                    result = result.replace('"2014","2015","2016","2017","2018","2019","createdAt"','"Airtemp","Humidity","CO2","Water PH","Water EC","Water Temp","createdAt"');
                    cb(result, null);
                }
                catch(err){
                    cb(null, err);
                }
            });
        });
    }

    downloadandprocess(url,cb){
        this.getfiledata(this.metadatafile, function(err, metadata) {
            if (!err) {
                var ffops = new FreightFarmsOperations(AnalyticsString);
                ffops.getdata(url, function (csvdata, err) {
                    if (!err) {
                        sfdcanalytics.insertexternaldata(metadata, "FreightFarms", AnalyticsString, function (err, ret) {
                            if (err || !ret.success) {
                                return console.error(err, ret);
                            }
                            console.log('Created InsightsExternalData: ' + ret.id);
                            sfdcanalytics.insertexternaldatapart(ret.id, new Buffer(csvdata, 'binary').toString('base64'), function (err, datapartret) {
                                if (err || !datapartret.success) {
                                    return console.error(err, datapartret);
                                }
                                sfdcanalytics.processdata(ret.id, function (err, processret) {
                                    if (err || !processret.success) {
                                        return console.error(err, processret);
                                    }
                                    console.log('Updated InsightsExternalData Successfully Marked For Processing: ' + processret.id);
                                    cb(null);
                                })
                            })
                        })
                    }
                    else
                        console.log("Error: " + err.message + " Url: " + url);
                })
            }
        });
    }

    iteratedates(){
        // Overwrite first record
        var first = config.freightfarms.url + "&startDate=2016-8-8&endDate=2016-8-9";
        AnalyticsString = "Overwrite";
        this.downloadandprocess(first, function(err){
            if (!err){
                AnalyticsString = "Append";
                var ffops = new FreightFarmsOperations("", "Append");
                var tempurl = "";
                var startdt='';
                var enddt='';
                var enddate =  new Date();
                var loopdate = new Date('08/10/2016');
                while (enddate.getTime() > loopdate.getTime()){
                    startdt = loopdate.getFullYear().toString() + "-" + (loopdate.getMonth()+1).toString() + "-" + loopdate.getDate().toString();
                    loopdate.setDate(loopdate.getDate() + 1);
                    enddt = loopdate.getFullYear().toString() + "-" + (loopdate.getMonth()+1).toString() + "-" + loopdate.getDate().toString();
                    tempurl = config.freightfarms.url + "&startDate=" + startdt + "&endDate=" + enddt;
                    ffops.downloadandprocess(tempurl, function(err) {
                        if (!err){
                        }
                        else{
                            console.log("Failed: " + err.message);
                        }
                    });
                }
            }
        });
    }

    getfiledata(path,cb){
        fs.readFile(path, "base64", function(err,filedata){
            if (!err){
                cb(err, filedata);
            }
        });
    }
};

String.prototype.replaceAll = function(str1, str2, ignore)
{
    return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g,"\\$&"),(ignore?"gi":"g")),(typeof(str2)=="string")?str2.replace(/\$/g,"$$$$"):str2);
};