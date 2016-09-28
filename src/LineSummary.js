import React from 'react';
import _ from 'lodash';
// import * as d3 from "d3";

var LineSummary = React.createClass({

  render() {
    if (_.isEmpty(this.props)) {
      return (<div></div>);
    }

    var margin = 10;
    var padding = 10;
    var style = {
      position: 'absolute',
      top: this.props.y + 2 * margin,
      left: this.props.x + margin,
      padding,
      width: 300,
      backgroundColor: 'rgba(255, 255, 255, .85)',
      border: '1px solid',
    };
    var dotSize = 8;
    var headerStyle = {
      fontSize: dotSize * 2,
      lineHeight: dotSize * 2 + 'px',
    };
    // var dotStyle = {
    //   backgroundColor: this.props.fill,
    //   width: dotSize,
    //   height: dotSize,
    //   borderRadius: dotSize,
    //   margin: dotSize / 2 + 'px',
    //   marginLeft: 0,
    //   display: 'inline-block',
    // };
    var linesStyle = {
      fontSize: 12,
    };

    var lines = _.map(this.props.lines, (line, i) => {
      return (<div key={i}>{line}</div>);
    });

    return (
      <div style={style}>
        <div style={headerStyle}>
          {this.props.title}
        </div>
        <div style={linesStyle}>{lines}</div>
      </div>
    );
  }
});

export default LineSummary;
