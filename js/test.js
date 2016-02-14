"use strict";

function willAcceptNonConflicting() {
    const currRes = { party: { inTime: 0, outTime: 5}, table: { number: 1 } };
    const noConflict = [{ party: { inTime: 6, outTime: 7}, table: { number: 1 } },
        { party: { inTime: 0, outTime: 5}, table: { number: 0 } }];

    let t = noConflict.filter( res => {
        let no = hasNoConflict(currRes, res.party, res.table );
        console.log("no conflict", no);
        return no;
    }).length === 2;
    console.log('t', t);
    return t;
}

function hasNoConflict(reservation, party, table) {
    let res = reservation.party;
    let resTable = reservation.table;

    if (resTable.number === table.number) {
        return party.inTime > res.outTime || party.outTime < res.inTime;
    }
    return true;
}

module.exports = willAcceptNonConflicting;
