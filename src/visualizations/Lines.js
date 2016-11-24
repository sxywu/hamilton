import React from 'react';
import * as d3 from 'd3';

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
    simulation.on('tick', this.forceTick.bind(this))
      .on('end', this.forceEnd.bind(this))
      .stop();

    this.updateRender();
  },

  componentDidUpdate() {
    this.updateRender();
  },

  updateRender() {
    // this.container
      // .style("filter", this.props.vizType === 'line' ? 'url(#gooey)' : 'none');

    // because we're using alpha which goes towards 0
    // the top we're going towards must be 0
    this.interpolateTop = d3.interpolateNumber(this.props.top, this.props.prevTop);

    this.circles = this.container.selectAll('path')
      .data(this.props.linePositions, (d) => d.id);

    this.circles.exit().remove();

    var finished = 0;
    this.circles = this.circles.enter().append('path')
      .on('mouseenter', this.mouseEnter)
      .on('mouseleave', this.mouseLeave)
      .attr('d', (d) => this.drawPath(d))
      .merge(this.circles)
      .attr('d', (d) => this.drawPath(d))
      .attr('fill', (d) => d.selected || d.filtered ? d.fill : this.props.gray)
      .attr('opacity', d => d.selected || d.filtered ? 1 : 0.75);

    simulation.nodes(this.props.linePositions)
      .force("charge", this.props.random ? d3.forceManyBody() : null)
      .alphaMin(this.props.random ? 0 : 0.5)
      .alpha(1).restart();

  },

  mouseEnter(line) {
    this.props.hover(line);
  },

  mouseLeave(line) {
    this.props.hover(null);
  },

  drawPath(d, showLength) {
    var x1 = d.radius - d.fullRadius;
    var y1 = showLength ? -d.radius : -d.fullRadius;
    var length = showLength ? d.length - 2 * d.radius : 0;
    var x2 = x1 + length;
    var y2 = showLength ? d.radius : d.fullRadius;

    var result = 'M' + [x1, y1];
    result += ' L' + [x2, y1];
    result += ' A' + [d.radius, d.radius] + ' 0 0,1 ' + [x2, y2];
    result += ' L' + [x1, y2];
    result += ' A' + [d.radius, d.radius] + ' 0 0,1 ' + [x1, y1];
    result += 'Z';

    return result;
  },

  forceTick() {
    var interpolate = (simulation.alpha() - simulation.alphaMin()) / (1 - simulation.alphaMin());
    var top = this.interpolateTop(Math.max(0, interpolate));
    this.container.attr('transform', 'translate(' + [0, top] + ')');

    this.circles.attr('transform', (d) => 'translate(' + [d.x, d.y] + ')');
  },

  forceEnd() {
    this.circles.transition()
      .duration(duration)
      .attr('d', (d) => this.drawPath(d, true))
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
