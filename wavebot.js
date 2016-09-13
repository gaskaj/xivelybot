'use strict';
const config            = require('./config');
var path                = require('path');

var FreightFarmsOperations = require('./lib/freightfarmsoperations');
var metafile = path.join(__dirname + '/Data/FreightFarms_Wave_MetaData2.json');
var ffops = new FreightFarmsOperations(metafile);
ffops.iteratedates();


