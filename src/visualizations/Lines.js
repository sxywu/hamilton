import React from 'react';
import * as d3 from 'd3';
import _ from 'lodash';

var Lines = {

  drawCircle(ctx, lines, top) {
    _.each(lines, line => {
      ctx.beginPath();
      // arc(x, y, radius, startAngle, endAngle, anticlockwise)
      ctx.arc(line.x, line.y + top, line.fullRadius, 0, 360, 0);
      ctx.fillStyle = line.fill;
      ctx.fill();
    });
  },

  drawPath(ctx, lines, top) {
    // var x1 = d.radius - d.fullRadius;
    // var y1 = showLength ? -d.radius : -d.fullRadius;
    // var length = showLength ? d.length - 2 * d.radius : 0;
    // var x2 = x1 + length;
    // var y2 = showLength ? d.radius : d.fullRadius;
    //
    // var result = 'M' + [x1, y1];
    // result += ' L' + [x2, y1];
    // result += ' A' + [d.radius, d.radius] + ' 0 0,1 ' + [x2, y2];
    // result += ' L' + [x1, y2];
    // result += ' A' + [d.radius, d.radius] + ' 0 0,1 ' + [x1, y1];
    // result += 'Z';
    //
    // return result;
  },

  mouseEnter(line) {
    this.props.hover(line);
  },

  mouseLeave(line) {
    this.props.hover(null);
  },

};

export default Lines;
