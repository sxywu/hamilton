import React from 'react';
import * as d3 from 'd3';
import './fisheye';

var duration = 500;
var simulation = d3.forceSimulation()
  .force('collide', d3.forceCollide().radius(d => d.radius))
  .force('x', d3.forceX().x(d => d.focusX))
  .force('y', d3.forceY().y(d => d.focusY));

var Lines = React.createClass({
  shouldComponentUpdate(nextProps) {
    return nextProps.update;
  },

  componentDidMount() {
    // add in the circles, the number of them shouldn't change
    this.container = d3.select(this.refs.circles)
      .style("filter", "url(#gooey)");
    this.updateRender();

    simulation.nodes(this.props.linePositions)
      .force("charge", this.props.vizType === 'random' ? d3.forceManyBody() : null)
      .alphaMin(this.props.vizType === 'random' ? 0 : 0.5)
      .on('tick', this.forceTick.bind(this))
      .on('end', this.forceEnd.bind(this));
  },

  componentDidUpdate() {
    this.updateRender();

    simulation.nodes(this.props.linePositions)
      .force("charge", this.props.vizType === 'random' ? d3.forceManyBody() : null)
      .alphaMin(this.props.vizType === 'random' ? 0 : 0.5)
      .alpha(1).restart();
  },

  updateRender() {
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
