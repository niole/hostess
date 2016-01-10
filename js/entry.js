"use strict"

const Rx = require('rx');

let restaurant =
[{ location: 'window', tableNumber: 1, totalTables: 2},
{ location: '', tableNumber: 2, totalTables: 1},
{ location: 'porch', tableNumber: 3, totalTables: 1}];

let reservations =
[ { created: 1, size: 5, locationPref: 'window', tablePref: null, inTime: 0, name: 'Martin', contact: 1234560 },
{created: 2, size: 2, locationPref: null, tablePref: null, inTime: 1, name: 'Mart', contact: 1234547 },
{created: 3, size: 2, locationPref: null, tablePref: null, inTime: 2, name: 'Max', contact: 1224567 }];

let allTables = Rx.Observable.fromArray(restaurant);
let allReservations = Rx.Observable.fromArray(reservations);

//TODO: make compParties reactive with something that makes an array reactive
var compParties = [];
var compTables = [];

allReservations.forEach(party => {
    compParties.push(Rx.Observable.repeat(party, restaurant.length));
});

Rx.Observable.range(0, restaurant.length).forEach( function() {
    compTables.push(allTables);
});

var groupedParties = Rx.Observable.concat(compParties);
var groupedTables = Rx.Observable.concat( compTables );

var zipped = groupedParties.zip( groupedTables );

var seatingArrangements = zipped.filter( function(z) {
    let res = z[0];
    let tab = z[1];
    if (tab.totalTables === 1 && res.size <= 4) {
        return true;
    } else if (tab.totalTables === 2 && res.size > 4 && res.size <= 6) {
        //just end tables
        return true;
    } else if (tab.totalTables > 2 && res.size > 6) {
        //two end tables, 1 or more middle tables, extra calculation needed
        let openSeats = 6 + 2*(tab.totalTables-2);
        return res.size <= openSeats;
    }
    return false;
});

module.exports = seatingArrangements;
