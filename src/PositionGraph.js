import _ from 'lodash';
// import * as d3 from "d3";

var width = 720;
var PositionGraph = {
  positionLinesBySong(lines, themes, songs) {
    var lineSize = 4;
    var padding = {x: 1, y: lineSize * 5};
    var s = 1;
    var x = lineSize * 6;
    var y = lineSize * 6;
    var lastLineId = null;

    // duplicate any of the lines sung by multiple characters
    var linePositions = _.map(lines, (line, i) => {
      var songNum = parseInt(line.lineId.split(':')[0], 10);
      var startLine = parseInt(line.lineId.split(':')[1].split('-')[0], 10);
      var endLine = parseInt(line.lineId.split(':')[1].split('-')[1], 10) || startLine;

      // if next song
      if (songNum !== s) {
        s = songNum;
        // set positions back to the left
        x = lineSize * 6;
        y += padding.y;
      }
      // and if a song has gone over the width
      // bring it to next line
      if (x > width && lastLineId !== line.lineId) {
        x = lineSize * 6;
        y += 2 * lineSize + 1;
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
        radius = lineSize / line.numSingers + .5;
      }

      lastLineId = line.lineId;

    	return Object.assign(line, {
        focusX,
        focusY,
        radius,
        fullRadius: lineSize,
        length,
      });
    });

    return {linePositions};
  },
}

export default PositionGraph;
