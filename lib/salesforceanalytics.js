'use strict';
const config            = require('../config');
const Salesforce        = require('./salesforce');
const util              = require('util');

module.exports = class SalesforceAnalytics {

    constructor(){
        this.Salesforce = new Salesforce();
        this.conn = this.Salesforce.connect();
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
        try{
            this.conn.sobject("InsightsExternalData").update({
                Id : id,
                Action : 'Process'
            }, function(err, ret) {
                if (err || !ret.success) {
                    return console.error(err, ret);
                }
                cb(err,ret);
            });
        }catch(err){
            // Try it twice avoid locking issues
            console.log("Trying processdata again -> " + err.body);
            this.processdata(id,cb);
        }

    }
};