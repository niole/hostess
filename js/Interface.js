"use strict"

const React = require('react');

module.exports = class Interface extends React.Component {
   constructor(props) {
       super(props);
       this.state = { resBook: [], newRes: [] };
   }

   componentDidMount() {
        let Int = this;
        this.props.seating.subscribe( match => {
            Int.checkRes(match);
        });
   }

   checkRes(res) {
      this.state.newRes.push(res);
      this.setState({ newRes: this.state.newRes });
   }

   getRes(rezzies) {
      return rezzies.map( res => {
            return (
              <li>
                  <strong>party: </strong> size: {res[0].size}, location preference: {res[0].locationPref ? res[0].locationPref : 'none'} arrivale: {res[0].inTime}
                  <strong>table:</strong> number: {res[1].tableNumber} location: {res[1].location ? res[1].location : 'none' } total tables: {res[1].totalTables}
              </li>
            );
      });
   }

  render() {
    return <ul>{this.getRes(this.state.newRes)}</ul>;
  }
}
