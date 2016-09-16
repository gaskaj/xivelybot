'use strict';
const https                     = require("https");
var urlparse                    = require('url');
const json2csv                  = require("json2csv");
const fs                        = require('fs');
var path                        = require('path');

const config                    = require('../config');
const SalesforceAnalytics       = require("./SalesforceAnalytics");

var sfdcanalytics = new SalesforceAnalytics();
sfdcanalytics = new SalesforceAnalytics();
var AnalyticsString = "Append";
var GenerateRandomData = true;
var RandomDataSet = 10;
var RandomArray = [];

module.exports = class FreightFarmsOperations {

    constructor(metadatafile, setoverride, randomdatasetarray){
        if (metadatafile==""){
            metadatafile=path.join(__dirname + '/../Data/FreightFarms_Wave_MetaData2.json');
        }
        if (setoverride!="" && setoverride!=null){
            AnalyticsString=setoverride;
        }
        this.metadatafile=metadatafile;
        this.salesforceanalytics = sfdcanalytics;
        if (randomdatasetarray!=null){
            RandomArray = randomdatasetarray;
            GenerateRandomData=true;
        }else if (GenerateRandomData && randomdatasetarray == null){
            for(var i = 0; i < RandomDataSet; i++) {
                RandomArray.push(this.randomsiteID());
                console.log("Random SiteId: " + RandomArray[i] + " Length: " + RandomArray.length);
            }
        }
    }

    getdata(url, siteid, cb) {
        https.get(url, function (response) {
            var body = '';
            response.on('data', function (chunk) {
                body += chunk;
            });
            response.on('end', function () {
                try{
                    var queryData = urlparse.parse(url, true).query;
                    if (queryData.installationId && siteid == null) {
                        siteid = queryData.installationId;
                    }
                    var data = JSON.parse(body);
                    var result = json2csv({ data: data["data"]});
                    result = result.replaceAll('T',' ').replaceAll('Z',' ');
                    result = result.replace('"2014","2015","2016","2017","2018","2019","createdAt"','"Airtemp","Humidity","CO2","Water PH","Water EC","Water Temp","createdAt","InstallationID"');
                    result = result.replaceAll(' "\n','","' + siteid + '"\n');
                    result = result + ',"' + siteid + '"';
                    cb(result, null);
                }
                catch(err){
                    cb(null, err);
                }
            });
        });
    }

    randomsiteID() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
    }

    downloadandprocess(url, siteid, cb){
        this.getfiledata(this.metadatafile, function(err, metadata) {
            if (!err) {
                var ffops = new FreightFarmsOperations("", AnalyticsString, RandomArray);
                ffops.getdata(url, siteid, function (csvdata, err) {
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
                                    else if (GenerateRandomData && RandomDataSet > 0) {
                                        ffops.randomizedataset(siteid, metadata, csvdata, function (err){
                                        });
                                    }
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

    iteratedates(siteid){
        // Overwrite first record
        var first = config.freightfarms.url + "&startDate=2016-8-8&endDate=2016-8-9&installationId=" + siteid;
        AnalyticsString = "Overwrite";
        this.downloadandprocess(first, siteid, function(err){
            if (!err){
                AnalyticsString = "Append";
                var ffops = new FreightFarmsOperations("", AnalyticsString, RandomArray);
                var tempurl = "";
                var startdt='';
                var loopcounter = 0;
                var enddt='';
                var enddate =  new Date();
                var loopdate = new Date('08/10/2016');
                while (enddate.getTime() > loopdate.getTime()){
                    startdt = loopdate.getFullYear().toString() + "-" + (loopdate.getMonth()+1).toString() + "-" + loopdate.getDate().toString();
                    loopdate.setDate(loopdate.getDate() + 1);
                    enddt = loopdate.getFullYear().toString() + "-" + (loopdate.getMonth()+1).toString() + "-" + loopdate.getDate().toString();
                    tempurl = config.freightfarms.url + "&startDate=" + startdt + "&endDate=" + enddt + "&installationId=" + siteid;
                    ffops.downloadandprocess(tempurl, siteid, function(err) {
                        if (!err){
                            console.log('Success Processing-: ' + startdt + ' To ' + enddt);
                        } else {
                            console.log('Failed Processing--: ' + startdt + ' To ' + enddt + '\n' + err.message);
                        }
                    });
                    loopcounter++;
                }
            }
        });
    }

    processrandomdata(siteid, metadata, randomdataset, cb){
        var randomizeddata = this.randomizedata(randomdataset);
        sfdcanalytics.insertexternaldata(metadata, "FreightFarms", "Append", function (err, ret) {
            sfdcanalytics.insertexternaldatapart(ret.id, new Buffer(randomizeddata, 'binary').toString('base64'), function (err, datapartret) {
                sfdcanalytics.processdata(ret.id, function (err, processret) {
                    cb(null, ret.id);
                });
            });
        });
    }

    randomizedataset(siteid, metadata, csvdata, cb){
        if (RandomDataSet > 0) {
            var newdataset = '';
            var newsiteid = "";
            if (RandomArray != null && csvdata != null && metadata != null) {
                for (var i = 0; i < RandomArray.length; i++) {
                    if (RandomArray[i]!=null && siteid!=null) {
                        newsiteid = RandomArray[i];
                        newdataset = csvdata.replaceAll(siteid, newsiteid);
                        this.processrandomdata(newsiteid,metadata,newdataset,function (err, returnid){
                            console.log('Processed Random Data : ' + returnid);
                        });
                    }
                }
            }
        }
    }

    randomizerow(row){
        var columns = row.toString().split(",");
        var newrowdata = "";
        var newint=0;
        for (var i = 0; i < columns.length; i++){
            if(!isNaN(Number(columns[i]))) {
                newint = parseInt(columns[i] * this.gaussianRand(),10);
                newrowdata += newint.toString();
            } else{
                newrowdata += columns[i];
            }
            if (i < columns.length-1){
                newrowdata += ",";
            }
        }
        return newrowdata;
    }

    randomizedata(csvdata){
        if (csvdata != null){
            var newrow = "";
            var rows = csvdata.toString().split("\n");
            var newstring = "";
            for (var i=0; i <= rows.length; i++){
                if (i!=0 && rows[i]!=null){
                    newstring += this.randomizerow(rows[i]) + '\n';
                }else if (rows[i]!=null){
                    newstring+= rows[i] + '\n';
                }
            }
            return newstring;
        }
        else
            return csvdata;
    }

    getfiledata(path,cb){
        fs.readFile(path, "base64", function(err,filedata){
            if (!err){
                cb(err, filedata);
            }
        });
    }

    gaussianRand() {
        var rand = 0;
        for (var i = 0; i < 6; i += 1) {
            rand += Math.random();
        }
        return rand / 3;
    }
};

String.prototype.replaceAll = function(str1, str2, ignore)
{
    return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g,"\\$&"),(ignore?"gi":"g")),(typeof(str2)=="string")?str2.replace(/\$/g,"$$$$"):str2);
};
