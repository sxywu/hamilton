import React from 'react';
import _ from 'lodash';
import * as d3 from "d3";

import Lines from './Lines';
// import Characters from './Characters';
import LineSummary from './LineSummary';

var Visualization = React.createClass({
  getInitialState() {
    return {
      hoveredLine: null,
      update: true,
    };
  },

  componentWillReceiveProps() {
    // if getting update from parent, make sure Lines and Characters get updated
    this.setState({update: true});
  },

  componentDidMount() {
    this.svg = d3.select(this.refs.svg);
    this.defineFilters();
  },

  hoverLine(hoveredLine) {
    this.setState({hoveredLine, update: false});
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

    var gray = defs.append('filter').attr('id','gray');
    gray.append('feColorMatrix')
      .attr('type','matrix')
      .attr('values','1 0 0 0 0  1 0 0 0 0  1 0 0 0 0  0 0 0 .5 0');
  },

  render() {
    var style = {
      position: 'relative',
    };
    var songs = _.map(this.props.songPositions, (song, i) => {
      return (
        <g>
          <text x={song.x - 5} y={song.y} textAnchor='end' dy='.35em'>{i + 1} |</text>
          <text x={song.x} y={song.y} dy='.35em'>{song.name}</text>
        </g>
      );
    });

    // <Characters {...this.state} {...this.props} />
    return (
      <div style={style}>
        <svg ref='svg' width={this.props.width} height={this.props.height}>
          <Lines {...this.state} {...this.props} hover={this.hoverLine} />
          <g className='songs'>
            {songs}
          </g>
        </svg>
        <LineSummary {...this.state.hoveredLine} />
      </div>
    );
  }
});

export default Visualization;
