"use strict";

const React = require('react');
const Rx = require('rx');
const test = require('./test');

const propTypes = {
    restaurant: React.PropTypes.array,
    allMatches: React.PropTypes.object,
    updateReservations: React.PropTypes.object,
    newPartyAdder: React.PropTypes.object
};

class ResAdder extends React.Component {
    constructor(props) {
        super(props);
        this.newParty = null;
        this.state = { match: [] };
    }

    submit(e) {
        e.preventDefault();

        //TODO might be able to update match with an rx subject?
        this.updateMatch([]);

        let name = this.refs.name.value;
        let partySize = +this.refs.size.value;
        let locationPref = this.refs.locationpref.value;
        let inTime = +this.refs.intime.value;
        let outTime = +this.getOutTime(inTime, partySize);
        let openTableDate = +this.refs.opentablefinder.value;

        if (openTableDate) {
            this.getOpenTables(openTableDate).subscribe( t => {
                console.log('t', t);
            });
        } else {
            let partyProfile = {name, partySize, locationPref,
                                              inTime, outTime};
            this.newParty = partyProfile;
            this.props.newPartyAdder.onNext(partyProfile);
        }

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
        return inTime;//TODO add back in --> baseTime+inTime;
    }

    resAdder() {
        return <form onSubmit={this.submit.bind(this)}>
                   <h2>Add Reservation</h2>
                   name: <input type="text" ref="name"/>
                   size: <input type="text" ref="size"/>
                   location preference: <input type="text" ref="locationpref"/>
                   in time: <input type="text" ref="intime"/>
                   <input ref="opentablefinder" placeholder="find open tables..."/>
                   <input type="submit"/>
               </form>;
    }

    getOpenSeats(totalTables) {
        if (totalTables === 1) {
            return 2;
        } else if (totalTables === 2) {
            return 6;
        } else {
            return 6 + 2*(totalTables-2);
        }
    }

    showMatch(table, party) {
      //show matching table for inputted party
      //tables start at table.number = 1 and
      //are sorted
      return table && party &&
              <div>
                  <table>
                    <tbody>
                      <tr>
                        <td>the {party.name} party</td>
                        <td>table {table.number}</td>
                      </tr>
                      <tr>
                        <td>in time: {party.inTime}</td>
                        <td>table location: {table.location}</td>
                      </tr>
                      <tr>
                        <td>out time: {party.outTime}</td>
                        <td>max open seats: {this.getOpenSeats(table.totalTables)}</td>
                      </tr>
                    </tbody>
                 </table>
                 <button onClick={this.addReservation.bind(this)}>Add Reservation</button>
                 <button onClick={this.updateMatch.bind(this, [])}>Cancel Reservation</button>
              </div>;
    }

    addReservation() {
        event.preventDefault();
        let newRes = { party: this.state.match[1], table: this.state.match[0] };
        this.props.updateReservations.onNext(newRes);
        this.updateMatch([]);
    }

    updateMatch(match) {
        event.preventDefault();
        if (!match.length) {
            this.newParty = null;
        }
        this.setState({ match });
    }

    getTableFromMatch(matchObj) {
        for (let k in matchObj) {
            return this.props.restaurant[k-1];
        }
        //if we reach this point, there are no
        //found tables
        return;
    }

    render() {
        const c = this;
        const s = c.state;
        const p = c.props;

        p.allMatches.subscribe( match => {
            c.updateMatch([c.getTableFromMatch(match), c.newParty]);
        });

        return (
            <span>
                {c.resAdder()}
                {c.showMatch.call(c, s.match[0], s.match[1])}
           </span>
        );
    }
}

ResAdder.propTypes = propTypes;

module.exports = ResAdder;
