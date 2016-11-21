import _ from 'lodash';
import * as d3 from "d3";

import rawLines from './data/lines.json';
import lineImagePositions from './data/line_image_positions.json';
import lineCharPositions from './data/line_char_positions.json';
import lineSongPositions from './data/line_song_positions.json';

// radius scale for the lines
var maxLength = _.maxBy(_.values(rawLines), line => line[2].length)[2].length;
var radiusScale = d3.scaleLinear().domain([1, maxLength]);

var PositionGraph = {
  positionLinesForFilter(lines, diamonds, songs, width, vizTop) {
    var lineSize = 5;
    var padding = {x: 1, y: lineSize * 5, right: 50};
    var songWidth = songs.length ? 170 : lineSize * 8;
    var s = 1;
    var x = songWidth;
    var y = vizTop;
    var lastLineId = null;
    var songPositions = [];
    var songsById = _.keyBy(songs, 'id');

    // position all the lines
    var linePositions = _.map(lines, (line, i) => {
      var songNum = line.songId;
      var startLine = parseInt(line.lineId.split(':')[1].split('-')[0], 10);
      var endLine = parseInt(line.lineId.split(':')[1].split('-')[1], 10) || startLine;

      // if next song
      if (songNum !== s) {
        s = songNum;
        // set positions back to the left
        x = songWidth;
        y += padding.y;

        // also add song position
        if (songs.length) {
          var song = songsById[songNum];
          songPositions.push({
            id: song.id,
            name: song.name,
            x, y,
          });
        }
      }
      // and if a song has gone over the width
      // bring it to next line
      if (x > width - lineSize * 8 && lastLineId !== line.lineId) {
        x = songWidth;
        y += padding.y * 0.6;
      }

      // x-position
      var focusX = x;
      var length = lineSize * (endLine - startLine + 2);
      if (lastLineId !== line.lineId) {
        // add length to the x-position only if
        // it's not start of song and different line from the last
        x += length + padding.x;
      } else {
        // if it's the same, set focusX back by length
        // so that this line overlaps with the last
        // (they are the same line, different singers)
        focusX -= length + padding.x;
      }

      // y-position
      var focusY = y;
      var radius = lineSize;
      if (line.numSingers > 1) {
        focusY += (lineSize / (line.numSingers - 1) * line.singerIndex) - (lineSize / 2);
        radius = lineSize / line.numSingers + .25;
      }

      lastLineId = line.lineId;

      return Object.assign(line, {
        focusX,
        focusY,
        trueY: y,
        radius,
        fullRadius: lineSize,
        length,
        startLine,
        endLine,
      });
    });

    // position theme diamonds only if we've passed them in
    if (diamonds.length) {
      var linePositionsByLineId = _.keyBy(linePositions, 'lineId');
      var diamondPositions = _.map(diamonds, (theme) => {
        var startLine = linePositionsByLineId[theme.startLineId];

        var x = startLine.focusX + (theme.startLine - startLine.startLine) * lineSize;
        var y = startLine.trueY - 2 * startLine.fullRadius;
        theme.positions = [{x, y, size: lineSize * .8}];

        if (theme.startLine !== theme.endLine) {
          var endLine = linePositionsByLineId[theme.startLineId];
          x = endLine.focusX + (theme.endLine - endLine.startLine) * lineSize;
          y = endLine.trueY - 2 * endLine.fullRadius;
          theme.positions.push({x, y, size: lineSize * .8});
        }

        return theme;
      });
    }


    return {linePositions, songPositions, diamondPositions};
  },

  positionSelectLines(lineIds, linePositions, scale, width, vizWidth) {
    // var left = 0;
    // if (vizAlign === 'center') {
    //   left = (width - vizWidth) / 2;
    // } else if (vizAlign === 'right') {
    //   left = width - vizWidth;
    // }

    var centerLine = lineIds && _.find(linePositions, line => lineIds[0] === line.id);
    var centerX, centerY;
    // var translateX;
    if (centerLine) {
      centerX = centerLine.focusX;
      centerY = centerLine.focusY;
      // translateX = left + (vizWidth / 2) - centerX;
    }

    return _.map(linePositions, line => {
      line.selected = _.isEmpty(lineIds) || _.includes(lineIds, line.id);
      if (centerLine) {
        // line.focusX += translateX;
        // line.focusX = line.focusX - (centerX + translateX - line.focusX) * scale;
        line.focusX -= (centerX - line.focusX) * scale;
        line.focusY -= (centerY - line.focusY) * scale;

        line.radius *= scale;
        line.fullRadius *= scale;
        line.length *= scale;
      }

      return line;
    });
  },

  positionLinesAsImage(lines, width, vizWidth, vizTop, vizAlign) {
    var dotSize = vizWidth / 71;
    var linePositions = [];

    radiusScale.range([dotSize * .75, dotSize * 1.25]);

    var left = 0;
    if (vizAlign === 'center') {
      left = (width - vizWidth) / 2;
    } else if (vizAlign === 'right') {
      left = width - vizWidth;
    }

    _.each(lineImagePositions, (positions, i) => {
      var {x, y} = positions;
      x = (x - 0.5) * dotSize + left;
      y = (y - 0.5) * dotSize + vizTop;
      var line = lines[i];
      var radius = Math.floor(radiusScale(line.lineLength));

      linePositions.push(Object.assign(line, {
        focusX: x,
        focusY: y,
        radius: radius / 2,
        fullRadius: radius / 2,
        length: radius,
      }));
    });

    return linePositions;
  },

  positionLinesByCharacter(lines, width, vizTop, vizAlign, vizWidth) {
    radiusScale.range([6, 30]);

    var left = 0;
    if (vizAlign === 'center') {
      left = (width - vizWidth) / 2;
    } else if (vizAlign === 'right') {
      left = width - vizWidth;
    }

    var linePositions = _.map(lines, line => {
      var position = lineCharPositions[line.id];
      var radius = Math.floor(radiusScale(line.lineLength));

      return Object.assign(line, {
        focusX: position.x + left,
        focusY: position.y + vizTop,
        radius: radius / 2,
        fullRadius: radius / 2,
        length: radius,
      });
    });
    return linePositions;
  },

  positionLinesBySong(lines, width, vizTop, vizAlign, vizWidth) {
    radiusScale.range([6, 30]);

    var left = 0;
    if (vizAlign === 'center') {
      left = (width - vizWidth) / 2;
    } else if (vizAlign === 'right') {
      left = width - vizWidth;
    }

    var linePositions = _.map(lines, line => {
      var position = lineSongPositions[line.id];
      var radius = Math.floor(radiusScale(line.lineLength));

      return Object.assign(line, {
        focusX: position.x + left,
        focusY: position.y + vizTop,
        radius: radius / 2,
        fullRadius: radius / 2,
        length: radius,
      });
    });

    return linePositions;
  },

  positionLinesRandomly(lines, width, top, bottom) {
    radiusScale.range([6, 15]);

    var linePositions = _.map(lines, line => {
      var x = _.random(0, width);
      var y = _.random(top, bottom);
      var radius = Math.floor(radiusScale(line.lineLength));

      return Object.assign(line, {
        focusX: x,
        focusY: y,
        radius: radius / 2,
        fullRadius: radius / 2,
        length: radius,
      });
    });

    return linePositions;
  },
};

export default PositionGraph;
