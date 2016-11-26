import React from 'react';
import * as d3 from "d3";
import _ from 'lodash';

var Diamonds = {
  drawCurves(ctx, themes, interpolate, props) {
    ctx.fillStyle = props.fontColor;
    ctx.strokeStyle = props.fontColor;
    ctx.textAlign = 'right';
    var fontSize = 9;
    ctx.font = 'italic ' + fontSize + 'px ' + props.bodyFont;
    _.each(themes, theme => {
      var name = theme.themeType[0].toLowerCase() + theme.groupId;
      var x = d3.interpolateNumber(theme.x1, theme.x2 - fontSize)(interpolate);
      var y = theme.y1 + props.top - 1;
      if (theme.endLine - theme.startLine > 1) {
        // only draw a curve if there are more than 2 lines
        var cpx = Math.min((x - theme.x1) * 0.25, fontSize) + theme.x1;
        var cpy = y - 0.75 * fontSize;
        ctx.moveTo(theme.x1, y);
        ctx.bezierCurveTo(cpx, cpy, x, cpy, x, cpy);
        ctx.stroke();
      }

      ctx.fillText(name, x + fontSize, y);
    });
  },
};

export default Diamonds;
