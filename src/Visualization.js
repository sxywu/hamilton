import React from 'react';
import _ from 'lodash';
import * as d3 from "d3";

var simulation = d3.forceSimulation()
  .force('collide', d3.forceCollide().radius(d => d.radius))
  .force('x', d3.forceX().x(d => d.focusX))
  .force('y', d3.forceY().y(d => d.focusY))
  .alphaMin(.5);

var Visualization = React.createClass({
  componentDidMount() {
    this.svg = d3.select(this.refs.svg);
    this.defineFilters();

    // add in the circles, the number of them shouldn't change
    this.circles = this.svg.append('g')
      .classed('circles', true)
      .style("filter", "url(#gooey)")
      .selectAll('path')
      .data(this.props.linesByCharacter, (d) => d.id)
      .enter().append('path')
        .attr('fill', (d) => d.fill)
        .attr('d', (d) => this.drawPath(d))
        .style('cursor', 'pointer');
    this.circles.append('title')
      .text((d) => d.data[2].join('\n'));

    this.images = this.svg.append('g')
      .classed('images', true)
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
    var nodes = _.union(this.props.characterPositions, this.props.linesByCharacter);
    simulation.nodes(nodes)
      .on('tick', this.forceTick.bind(this))
      .on('end', () => {
        this.circles.transition()
          .duration(500)
          .attr('d', (d) => this.drawPath(d, true))
          .attr('transform', (d) => {
            // set the x and y to its focus (where it should be)
            d.x = d.focusX;
            d.y = d.focusY;
            return 'translate(' + [d.x, d.y] + ')';
          });

        // // go through all lines and save their positions
        // var savePos = _.reduce(this.props.linesByCharacter, (obj, line) => {
        //   obj[line.id] = [line.focusX, line.focusY, line.radius, line.fullRadius, line.length]
        //   return obj;
        // }, {});
        // console.log(JSON.stringify(savePos));
      });
  },

  componentDidUpdate() {
    // update selection
    this.circles.attr('fill', (d) => d.fill);
    this.images.attr('filter', (d) => d.selected ? '' : 'url(#gray)');

    // and update position
    var nodes = _.union(this.props.characterPositions, this.props.linesByCharacter);
    simulation
      .alpha(1)
      .nodes(nodes).restart();
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

  forceTick() {
    this.circles.attr('transform', (d) => 'translate(' + [d.x, d.y] + ')');
    this.images.attr('transform', (d) => 'translate(' + [d.x, d.y] + ')');
  },

  drawPath(d, showLength) {
    var x1 = -d.radius;
    var x2 = d.radius;
    var y1 = d.radius - d.fullRadius;
    var length = showLength ? d.length - 2 * d.radius : 0;
    var y2 = y1 + length;

    var result = 'M' + [x1, y1];
    result += ' A' + [d.radius, d.radius] + ' 0 0,1 ' + [x2, y1];
    result += ' L' + [x2, y2];
    result += ' A' + [d.radius, d.radius] + ' 0 0,1 ' + [x1, y2];
    result += ' L' + [x1, y1];
    result += 'Z';

    return result;
  },

  render() {
    return (
      <svg ref='svg' width={this.props.width} height={this.props.height}>
      </svg>
    );
  }
});

export default Visualization;
