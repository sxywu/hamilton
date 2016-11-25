import React from 'react';
import * as d3 from 'd3';
import _ from 'lodash';

var Lines = {

  drawCircles(ctx, lines, top) {
    _.each(lines, line => {
      ctx.beginPath();
      // arc(x, y, radius, startAngle, endAngle, anticlockwise)
      ctx.arc(line.x, line.y + top, line.fullRadius, 0, 2 * Math.PI, false);
      ctx.fillStyle = line.fill;
      ctx.fill();
    });
  },

  drawPaths(ctx, lines, interpolate, props) {
    _.each(lines, line => {
      // line.x and line.y are center, so x1 won't change
      // but y1 will go from full radius to just radius
      // x2 will be current x + length
      // y2 will also go from full radius to just radius
      // also interpolate arc between full radius to radius
      var x1 = d3.interpolateNumber(line.x, line.focusX - (line.fullRadius - line.radius))(interpolate);
      var y1 = d3.interpolateNumber(line.y - line.fullRadius + props.top,
        line.focusY - line.radius + props.top)(interpolate);
      var x2 = d3.interpolateNumber(line.x,
        line.focusX + line.length - 2 * line.radius - (line.fullRadius - line.radius))(interpolate);
      var y2 = d3.interpolateNumber(line.y + line.fullRadius + props.top,
        line.focusY + line.radius + props.top)(interpolate);
      var radius = d3.interpolateNumber(line.fullRadius, line.radius)(interpolate);
      var fill = d3.interpolateRgb(line.fill, line.selected ? line.fill : props.gray)(interpolate);
      var opacity = d3.interpolateNumber(1, line.selected ? 1 : 0.75)(interpolate);

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y1);
      ctx.arc(x2, y1 + radius, radius, -Math.PI / 2, Math.PI / 2, false);
      ctx.lineTo(x1, y2);
      ctx.arc(x1, y2 - radius, radius, Math.PI / 2, -Math.PI / 2, false);

      ctx.fillStyle = fill.replace('rgb', 'rgba').replace(')', ',' + opacity + ')');
      ctx.fill();
    });
  },

  mouseEnter(line) {
    this.props.hover(line);
  },

  mouseLeave(line) {
    this.props.hover(null);
  },

};

export default Lines;
