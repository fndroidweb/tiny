'use strict';

var schedule = require('node-schedule');
 
var rule = new schedule.RecurrenceRule();
rule.second = 42;
 
var j = schedule.scheduleJob(rule, function(){
  console.log('The answer to life, the universe, and everything!');
});