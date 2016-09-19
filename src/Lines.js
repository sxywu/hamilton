import React from 'react';
import * as d3 from "d3";

var duration = 500;
var simulation = d3.forceSimulation()
  .force('collide', d3.forceCollide().radius(d => d.radius))
  .force('x', d3.forceX().x(d => d.focusX))
  .force('y', d3.forceY().y(d => d.focusY))
  .alphaMin(.5);

var Lines = React.createClass({
  componentDidMount() {
    // add in the circles, the number of them shouldn't change
    this.circles = d3.select(this.refs.circles)
      .style("filter", "url(#gooey)")
      .selectAll('path')
      .data(this.props.linesByCharacter, (d) => d.id)
      .enter().append('path')
        .attr('fill', (d) => d.fill)
        .attr('d', (d) => this.drawPath(d))
        .style('cursor', 'pointer');
    this.circles.append('title')
      .text((d) => d.data[2].join('\n'));

    // for now, start force in here
    simulation.nodes(this.props.linesByCharacter)
      .on('tick', this.forceTick.bind(this))
      .on('end', () => {
        this.circles.transition()
          .duration(duration)
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

    // and update position
    simulation.nodes(this.props.linesByCharacter)
      .alpha(1).restart();
  },

  forceTick() {
    this.circles.attr('transform', (d) => 'translate(' + [d.x, d.y] + ')');
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
      <g ref='circles' className='circles' />
    );
  }
});

export default Lines;
