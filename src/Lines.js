import React from 'react';
import * as d3 from 'd3';
import './fisheye';

var duration = 500;
var simulation = d3.forceSimulation()
  .force('collide', d3.forceCollide().radius(d => d.radius + 3))
  .force('x', d3.forceX().x(d => d.focusX))
  .force('y', d3.forceY().y(d => d.focusY));

var Lines = React.createClass({
  shouldComponentUpdate(nextProps) {
    return nextProps.update;
  },

  componentDidMount() {
    // add in the circles, the number of them shouldn't change
    this.container = d3.select(this.refs.circles);
    this.updateRender();

    simulation.on('tick', this.forceTick.bind(this))
      .on('end', this.forceEnd.bind(this));
  },

  componentDidUpdate() {
    this.updateRender();

    simulation.alpha(1).restart();
  },

  updateRender() {
    this.container
      .style("filter", this.props.vizType === 'filter' ? 'url(#gooey)' : 'none');

    this.circles = this.container.selectAll('path')
      .data(this.props.linePositions, (d) => d.id);

    this.circles.exit().remove();

    this.circles = this.circles.enter().append('path')
      .on('mouseenter', this.mouseEnter)
      .on('mouseleave', this.mouseLeave)
      .attr('d', (d) => this.drawPath(d))
      .merge(this.circles)
      .attr('fill', (d) => d.selected || d.filtered ? d.fill : this.props.gray)
      .attr('d', (d) => this.drawPath(d, true));

    simulation.nodes(this.props.linePositions)
      .force("charge", this.props.vizType === 'random' ? d3.forceManyBody() : null)
      .alphaMin(this.props.vizType === 'random' ? 0 : 0.5);
  },

  mouseEnter(line) {
    this.props.hover(line);
  },

  drawPath(d, showLength) {
    var x1 = d.radius - d.fullRadius;
    var y1 = -d.radius;
    var length = showLength ? d.length - 2 * d.radius : 0;
    var x2 = x1 + length;
    var y2 = d.radius

    var result = 'M' + [x1, y1];
    result += ' L' + [x2, y1];
    result += ' A' + [d.radius, d.radius] + ' 0 0,1 ' + [x2, y2];
    result += ' L' + [x1, y2];
    result += ' A' + [d.radius, d.radius] + ' 0 0,1 ' + [x1, y1];
    result += 'Z';

    return result;
  },

  forceTick() {
    this.circles.attr('transform', (d) => 'translate(' + [d.x, d.y] + ')');
  },

  forceEnd() {
    // if (this.props.vizType === 'song') {
    //   var positions = _.reduce(this.props.linePositions, (obj, line) => {
    //     obj[line.id] = {x: _.round(line.x, 2), y: _.round(line.y, 2)};
    //     return obj;
    //   }, {});
    //   console.log(JSON.stringify(positions))
    //   return;
    // }

    this.circles.transition()
      .duration(duration)
      .attr('transform', (d) => {
        // set the x and y to its focus (where it should be)
        d.x = d.focusX;
        d.y = d.focusY;
        return 'translate(' + [d.x, d.y] + ')';
      });
  },

  render() {
    return (
      <g ref='circles' className='circles' />
    );
  }
});

export default Lines;
