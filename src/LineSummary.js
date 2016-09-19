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
      top: this.props.y - this.props.radius,
      left: this.props.x + margin,
      padding,
      maxWidth: 300,
      backgroundColor: 'rgba(255, 255, 255, .85)',
      borderRadius: 3,
      border: '1px solid',
    };
    var dotSize = 8;
    var headerStyle = {
      fontSize: dotSize * 2,
      lineHeight: dotSize * 2 + 'px',
    };
    var dotStyle = {
      backgroundColor: this.props.fill,
      width: dotSize,
      height: dotSize,
      borderRadius: dotSize,
      margin: dotSize / 2 + 'px',
      marginLeft: 0,
      display: 'inline-block',
    };
    var linesStyle = {
      fontSize: 12,
    };

    var lines = _.map(this.props.data[2], line => {
      return (<div>{line}</div>);
    });

    return (
      <div style={style}>
        <div style={headerStyle}>{this.props.songName}</div>
        <div style={headerStyle}>
          <span style={dotStyle} />
          {this.props.characterName}
        </div>
        <div style={linesStyle}>{lines}</div>
      </div>
    );
  }
});

export default LineSummary;
