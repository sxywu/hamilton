import _ from 'lodash';
// import * as d3 from "d3";

var width = 720;
var PositionGraph = {
  positionLinesBySong(lines, themes, songs) {
    var lineSize = 4;
    var fontSize = 14;
    var padding = {x: 1, y: lineSize * 5};
    var s = 1;
    var x = lineSize * 6;
    var y = lineSize * 6;
    var lastLineId = null;

    var songPositions = [];
    // make it an object keyed by lineId for the sake of themePositions
    var linePositions = _.map(lines, (line, i) => {
      var songNum = line.songId;
      var startLine = parseInt(line.lineId.split(':')[1].split('-')[0], 10);
      var endLine = parseInt(line.lineId.split(':')[1].split('-')[1], 10) || startLine;

      // if next song
      if (songNum !== s) {
        s = songNum;
        // set positions back to the left
        x = lineSize * 10;
        y += padding.y;

        // also add song position
        songPositions.push(Object.assign(songs[songNum], {
          x, y
        }));
        x += 4 * lineSize;
        y += fontSize + lineSize;
      }
      // and if a song has gone over the width
      // bring it to next line
      if (x > width && lastLineId !== line.lineId) {
        x = lineSize * 12;
        y += 4 * lineSize + 2;
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

    var linePositionsByLineId = _.keyBy(linePositions, 'lineId');
    var themePositions = _.map(themes, (theme) => {
      var startLine = linePositionsByLineId[theme.startLineId];
      // TODO(swu): FIGURE OUT WHY LINES ARE MISSING
      if (!startLine) {
        theme.positions = [];
        return theme;
      }

      var x = startLine.focusX + (theme.startLine - startLine.startLine + 1) * lineSize;
      var y = startLine.trueY - 2 * startLine.fullRadius;
      theme.positions = [{x, y}];

      if (theme.startLine !== theme.endLine) {
        var endLine = linePositionsByLineId[theme.startLineId];
        x = endLine.focusX + (theme.endLine - endLine.startLine + 1) * lineSize;
        y = endLine.trueY - 2 * endLine.fullRadius;
        theme.positions.push({x, y});
      }

      return theme;
    });

    return {linePositions, songPositions, themePositions};
  },
}

export default PositionGraph;
