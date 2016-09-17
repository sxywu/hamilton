import React from 'react';
import _ from 'lodash';
import * as d3 from "d3";

var simulation = d3.forceSimulation()
  .force('collide', d3.forceCollide().radius(d => d.radius + 3))
  .force('x', d3.forceX().x(d => d.focusX))
  .force('y', d3.forceY().y(d => d.focusY))
  .alphaMin(.01)
  .alphaDecay(.02);

var Visualization = React.createClass({
  componentDidMount() {
    this.svg = d3.select(this.refs.svg);

    // add in the circles, the number of them shouldn't change
    this.circles = this.svg.append('g')
      .classed('circles', true)
      .selectAll('circle')
      .data(this.props.linesByCharacter, (d) => d.id)
      .enter().append('circle')
        .attr('fill', (d) => d.color)
        .attr('r', (d) => d.radius);
console.log(this.props.characterPositions)
    this.images = this.svg.append('g')
      .classed('images', true)
      .selectAll('g')
      .data(this.props.characterPositions, (d) => d.id)
      .enter().append('g');
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
    var nodes = _.union(this.props.characterPositions, this.props.linesByCharacter);
    simulation.nodes(nodes)
      .on('tick', this.forceTick.bind(this));
  },

  forceTick() {
    this.circles
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y);

    this.images.attr('transform', (d) => 'translate(' + [d.x, d.y] + ')');
  },

  render() {
    return (
      <svg ref='svg' width={this.props.width} height={this.props.height}>
      </svg>
    );
  }
});

export default Visualization;
