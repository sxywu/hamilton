import React from 'react';
import * as d3 from "d3";

import Lines from './Lines';
import Diamonds from './Diamonds';
import Songs from './Songs';
import LineSummary from '../LineSummary';

var Visualization = React.createClass({
  getInitialState() {
    return {
      hovered: null,
      update: true,
    };
  },

  componentWillReceiveProps(nextProps) {
    this.setState({update: true});
  },

  componentDidMount() {
    this.svg = d3.select(this.refs.svg);
    this.defineFilters();
  },

  hoverLine(hoveredLine) {
    var hovered = hoveredLine && {
      title: hoveredLine.characterName,
      lines: hoveredLine.data[2],
      x: hoveredLine.x,
      y: hoveredLine.y,
      color: hoveredLine.fill,
      image: this.props.images[hoveredLine.characterId],
      hoverWidth: hoveredLine.length,
      hoverHeight: hoveredLine.radius,
      data: hoveredLine,
    };
    this.setState({hovered, update: false});
  },

  hoverTheme(hoveredTheme) {
    var hovered = hoveredTheme && {
      title: hoveredTheme.themeType,
      lines: hoveredTheme.lines,
      x: hoveredTheme.positions[0].x,
      y: hoveredTheme.positions[0].y,
    }
    this.setState({hovered, update: false});
  },

  defineFilters() {
    //SVG filter for the gooey effect
    //Code taken from http://tympanus.net/codrops/2015/03/10/creative-gooey-effects/
    var defs = this.svg.append('defs');
    var gooey = defs.append('filter').attr('id','gooey');
    gooey.append('feGaussianBlur')
      .attr('in','SourceGraphic')
      .attr('stdDeviation','1')
      .attr('result','blur');
    gooey.append('feColorMatrix')
      .attr('in','blur')
      .attr('mode','matrix')
      .attr('values','1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7');
  },

  render() {
    var style = {
      width: '100%',
      height: '100%',
      position: 'relative',
    };
    var diamonds = this.props.diamondPositions.length && (
      <Diamonds {...this.props} hover={this.hoverTheme} />);
    var songs = this.props.songPositions.length && (<Songs {...this.props} />);

    return (
      <div style={style}>
        <svg ref='svg' style={style}>
          <Lines {...this.props} {...this.state} hover={this.hoverLine} />
          {diamonds}
          {songs}
        </svg>
        <LineSummary {...this.state.hovered} hover={this.hoverLine} />
      </div>
    );
  }
});

export default Visualization;
