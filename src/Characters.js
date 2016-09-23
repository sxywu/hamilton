import React from 'react';
import * as d3 from "d3";

var Characters = React.createClass({
  shouldComponentUpdate(nextProps) {
    return nextProps.update;
  },

  componentDidMount() {
    this.images = d3.select(this.refs.images)
      .selectAll('g')
      .data(this.props.characterPositions, (d) => d.id)
      .enter().append('g')
        .style('cursor', 'pointer')
        .attr('transform', (d) => 'translate(' + [d.x, d.y] + ')')
        .on('click', (d) => this.props.onSelectCharacter(d.id));
    this.images.append('image')
      .attr('width', (d) => d.radius * 2)
      .attr('height', (d) => d.radius * 2)
      .attr('x', (d) => -d.radius)
      .attr('y', (d) => -d.radius)
      .attr('xlink:href', (d) => d.image);
    this.images.append('circle')
      .attr('r', (d) => d.radius)
      .attr('fill', 'none')
      .attr('stroke', (d) => d.color)
      .attr('stroke-width', 2);
  },

  componentDidUpdate() {
    // update selection
    this.images.attr('filter', (d) => d.selected ? '' : 'url(#gray)')
      .attr('transform', (d) => 'translate(' + [d.x, d.y] + ')');
  },

  render() {
    return (
      <g ref='images' className='images' />
    );
  }
});

export default Characters;
