import React from 'react';
import * as d3 from "d3";

import Lines from './Lines';
import Characters from './Characters';

var Visualization = React.createClass({
  componentDidMount() {
    this.svg = d3.select(this.refs.svg);
    this.defineFilters();
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
    return (
      <div>
        <svg ref='svg' width={this.props.width} height={this.props.height}>
          <Lines {...this.state} {...this.props} />
          <Characters {...this.state} {...this.props} />
        </svg>

      </div>
    );
  }
});

export default Visualization;
