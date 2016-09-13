'use strict';

var Botkit              = require('botkit');
var TwilioSMSBot        = require('botkit-sms');
var express             = require('express');
var os                  = require('os');

const config            = require('../../config');

var Salesforce  = require('../../lib/salesforce');

var app;
var controller;
var bot;
var smscontroller;
var smsbot;

module.exports = class XivelyDeviceBot {

    constructor(){
        app     = express();
        Salesforce = new Salesforce();
        Salesforce.connect();
        this.initialize();
    }

    initialize(){
        this.buildbots();
        this.setupevents();
        this.setupwebserver();
    }

    buildbots(){
        controller = Botkit.twilioipmbot({
            debug: false,
        });
        bot = controller.spawn({
            TWILIO_IPM_SERVICE_SID: config.bot.twilio.ipmessaging.ipm_service_sid,
            TWILIO_ACCOUNT_SID: config.bot.twilio.account_sid,
            TWILIO_API_KEY: config.bot.twilio.api_key,
            TWILIO_API_SECRET: config.bot.twilio.api_secret,
            identity: 'Sales Assistant',
            autojoin: true
        });

        smscontroller = TwilioSMSBot({
            account_sid: config.bot.twilio.account_sid,
            auth_token: config.bot.twilio.auth_token,
            twilio_number: config.bot.twilio.sms.phone_number
        });
        smsbot = smscontroller.spawn({});
    }

    setupevents(){
        this.setupchannelevents();
        this.setupconversations();
        this.setupsfdcevents();
        this.setuphelp();
        this.setupsystemevents();
    }

    setupwebserver(){
        app.set('port', (process.env.PORT || 5000));
        controller.setupWebserver(app.get('port'), function(err, server) {
            server.get('/', function(req, res) {
                res.send(':)');
            });

            controller.createWebhookEndpoints(server, bot, function () {
                console.log('Twilio IP Bot is online!')
            });
            smscontroller.createWebhookEndpoints(server, smsbot, function () {
                console.log('Twilio SMS Bot is online!')
            })
        });
    }

    SetBotCall(msgs, transactiontype, functionname){
        smscontroller.hears(msgs, transactiontype, functionname);
        controller.hears(msgs, transactiontype, functionname);
    }

    setupchannelevents(){
        controller.on('bot_channel_join', function(bot, message) {
            bot.reply(message, 'Here I am!');
        });

        controller.on('user_channel_join', function(bot,message) {
            bot.reply(message, 'Welcome, ' + message.user + '!');
        });

        controller.on('user_channel_leave', function(bot,message) {
            bot.reply(message, 'Bye, ' + message.user + '!');
        });
    }

    setupsystemevents(){

    }

    setupconversations(){
        var sayhello = function(bot, message) {
            controller.storage.users.get(message.user, function(err, user) {
                if (user && user.name) {
                    bot.reply(message, 'Hello ' + user.name + '!!');
                } else {
                    bot.reply(message, 'Hello.');
                }
            });
        };
        this.SetBotCall(['hello', 'hi'], 'message_received', sayhello);

        var whatismyname = function(bot, message) {
            controller.storage.users.get(message.user, function(err, user) {
                if (user && user.name) {
                    bot.reply(message, 'Your name is ' + user.name);
                } else {
                    bot.reply(message, 'I don\'t know yet!');
                }
            });
        };
        this.SetBotCall(['what is my name', 'who am i'], 'message_received', whatismyname);
    }

    setupsfdcevents(){

        var getlatestdate = function(bot, message){
            Salesforce.getmaxcreateddate(message.text.toString().split("@")[1], function(err,res){
                bot.reply(message,'Most Recent ' + message.text.toString().split("@")[1] + ' Created: ' + res);
            });
        };
        this.SetBotCall(['@'],'message_received', getlatestdate);

        var getbyliteralyear = function(bot, message){
            Salesforce.getcountcreatedbyliteral(message.text.toString().split("Y#")[1], "THIS_YEAR", function(err,res){
                bot.reply(message, message.text.toString().split("Y#")[1] + '\'s Created This Year: ' + res);
            });
        };
        this.SetBotCall(['Y#'],'message_received', getbyliteralyear);

        var getbyliteralweek = function(bot, message){
            Salesforce.getcountcreatedbyliteral(message.text.toString().split("Q#")[1], "THIS_QUARTER", function(err,res){
                bot.reply(message, message.text.toString().split("Q#")[1] + '\'s Created This Quarter: ' + res);
            });
        };
        this.SetBotCall(['Q#'],'message_received', getbyliteralweek);


        var getbyliteralweek = function(bot, message){
            Salesforce.getcountcreatedbyliteral(message.text.toString().split("M#")[1], "THIS_MONTH", function(err,res){
                bot.reply(message, message.text.toString().split("M#")[1] + '\'s Created This Month: ' + res);
            });
        };
        this.SetBotCall(['M#'],'message_received', getbyliteralweek);

        var getbyliteralweek = function(bot, message){
            Salesforce.getcountcreatedbyliteral(message.text.toString().split("W#")[1], "THIS_WEEK", function(err,res){
                bot.reply(message, message.text.toString().split("W#")[1] + '\'s Created This Week: ' + res);
            });
        };
        this.SetBotCall(['W#'],'message_received', getbyliteralweek);

        var getobjectcount = function(bot, message){
            Salesforce.getobjectcount(message.text.toString().split("#")[1], function(err,res){
                bot.reply(message,'Total ' + message.text.toString().split("#")[1] + ': ' + res);
            });
        };
        this.SetBotCall(['#'],'message_received', getobjectcount);
    }

    setuphelp(){
        var helpme = function(bot, message) {
            bot.startConversation(message,function(err, convo) {
                convo.ask('Would you like help with Sales?',[
                    {
                        pattern: bot.utterances.yes,
                        callback: function(response, convo) {
                            convo.say('Operations Assistance?');
                            convo.next();
                        }
                    },
                    {
                        pattern: bot.utterances.no,
                        default: true,
                        callback: function(response, convo) {
                            convo.say('Please tell me what I can help you with?');
                            convo.next();
                        }
                    }
                ]);
            });
        };
        this.SetBotCall(['help', '?', 'helpme', 'help me'],'message_received',helpme);

        var callme = function(bot, message) {
            var matches = message.text.match(/call me (.*)/i);
            var name = matches[1];
            controller.storage.users.get(message.user, function (err, user) {
                if (!user) {
                    user = {
                        id: message.user,
                    };
                }
                user.name = name;
                controller.storage.users.save(user, function (err, id) {
                    bot.reply(message, 'Got it. I will call you ' + user.name + ' from now on.');
                });
            });
        };
        this.SetBotCall(['call me (.*)'], 'message_received', callme);
    }
};