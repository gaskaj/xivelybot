'use strict';
const config            = require('../config');
const jsforce           = require('jsforce');

module.exports = class XivelyDeviceBot {
    constructor(){
        this.globalconn=null;
        this.isconnected=false;
        this.connect();
    }
    connect(){
        var conn = this.globalconn;
        if (conn != null) return conn;
        conn = new jsforce.Connection({});
        if (config.salesforce.url!=null){conn.instanceUrl = config.salesforce.url};
        conn.login(config.salesforce.user, config.salesforce.password + config.salesforce.token, function (err, res) {
            if (err) {
                return console.error(err);
            } else {
                console.log("XivelyDeviceBot.connect: Logged into SFDC");
            }
        });
        this.globalconn = conn;
        return conn;
    }
    getobjectcount(sfobjectname,cb){
        console.log("XivelyDeviceBot.getobjectcount: start");
        var conn = this.connect();
        var query;
        query = conn.query("SELECT COUNT(Id) FROM " + sfobjectname)
            .on("record", function (record) {
                cb(null, record.expr0);
            });
        console.log("XivelyDeviceBot.getobjectcount: end");
    }
    getmaxcreateddate(sfobjectname,cb){
        console.log("XivelyDeviceBot.getmaxcreateddate: start");
        var conn = this.connect();
        var query;
        query = conn.query("SELECT MAX(createddate) FROM " + sfobjectname)
            .on("record", function (record) {
                cb(null, record.expr0);
            });
        console.log("XivelyDeviceBot.getmaxcreateddate: end");
    }
    getcountcreatedbyliteral(sfobjectname, duration ,cb){
        console.log("XivelyDeviceBot.getcountcreatedthisweek: start");
        var conn = this.connect();
        var query;
        query = conn.query("SELECT Count(Id) FROM " + sfobjectname + " WHERE CreatedDate = " + duration)
            .on("record", function (record) {
                cb(null, record.expr0);
            });
        console.log("XivelyDeviceBot.getcountcreatedthisweek: end");
    }
};