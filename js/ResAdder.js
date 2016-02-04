"use strict";

const React = require('react');
const Rx = require('rx');

class ResAdder extends React.Component {
    constructor(props) {
        super(props);
        this.state = { conflict: null };
    }

    componentDidMount() {
        //reservation = { party: party, table: table }
        this.reservations = [];
        let Reservations = Rx.Observable.fromArray(this.reservations);

        let restaurant =
        [{ location: 'window', number: 1, totalTables: 2},
        { location: '', number: 2, totalTables: 1},
        { location: 'porch', number: 3, totalTables: 1}];

        this.rest = Rx.Observable.fromArray(restaurant);
        this.newParty = new Rx.Subject();
        this.defaultSource = Rx.Observable.empty();

        const matches = {
            no_res: Rx.Observable.zip(this.newParty
                                  .selectMany(party => Rx.Observable.repeat(party, restaurant.length)), this.rest)
                                  .filter(pair => this.isMatch(pair[1], pair[0])),
            res: Rx.Observable.for( this.reservations, (res) =>
                              matches.no_res.filter(party_table => !this.conflict(res, party_table[0], party_table[1])))
        };

        let allMatches = Rx.Observable.case(() => this.reservations.length ? 'res' : 'no_res', matches, this.defaultSource);
        allMatches.subscribe( m => console.log('match', m));
    }

    showConflict(conflict) {
        this.setState({ conflict: conflict });
    }

    conflict(reservation, party, table) {
        return party.inTime < reservation.party.outTime &&
            party.inTime >= reservation.party.inTime &&
            reservation.table.number === table.number;
    }

    isMatch(tab, res) {
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
