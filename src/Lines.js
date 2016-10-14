import React from 'react';
import * as d3 from 'd3';
import './fisheye';

var duration = 1000;
var fisheye = d3.fisheye.circular()
  .radius(50)
  .distortion(2);

var Lines = React.createClass({
  shouldComponentUpdate(nextProps) {
    return nextProps.update;
  },

  componentDidMount() {
    // add in the circles, the number of them shouldn't change
    this.container = d3.select(this.refs.circles)
      .style("filter", "url(#gooey)");
    this.updateRender();
  },

  componentDidUpdate() {
    this.updateRender();
  },

  updateRender() {
    this.circles = this.container.selectAll('path')
      .data(this.props.linePositions, (d) => d.id);

    this.circles.exit().remove();

    this.circles = this.circles.enter().append('path')
      .on('mouseenter', this.mouseEnter)
      .on('mouseleave', this.mouseLeave)
      .attr('d', (d) => this.drawPath(d))
      .attr('transform', (d) => 'translate(' + [d.x, d.y] + ')')
      .merge(this.circles)
      .attr('fill', (d) => d.selected || d.filtered ? d.fill : this.props.gray)
      .transition().duration(duration)
      .attr('d', (d) => this.drawPath(d, true))
      .attr('transform', (d) => 'translate(' + [d.x, d.y] + ')');
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

  applyFisheye() {
    fisheye.focus(d3.mouse(this.refs.circles));
    this.circles
      .attr('transform', (d) => {
        d.fisheye = fisheye(d)
        return 'translate(' + [d.fisheye.x, d.fisheye.y] + ')scale(' + d.fisheye.z + ')';
      });
  },

  render() {
    return (
      <g ref='circles' className='circles' />
    );
  }
});

export default Lines;
