import React from 'react';
import _ from 'lodash';
import * as d3 from 'd3';

import Diamonds from './Diamonds';
import LineSummary from './LineSummary';

var Characters = React.createClass({
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

  render() {
    var style = {
      display: 'inline-block',
      width: this.props.width,
      height: this.props.height,
      verticalAlign: 'top',
      textAlign: 'center',
    };
    var groupStyle = {
      display: 'inline-block',
      padding: '0 15px',
      margin: '0 0 20px 0',
    };
    var diamondStyle = {
      gray: this.props.gray,
      cursor: 'pointer',
    };
    var themes = _.map(this.props.groupedThemes, theme => {
      var props = {update: true, diamondPositions: theme.diamonds};
      var diamonds = (<Diamonds {...props} {...diamondStyle}
        hover={this.hoverSideTheme} click={this.props.onSelectTheme} />);

      return (
        <h3 style={groupStyle}>
          {theme.name}
          <br />
          <svg width={theme.svgWidth} height={theme.svgHeight}>
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

export default Characters;
