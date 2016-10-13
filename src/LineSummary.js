import React from 'react';
import _ from 'lodash';
// import * as d3 from "d3";

var LineSummary = React.createClass({

  render() {
    if (_.isEmpty(this.props)) {
      return (<div></div>);
    }

    var margin = 10;
    var borderRadius = 3;
    var headerHeight = 40;
    var imageSize = 50;
    var gray = '#aaa';
    var style = {
      position: 'absolute',
      top: this.props.y + margin,
      left: this.props.x + margin,
      backgroundColor: '#fff',
      border: '1px solid ' + gray,
      borderRadius,
      boxShadow: '0 0 5px ' + gray,
      textAlign: 'center',
      minWidth: 300,
      maxWidth: 600,
    };
    var headerStyle = {
      backgroundColor: this.props.color,
      borderTopRightRadius: borderRadius,
      borderTopLeftRadius: borderRadius,
      height: headerHeight,
      borderBottom: '1px solid ' + gray,
    };
    var titleStyle = {
      marginTop: imageSize / 2 + 10,
    };
    var imageStyle = {
      width: imageSize,
      marginTop: headerHeight - imageSize / 2,
    };
    var linesStyle = {
      fontSize: 12,
      lineHeight: '22px',
      padding: '0 10px 10px 10px',
      textAlign: 'left',
      maxHeight: 300,
      overflowY: 'scroll',
    };

    var lines = _.map(this.props.lines, (line, i) => {
      return (
        <div key={i}>
          {line}
        </div>
      );
    });

    return (
      <div style={style}>
        <div style={headerStyle}>
          <img style={imageStyle} src={this.props.image} role="presentation" />
        </div>
        <h3 style={titleStyle}>{this.props.title}</h3>
        <div style={linesStyle}>
          {lines}
        </div>
      </div>
    );
  }
});

export default LineSummary;
