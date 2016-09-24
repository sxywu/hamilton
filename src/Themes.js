import React from 'react';
import * as d3 from "d3";

var size = 5;
var pathD = 'M0,-' + size + ' L' + size + ',0 L0,' + size + ' L-' + size + ',0 Z';
var Characters = React.createClass({
  shouldComponentUpdate(nextProps) {
    return nextProps.update;
  },

  componentDidMount() {
    this.themes = d3.select(this.refs.themes)
      .selectAll('g')
      .data(this.props.themePositions)
      .enter().append('g')
        .classed('theme', true)
        .attr('fill', (d) => d.fill)
        .attr('stroke', '#fff')
        .style('cursor', 'pointer')
        .on('mouseenter', (d) => this.props.hover(d))
        .on('mouseleave', (d) => this.props.hover(null));

    this.themes.selectAll('path')
      .data((d) => d.positions)
      .enter().append('path')
      .attr('transform', (d) => 'translate(' + [d.x, d.y]+ ')')
      .attr('d', pathD);

    // only draw lines for those with two positions
    this.themes.filter((d) => d.positions.length > 1)
      .append('line')
      .attr('x1', (d) => d.positions[0].x)
      .attr('x2', (d) => d.positions[1].x)
      .attr('y1', (d) => d.positions[0].y)
      .attr('y2', (d) => d.positions[1].y)
      .attr('stroke-width', size / 2)
      .attr('stroke', (d) => d.fill);

  },

  render() {
    return (
      <g ref='themes' className='themes' />
    );
  }
});

export default Characters;
