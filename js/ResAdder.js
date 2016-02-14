"use strict";

const React = require('react');
const Rx = require('rx');
const test = require('./test');

class ResAdder extends React.Component {
    constructor(props) {
        super(props);
        this.state = { match: [] };
    }

    submit(e) {
        e.preventDefault();
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
            console.log('newpartyupdate');
            this.props.newParty.onNext(partyProfile);
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
        return 3+inTime;//baseTime+inTime;
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

    hideMatch() {
        event.preventDefault();
        this.setState({ match: [] });
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

    showMatch(party_table) {
      if (party_table.length) {
          let [party, table] = party_table;
          return party && table &&
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
                  </div>;
        }
    }

    updateMatch(match) {
        this.setState({ match });
    }

    render() {
        const c = this;
        const s = c.state;
        const p = c.props;
        console.log('this', this);
        this.props.allMatches.subscribe( match => {
            this.updateMatch(match);
        });

        return (
            <span>
                {c.resAdder()}
                {c.showMatch.call(c, s.match)}
           </span>
        );
    }
}

ResAdder.propTypes = {
    restaurant: React.PropTypes.array,
    reservations: React.PropTypes.array
};

module.exports = ResAdder;
