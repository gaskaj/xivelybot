'use strict';
const config            = require('../config');
const Salesforce        = require('./salesforce');
const util              = require('util');

module.exports = class SalesforceAnalytics {

    constructor(){
        this.Salesforce = new Salesforce();
        this.conn = this.Salesforce.connect();
    }

    // This is a sample to be used during testing only
    processwavedata(metadata, sampledata, cb){
        this.conn.query("SELECT Id,Format,EdgemartAlias,MetadataJson,Operation,Action,CreatedById,CreatedDate FROM InsightsExternalData where EdgemartAlias='Sample_Import'")
            .then(function(res) {
                return this.conn.sobject('InsightsExternalData')
                    .create({EdgemartAlias: 'Sample_Import', Action: 'None', Operation: 'Overwrite', Format: 'Csv'},
                        function (err, externaldatares) {
                            if (err || !externaldatares.success) {
                                return console.error(err, externaldatares);
                            }
                            else {
                                console.log("InsightsExternalData id : " + externaldatares.id);
                                var bytesampledata = new Buffer(sampledata, 'utf8');
                                return this.conn.sobject('InsightsExternalDataPart')
                                    .create({DataFile: sampledata, InsightsExternalDataId: externaldatares.id, PartNumber: 1},
                                        function (err, ret) {
                                            if (err || !ret.success) {
                                                return console.error(err, ret);
                                            }
                                            else {
                                                console.log("InsightsExternalDataPart id : " + ret.id + " InsightsExternalData: " + externaldatares.id);
                                                this.conn.sobject("InsightsExternalData").update({
                                                    Id : externaldatares.id,
                                                    Action : 'Process'
                                                }, function(err, ret) {
                                                    if (err || !ret.success) { return console.error(err, ret); }
                                                    console.log('Updated InsightsExternalData Successfully Marked For Processing: ' + ret.id);
                                                });
                                            }
                                        });
                            }
                        })
            })
            .then(function(ret) {
                // handle final result of API execution
                // ...
                // console.log('Handle Final Update' : );
                // console.log(ret);
            }, function(err) {
                // catch any errors in execution
                // ...
                //console.log(err);
            });
        console.log("XivelyDeviceBot.processwavedata: end");
    }

    deletewavedata(){
        this.conn.query("SELECT Id FROM InsightsExternalData where EdgemartAlias='Sample_Import'")
            .then(function(res) {
                console.log("Deleting Records " + res.length);
                this.conn.delete(res, function(err) {
                    // catch any errors in execution
                    // ...
                    console.log(err);
                });
                console.log("After Delete");
            });
    }

    displayallwavedata(){
        this.conn.query("SELECT Id,Format,EdgemartAlias,MetadataJson,Operation,Action,CreatedById,CreatedDate FROM InsightsExternalData")
            .then(function(res) {
                console.log(res);
            });
    }

    displaywavedata(Id){
        this.conn.query("SELECT Id,Format,EdgemartAlias,MetadataJson,Operation,Action,CreatedById,CreatedDate FROM InsightsExternalData where Id='" + Id + "'")
            .then(function(res) {
                console.log(res);
            });
    }

    updatetoprocess(id){
        this.conn.sobject("InsightsExternalData").update({
            Id : id,
            Action : 'Process'
        }, function(err, ret) {
            if (err || !ret.success) { return console.error(err, ret); }
            console.log('Updated InsightsExternalData Successfully Marked For Processing: ' + ret.id);
        });
    }

    insertexternaldata(metadatajson, EdgemartAlias, AnalyticsOperation, cb){
        console.log (EdgemartAlias + " : " + AnalyticsOperation);
        this.conn.sobject('InsightsExternalData').create({
            Format: 'Csv',
            EdgemartAlias: EdgemartAlias,
            MetadataJson: metadatajson,
            Operation: AnalyticsOperation,
            Action: 'None'
        }, function(err, ret) {
            cb(err, ret);
        })
    }

    insertexternaldatapart(externaldataid, csvdata, cb){
        this.conn.sobject('InsightsExternalDataPart').create({
            DataFile: csvdata,
            InsightsExternalDataId: externaldataid,
            PartNumber: 1
        }, function(err, ret) {
            cb(err,ret);
        })
    }

    processdata(id,cb){
        this.conn.sobject("InsightsExternalData").update({
            Id : id,
            Action : 'Process'
        }, function(err, ret) {
            if (err || !ret.success) { return console.error(err, ret); }
            cb(err,ret);
        });
    }
};