'use strict';
const config            = require('/config');
const jsforce           = require('jsforce');

var XivelyDeviceBot = require('./server/bot/xivelydevicebot');
salesbot = new XivelyDeviceBot();

var xivelyoperations = require('./lib/')