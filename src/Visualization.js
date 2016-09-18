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
      .selectAll('line')
      .data(this.props.linesByCharacter, (d) => d.id)
      .enter().append('line')
        .attr('stroke', (d) => d.color)
        .attr('stroke-width', (d) => d.radius * 2)
        .attr('stroke-linecap', 'round');

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
      .on('tick', this.forceTick.bind(this))
      .on('end', () => {
        // go through all lines and save their positions
        var savePos = _.reduce(this.props.linesByCharacter, (obj, line) => {
          obj[line.id] = [_.round(line.x, 2), _.round(line.y, 2), line.radius, length: 0]
          return obj;
        }, {});
        console.log(JSON.stringify(savePos));
      });
  },

  forceTick() {
    this.circles
      .attr("x1", (d) => d.x)
      .attr("y1", (d) => d.y)
      .attr("x2", (d) => d.x + d.length)
      .attr("y2", (d) => d.y + d.length);

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
