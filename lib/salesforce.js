'use strict';
const jsforce           = require('jsforce');
const config            = require('../config');

module.exports = class Salesforce {

    constructor(){
        this.connection=null;
        this.isconnected=false;
        this.connection = this.connect();
    }

    connect(){
        if (this.connection != null) return this.connection;
        this.connection = new jsforce.Connection({});
        if (config.salesforce.url!=null){this.connection.instanceUrl = config.salesforce.url};
        this.connection.login(config.salesforce.user, config.salesforce.password + config.salesforce.token, function (err, res) {
            if (err) {
                return console.error(err);
            } else {
                console.log("XivelyDeviceBot.connect: Logged into SFDC");
            }
        });
        this.isconnected = true;
        return this.connection;
    }

    getobjectcount(sfobjectname,cb){
        console.log("XivelyDeviceBot.getobjectcount: start");
        var query;
        query = this.connection.query("SELECT COUNT(Id) FROM " + sfobjectname)
            .on("record", function (record) {
                cb(null, record.expr0);
            });
        console.log("XivelyDeviceBot.getobjectcount: end");
    }

    getmaxcreateddate(sfobjectname,cb){
        console.log("XivelyDeviceBot.getmaxcreateddate: start");
        var query;
        query = this.connection.query("SELECT MAX(createddate) FROM " + sfobjectname)
            .on("record", function (record) {
                cb(null, record.expr0);
            });
        console.log("XivelyDeviceBot.getmaxcreateddate: end");
    }

    getcountcreatedbyliteral(sfobjectname, duration ,cb){
        console.log("XivelyDeviceBot.getcountcreatedthisweek: start");
        var query;
        query = this.connection.query("SELECT Count(Id) FROM " + sfobjectname + " WHERE CreatedDate = " + duration)
            .on("record", function (record) {
                cb(null, record.expr0);
            });
        console.log("XivelyDeviceBot.getcountcreatedthisweek: end");
    }
};