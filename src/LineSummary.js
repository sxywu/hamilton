import React from 'react';
import _ from 'lodash';
// import * as d3 from "d3";

var LineSummary = React.createClass({

  mouseEnter() {
    // this.props.hover(this.props.data);
  },

  mouseLeave() {
    // this.props.hover(null);
  },

  render() {
    if (_.isEmpty(this.props.data)) {
      return (<div></div>);
    }

    var margin = 10;
    var borderRadius = 3;
    var headerHeight = 40;
    var imageSize = 50;
    var gray = '#aaa';
    var width = 300;
    var style = {
      position: 'absolute',
      left: this.props.x - (width / 2),
      top: this.props.y + this.props.hoverHeight,
    };
    var hoverStyle = {
      width: this.props.hoverWidth,
      height: margin,
      margin: 'auto',
    };
    var contentStyle = {
      backgroundColor: '#fff',
      border: '1px solid ' + gray,
      borderRadius,
      boxShadow: '0 0 5px ' + gray,
      textAlign: 'center',
      width,
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
      fontSize: 15,
      padding: '0 40px',
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
      maxHeight: 200,
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
      <div ref='summary' style={style}>
        <div style={contentStyle} onMouseEnter={this.mouseEnter} onMouseLeave={this.mouseLeave}>
          <div style={headerStyle}>
            <img style={imageStyle} src={this.props.image} role="presentation" />
          </div>
          <h3 style={titleStyle}>
            {this.props.title}
            <div style={{fontSize: 12}}>in "{this.props.data.songName}"</div>
          </h3>
          <div style={linesStyle}>
            {lines}
          </div>
        </div>
      </div>
    );
  }
});

export default LineSummary;
