"use strict"

const React = require('react');

module.exports = class Interface extends React.Component {
   constructor(props) {
       super(props);
       console.log(props);
       this.props = props;
       this.state = { resBook: [], newRes: [] };
   }

  render() {
    let n;
    this.props.name.subscribe( (name) => {
        n = name;
    });
    return <div>{n[1].tableNumber}</div>;
  }
}
