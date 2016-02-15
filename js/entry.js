"use strict"

const Rx = require('rx');
const ResAdder = require('./ResAdder');
const React = require('react');

let reservations = [{party: { name: "Mememe",
          partySize: 2,
          locationPref: "",
          inTime: 2,
          outTime: 2},
          table: { location: 'indoors', number: 1, totalTables: 1} }];


let Reservations = Rx.Observable.fromArray(reservations);

let restaurant = [{ location: 'indoors', number: 1, totalTables: 1}];

let Restaurant = Rx.Observable.fromArray(restaurant);

const rest = Rx.Observable.fromArray(restaurant);
const newParty = new Rx.Subject();
const defaultSource = Rx.Observable.empty();
const updateReservations = new Rx.Subject();

updateReservations.subscribe( newRes => {
    reservations.push(newRes);
    console.log('reservations', reservations);
});

let allMatches = newParty
                    .selectMany( party =>
                        Rx.Observable.merge(
                            Restaurant
                                .filter( table => isTableMatch(table, party))
                                .select( table => table.number),
                            Reservations.filter( res => timeConflict(res.party, party) && isTableMatch(res.table, party))
                                        .select( reservation => reservation.table.number))
                                        .reduce( (acc, x) => uniqueHash(acc, x), {}));



function uniqueHash(acc, x) {
    if (acc[x]) {
        //delete key from object
        delete acc[x];
    } else {
        acc[x] = true;
    }
    return acc;
}

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

function timeConflict(res, party) {
    //returns if there's a time conflict between incoming party and
    //reservation
    return (party.inTime >= res.inTime && party.outTime <= res.outTime)
            || (party.outTime > res.inTime && party.outTime <= res.outTime)
            || (party.inTime < res.outTime);
}

function isTableMatch(tab, party) {
    //returns true if the table is suitable for the party
    if (tab.totalTables === 1 && party.partySize <= 4) {
        return true;
    } else if (tab.totalTables === 2 && party.partySize > 4 && party.partySize <= 6) {

        return true;
    } else if (tab.totalTables > 2 && party.partySize > 6) {
        //two end tables, 1 or more middle tables, extra calculation needed
        let openSeats = 6 + 2*(tab.totalTables-2);
        return party.partySize <= openSeats;
    }
    return false;
}

React.render(
    <ResAdder
      restaurant={restaurant}
      allMatches={allMatches}
      updateReservations={updateReservations}
      newPartyAdder={newParty}
    />
    , document.body);
