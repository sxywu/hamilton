import React from 'react';
import * as d3 from "d3";
import _ from 'lodash';

var Songs = {
  drawLines(ctx, songs, interpolate, props) {
    var fill = d3.interpolateRgb('#fff', props.fontColor)(interpolate);
    ctx.fillStyle = fill;
    ctx.strokeStyle = fill;

    _.each(songs, song => {
      // first write text
      ctx.font = '12px ' + props.bodyFont;
      ctx.fillText(song.name, song.x + 5, song.y + props.top - 2);

      this.drawRows(ctx, song, song.rows, props);
      this.drawColumns(ctx, song, song.columns, props);
    });
  },

  drawRows(ctx, song, rows, props) {
    _.each(rows, row => {
      var y = song.y + row + props.top;
      ctx.beginPath();
      ctx.moveTo(song.x, y);
      ctx.lineTo(song.x + song.width, y);
      ctx.stroke();
    });
  },

  drawColumns(ctx, song, columns, props) {
    _.each(columns, column => {
      var x = song.x + column[1];

      ctx.beginPath();
      ctx.moveTo(x, song.y + props.top);
      ctx.lineTo(x, song.y + song.height + props.top);
      ctx.lineWidth = column[0];
      ctx.stroke();
    });
  },
};

export default Songs;
