import React from 'react';
import _ from 'lodash';
import * as d3 from 'd3';

import Diamonds from './Diamonds';
import LineSummary from '../LineSummary';

var fontSize = 12;
var Themes = React.createClass({
  getInitialState() {
    return {
      update: true,
      sideHovered: null,
    };
  },

  shouldComponentUpdate(nextProps) {
    return nextProps.update;
  },

  hoverSideTheme(hoveredTheme) {
    var sideHovered = hoveredTheme && {
      lines: hoveredTheme.lines,
      x: d3.event.x,
      y: d3.event.y,
    }
    this.setState({sideHovered, update: false});
  },

  calculateCurve(diamond) {
    var cpx = Math.min(diamond.x2 * 0.25, fontSize);
    var cpy = -0.85 * fontSize;

    return 'M' + [0, 0] +
      'C' + [cpx, cpy] + ' ' + [diamond.x2, cpy] + ' ' + [diamond.x2, cpy];
  },

  render() {
    var style = {
      display: 'inline-block',
      width: this.props.themeWidth,
      height: this.props.themeHeight,
      verticalAlign: 'top',
      textAlign: 'center',
    };
    var groupStyle = {
      display: 'inline-block',
      padding: '5px 10px',
      margin: 0,
    };

    var themes = _.map(this.props.groupedThemes, theme => {
      var diamonds = _.map(theme.diamonds, diamond => {
        var name = diamond.themeType[0].toLowerCase() + diamond.groupId;
        var gAttr = {
          transform: 'translate(' + [diamond.x, fontSize] + ')',
          opacity: diamond.available ? (diamond.selected ? 1 : 0.5) : 0,
          cursor: diamond.available ? 'pointer' : 'default',
        };
        var gClick = diamond.available ? this.props.onSelectTheme.bind(null, diamond.id) : null;
        var pathAttr = {
          d: this.calculateCurve(diamond),
          stroke: this.props.fontColor,
          fill: 'none',
        };
        var textAttr = {
          x: diamond.x2,
          textAnchor: 'middle',
          fontFamily: this.props.bodyFont,
          fontStyle: 'italic',
          fontSize,
        };
        return (
          <g {...gAttr} onClick={gClick}>
            <path {...pathAttr} />
            <text {...textAttr}>{name}</text>
          </g>
        );
      });

      return (
        <h3 style={groupStyle}>
          {theme.name}<br />
          <svg width={theme.width} height={fontSize * 2}>
            {diamonds}
          </svg>
        </h3>
      );
    });

    return (
      <div style={style}>
        {themes}
        <LineSummary {...this.state.sideHovered} />
      </div>
    );
  }
});

export default Themes;
