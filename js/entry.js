"use strict"

const Rx = require('rx');
const ResAdder = require('./ResAdder');
const React = require('react');

let computedMatch = [];

let reservations = [{party: { name: "Mememe",
          partySize: 3,
          locationPref: "",
          inTime: 29385 },
          table: { location: 'indoors', number: 2, totalTables: 1} },

{party: { name: "Ummers",
          partySize: 5,
          locationPref: "porch",
          inTime: 1 },
          table:
          { location: 'window', number: 1, totalTables: 2}},
{party:
    { name: "Quinton",
    partySize: 1,
    locationPref: "window",
    inTime: 29375 },
table:
{ location: 'indoors', number: 2, totalTables: 1}}];

let Reservations = Rx.Observable.fromArray(reservations);

let restaurant =
[{ location: 'window', number: 1, totalTables: 2},
{ location: 'indoors', number: 2, totalTables: 1},
{ location: 'porch', number: 3, totalTables: 1}];

let rest = Rx.Observable.fromArray(restaurant);
let newParty = new Rx.Subject();
let defaultSource = Rx.Observable.empty();

//gets table matches for specific party
//takes current reservations into account

let matches = {
    no_res: Rx.Observable.zip(newParty
                          .selectMany(party => Rx.Observable.repeat(party, restaurant.length)), rest)
                          .filter(pair => isMatch(pair[1], pair[0])),
    res: Rx.Observable.for( reservations, (res) =>
                                matches.no_res.filter(party_table => hasNoConflict(res, party_table[0], party_table[1])))

};

let allMatches = Rx.Observable.case(() => reservations.length ? 'res' : 'no_res', matches, defaultSource).first();

function getOpenTables(date) {
    //date will act as a key and map to some observable of reservations
    //or help filter out correct tables
    return Reservations.filter( res => atDate(res.party.inTime, date));
}

function atDate(inTime, date) {
    //date is always milliseconds at start of day
    const msPerDay = 10;
    if (inTime >= date) {
        return Math.abs(inTime-date) <= msPerDay;
    }
}

function hasNoConflict(reservation, party, table) {
    let res = reservation.party;
    let resTable = reservation.table;

    if (resTable.number === table.number) {
        return party.inTime > res.outTime || party.outTime < res.inTime;
    }
    return true;
}


function isMatch(tab, res) {
    if (tab.totalTables === 1 && res.partySize <= 4) {
        return true;
    } else if (tab.totalTables === 2 && res.partySize > 4 && res.partySize <= 6) {

        return true;
    } else if (tab.totalTables > 2 && res.partySize > 6) {
        //two end tables, 1 or more middle tables, extra calculation needed
        let openSeats = 6 + 2*(tab.totalTables-2);
        return res.partySize <= openSeats;
    }
    return false;
}

React.render(<ResAdder allMatches={allMatches} newParty={newParty} match={computedMatch}/>, document.body);
