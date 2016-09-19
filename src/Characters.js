import React from 'react';
import * as d3 from "d3";

var duration = 500;
var simulation = d3.forceSimulation()
  .force('collide', d3.forceCollide().radius(d => d.radius))
  .force('x', d3.forceX().x(d => d.focusX))
  .force('y', d3.forceY().y(d => d.focusY))
  .alphaMin(.5);

var Characters = React.createClass({
  componentDidMount() {
    this.images = d3.select(this.refs.images)
      .selectAll('g')
      .data(this.props.characterPositions, (d) => d.id)
      .enter().append('g')
        .style('cursor', 'pointer')
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

    // for now, start force in here
    simulation.nodes(this.props.characterPositions)
      .on('tick', this.forceTick.bind(this))
      .on('end', () => {
        this.images.transition()
          .duration(duration)
          .attr('transform', (d) => {
            // set the x and y to its focus (where it should be)
            d.x = d.focusX;
            d.y = d.focusY;
            return 'translate(' + [d.x, d.y] + ')';
          });
      });
  },

  componentDidUpdate() {
    // update selection
    this.images.attr('filter', (d) => d.selected ? '' : 'url(#gray)');

    // and update position
    simulation
      .nodes(this.props.characterPositions)
      .alpha(1).restart();
  },

  forceTick() {
    this.images.attr('transform', (d) => 'translate(' + [d.x, d.y] + ')');
  },

  render() {
    return (
      <g ref='images' className='images' />
    );
  }
});

export default Characters;
