"use strict";

const React = require('react');
const Rx = require('rx');

class ResAdder extends React.Component {
    constructor(props) {
        super(props);
        this.state = { conflict: null };
    }

    componentDidMount() {
        let parties = [];
        let Parties = Rx.Observable.fromArray(parties);

        let restaurant =
        [{ location: 'window', tableNumber: 1, totalTables: 2},
        { location: '', tableNumber: 2, totalTables: 1},
        { location: 'porch', tableNumber: 3, totalTables: 1}];
        this.rest = Rx.Observable.fromArray(restaurant);
        this.newParty = new Rx.Subject();

        this.newParty.map( value => {
            return value;
          }).subscribe((val) => {
              let restComp = Rx.Observable.repeat(val, restaurant.length);
              let resComp = Rx.Observable.repeat(val, parties.length);

              let timeConflict = Rx.Observable.zip(resComp, Parties).filter( partyPair => {
                  let reservation = partyPair[1][0];
                  let newParty = partyPair[0];
                  return this.conflict(reservation, newParty);
              });

              let tableMatches = Rx.Observable.zip(restComp, this.rest)
                                .first( pair => { return this.isMatch(pair[1], pair[0]);});

              tableMatches.takeUntil(timeConflict).subscribe( t => {
                  parties.push(t);
              });

              timeConflict.subscribe( conflict => {
                  this.showConflict(conflict);
              });
          });
    }

    showConflict(conflict) {
        this.setState({ conflict: conflict });
    }

    conflict(res, party) {
        return party.inTime < res.outTime && party.inTime >= res.inTime;;
    }

    isMatch(tab, res) {
        if (tab.totalTables === 1 && res.partySize <= 4) {
            return true;
        } else if (tab.totalTables === 2 && res.partySize > 4 && res.partySize <= 6) {
            //just end tables
            return true;
        } else if (tab.totalTables > 2 && res.partySize > 6) {
            //two end tables, 1 or more middle tables, extra calculation needed
            let openSeats = 6 + 2*(tab.totalTables-2);
            return res.partySize <= openSeats;
        }
        return false;
    }

    submit(e) {
        e.preventDefault();
        let name = this.refs.name.value;
        let partySize = +this.refs.size.value;
        let locationPref = this.refs.locationpref.value;
        let inTime = +this.refs.intime.value;
        let outTime = +this.getOutTime(inTime, partySize);
        let partyProfile = {name, partySize, locationPref,
                                          inTime, outTime};
        this.newParty.onNext(partyProfile);

        this.refs.name.value = '';
        this.refs.size.value = '';
        this.refs.locationpref.value = '';
        this.refs.intime.value = '';
    }

    getOutTime(inTime, partySize) {
        let baseTime = 90*60;
        let extra = partySize - 4;
        if (extra < 0) {
            let extraParty = Rx.Observable.range(0, extra);
            extraParty.subscribe( function(p) {
                baseTime += (10*60);
            });
        }
        return baseTime+inTime;
    }

    displayConflict(state) {
        return state.conflict ? <div>{state.conflict[0].inTime}</div> : <div/>;
    }

    render() {
        return (
            <span>
                <form onSubmit={this.submit.bind(this)}>
                  <h2>Add Reservation</h2>
                  name: <input type="text" ref="name"/>
                  size: <input type="text" ref="size"/>
                  location preference: <input type="text" ref="locationpref"/>
                  in time: <input type="text" ref="intime"/>
                  <input type="submit"/>
                </form>
                {this.displayConflict(this.state)}
           </span>
        );
    }
}

ResAdder.propTypes = {
    restaurant: React.PropTypes.array,
    reservations: React.PropTypes.array
};

module.exports = ResAdder;
