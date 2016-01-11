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
      const Int = this;
      if (!rezzies.length) {
          return 'none';
      }
      return rezzies.map( res => {
            return (
              <li onClick={Int.addRes.bind(this, res)}>
                  <strong>party: </strong> size: {res[0].size}, location preference: {res[0].locationPref ? res[0].locationPref : 'none'} arrivale: {res[0].inTime}
                  <strong>table:</strong> number: {res[1].tableNumber} location: {res[1].location ? res[1].location : 'none' } total tables: {res[1].totalTables}
              </li>
            );
      });
   }

   addRes(res) {
       event.preventDefault();
       this.state.resBook.push(res);
       this.setState({ resBook: this.state.resBook });
   }

  render() {
    return (
        <div>
          <h1> Res Book vv </h1>
          <ul>{this.getRes(this.state.resBook)}</ul>
          <h1> New Rezzies vv </h1>
          <ul>{this.getRes(this.state.newRes)}</ul>
        </div>
    );
  }
}
