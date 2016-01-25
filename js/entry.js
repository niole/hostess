"use strict"

const Rx = require('rx');
const Interface = require('./Interface');
const ResAdder = require('./ResAdder');
const React = require('react');
let restaurant =
[{ location: 'window', tableNumber: 1, totalTables: 2},
{ location: '', tableNumber: 2, totalTables: 1},
{ location: 'porch', tableNumber: 3, totalTables: 1}];

let reservations =
[ { created: 1, size: 5, locationPref: 'window', tablePref: null, inTime: 0, name: 'Martin', contact: 1234560 },
{created: 2, size: 2, locationPref: null, tablePref: null, inTime: 1, name: 'Mart', contact: 1234547 },
{created: 3, size: 2, locationPref: null, tablePref: null, inTime: 2, name: 'Max', contact: 1224567 }];

React.render(<ResAdder />, document.body);
