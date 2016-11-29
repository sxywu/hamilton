import _ from 'lodash';
import * as d3 from "d3";

import rawLines from './data/lines.json';
import lineImagePositions from './data/line_image_positions.json';
import lineCharPositions from './data/line_char_positions.json';
import lineSongPositions from './data/line_song_positions.json';

// radius scale for the lines
var maxLength = _.maxBy(_.values(rawLines), line => line[2].length)[2].length;
var radiusScale = d3.scaleLinear().domain([1, maxLength]);
var lineSize = 10;
var padding = {left: 10, top: 22};

var PositionGraph = {
  positionForCharacters(lines, songs, width, left, paddingTop, highlightedSong) {
    var {songPositions} = PositionGraph.positionSongsForFilter(songs, width, left, paddingTop);
    var {linePositions} = PositionGraph.positionLinesForFilter(lines, songPositions, width, left);
    var {top} = PositionGraph.calculateTop(songPositions, highlightedSong);

    return {linePositions, songPositions, top};
  },

  positionForAll(lines, diamonds, songs, width, left, paddingTop, highlightedSong) {
    var {songPositions} = PositionGraph.positionSongsForFilter(songs, width, left, paddingTop);
    var {linePositions} = PositionGraph.positionLinesForFilter(lines, songPositions, width, left);
    var {diamondPositions} = PositionGraph.positionDiamondsForFilter(linePositions, diamonds, width, left);
    var {top} = PositionGraph.calculateTop(songPositions, highlightedSong);

    return {linePositions, songPositions, diamondPositions, top};
  },

  positionLinesForFilter(lines, songs, width, left) {
    var perLine = Math.floor((width - padding.left) / lineSize);

    var songsById = _.keyBy(songs, 'id');
    var currentSong;
    var y;
    var lastLineId = null;

    // position all the lines
    var linePositions = [];
    _.each(lines, (line, i) => {
      var songNum = line.songId;
      var startLine = parseInt(line.lineId.split(':')[1].split('-')[0], 10) - 1;
      var endLine = parseInt(line.lineId.split(':')[1].split('-')[1], 10) - 1 || startLine;

      // if next song
      if (songNum !== currentSong) {
        // first note the next y
        y = songsById[songNum].y + padding.top;
        currentSong = songNum;
      }

      var focusX = (startLine % perLine) * lineSize + padding.left + left;
      var focusY = y + Math.floor(startLine / perLine) * padding.top;
      var length = (endLine - startLine + 1) * lineSize;
      var trueY = focusY;
      var radius = lineSize / 2;

      if (line.numSingers > 1) {
        radius /= line.numSingers;
        focusY += (-lineSize / 2) + radius + 2 * radius * line.singerIndex;
      }

      // if startLine and endLine should be on different lines, split them up
      var startRow = Math.floor(startLine / perLine);
      var endRow = Math.floor(endLine / perLine);
      if (startRow !== endRow) {
        var row = Math.floor(startLine / perLine) + 1;
        length = (row * perLine - startLine) * lineSize;

        // create one extra line for overflow
        linePositions.push(Object.assign({}, line, {
          id: line.id + '.2',
          focusX: padding.left + left,
          focusY: y + endRow * padding.top,
          trueY: y + endRow * padding.top,
          radius,
          fullRadius: lineSize / 2,
          length: (endLine - row * perLine + 1) * lineSize,
          startLine,
          endLine,
        }));
      }

      linePositions.push(Object.assign(line, {
        focusX,
        focusY,
        trueY,
        radius,
        fullRadius: lineSize / 2,
        length,
        startLine,
        endLine,
      }));
    });
    return {linePositions};
  },

  positionSongsForFilter(songs, width, left, paddingTop) {
    var y = paddingTop;
    var perLine = Math.floor((width - padding.left) / lineSize);

    var songPositions = [];
    _.each(songs, song => {
      var columns = Math.ceil(perLine / lineSize);
      var rows = Math.ceil(song.lineLength / perLine);

      songPositions.push(Object.assign(song, {
        x: left,
        y,
        width: columns * lineSize * lineSize + lineSize / 2,
        height: rows * padding.top,
        rows: _.times(rows + 1, i => i * padding.top),
        columns: _.times(columns + 1, i => [
          i === 0 ? lineSize / 2 : 1,
          i * lineSize * lineSize + lineSize / (i === 0 ? 4 : 2),
        ]),
      }));

      y += (rows + 1.5) * padding.top;
    });

    return {songPositions};
  },

  positionDiamondsForFilter(linePositions, diamonds, width, left) {
    var linePositionsByLineId = _.keyBy(linePositions, 'lineId');
    var diamondPositions = [];
    _.each(diamonds, (theme) => {
      var startLine = linePositionsByLineId[theme.startLineId];

      var x1 = startLine.focusX + (theme.startLine - startLine.startLine) * lineSize;
      var y1 = startLine.trueY - startLine.fullRadius;

      var x2 = x1;
      var y2 = y1;
      if (theme.startLine !== theme.endLine) {
        var endLine = linePositionsByLineId[theme.startLineId];
        x2 = endLine.focusX + (theme.endLine - endLine.startLine) * lineSize;
        y2 = endLine.trueY - endLine.fullRadius;
      }

      diamondPositions.push(Object.assign(theme, {x1, y1, x2, y2}));
    });

    return {diamondPositions};
  },

  calculateTop(songs, highlightedSong) {
    // figure out height from the last of the songs
    var height = _.last(songs);
    height = height ? height.y + _.last(height.rows) : 0;

    var top = 0;
    if (height < window.innerHeight) {
      // if the viz is less tall than the window, then center it vertically
      top = (window.innerHeight - height) / 2;
    } else if (highlightedSong) {
      var song = _.find(songs, song => song.id === highlightedSong);
      var songBottom = song.y + _.last(song.rows);
      // if there's a song to be highlighted, and it's in the lower quarter
      // put the song 3/4 of the way down
      if (songBottom > window.innerHeight * 3 / 4) {
        top = window.innerHeight * 2 / 3 - songBottom;
      }
    }
    return {top};
  },

  positionSelectLines(lineIds, linePositions, scale, width, left) {
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

    linePositions = _.map(linePositions, line => {
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

    return {linePositions, songPositions: [], diamondPositions: []};
  },

  positionLinesAsImage(lines, width, left) {
    var dotSize = width / 71;
    var linePositions = [];

    radiusScale.range([dotSize * .75, dotSize * 1.25]);

    _.each(lineImagePositions, (positions, i) => {
      var {x, y} = positions;
      x = (x + 0.5) * dotSize + left;
      y = (y + 0.5) * dotSize;
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

    return {linePositions, songPositions: [], diamondPositions: []};
  },

  positionLinesByCharacter(lines, width, left) {
    radiusScale.range([6, 30]);

    var linePositions = _.map(lines, line => {
      var position = lineCharPositions[line.id];
      var radius = Math.floor(radiusScale(line.lineLength));

      return Object.assign(line, {
        focusX: position.x + left,
        focusY: position.y,
        radius: radius / 2,
        fullRadius: radius / 2,
        length: radius,
      });
    });
    return {linePositions, songPositions: [], diamondPositions: []};
  },

  positionLinesBySong(lines, left, top) {
    radiusScale.range([6, 30]);

    var linePositions = _.map(lines, line => {
      var position = lineSongPositions[line.id];
      var radius = Math.floor(radiusScale(line.lineLength));

      return Object.assign(line, {
        focusX: position.x + left,
        focusY: position.y + top,
        radius: radius / 2,
        fullRadius: radius / 2,
        length: radius,
      });
    });

    return {linePositions, songPositions: [], diamondPositions: []};
  },

  positionLinesRandomly(lines, width) {
    radiusScale.range([6, 15]);

    var linePositions = _.map(lines, line => {
      var x = _.random(0, width);
      var y = _.random(-window.innerHeight * 1.5, window.innerHeight * 2.5);
      var radius = Math.floor(radiusScale(line.lineLength));

      return Object.assign(line, {
        focusX: x,
        focusY: y,
        radius: radius / 2,
        fullRadius: radius / 2,
        length: radius,
      });
    });

    return {linePositions, songPositions: [], diamondPositions: []};
  },
};

export default PositionGraph;
