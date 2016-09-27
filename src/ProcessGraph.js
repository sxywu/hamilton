import _ from 'lodash';
// import * as d3 from "d3";

var width = 720;
var gray = '#eee';
var PositionGraph = {
  updateCharacterOpacity(lines, diamonds, characterNodes, characterLinks) {
    var selectedLines = _.filter(lines, line => line.selected);
    var selectedCharacters = _.chain(selectedLines)
      .map('characterId')
      .uniq().value();
    var selectedConversation = _.chain(selectedLines)
      .map('conversing').flatten()
      .uniq().value();

    _.each(characterNodes, (node) => {
      node.selected = _.includes(selectedCharacters, node.id);
    });
    _.each(characterLinks, (link) => {
      link.color = _.includes(selectedConversation, link.id) ? link.source.color : gray;
    });

    return {selectedCharacters, selectedConversation, characterNodes, characterLinks};
  },

  filterBySelectedCharacter(selectedCharacters, selectedConversation, lines, diamonds) {
    // can only select characters or conversation, not both
    var filteredLines = lines;
    if (!_.isEmpty(selectedCharacters)) {
      filteredLines = _.chain(lines)
        .groupBy((line) => line.songId)
        .filter((lines) => {
          // only keep the song if all the selected characters are in it
          return _.chain(lines)
            .map(line => {
              // also use this chance to update the fill based on selected characters
              line.fill = _.includes(selectedCharacters, line.characterId) ? line.trueFill : gray;
              line.selected = _.includes(selectedCharacters, line.characterId);
              return line.characterId;
            }).uniq()
            .intersection(selectedCharacters)
            .sortBy().isEqual(selectedCharacters)
            .value();
        }).flatten().value();
    } else if (!_.isEmpty(selectedConversation)) {
      filteredLines = _.chain(lines)
        .groupBy(line => line.songId)
        .filter(lines => {
          // if even one of the lines
          var atLeastOne = false;
          _.each(lines, line => {
            line.selected = _.includes(selectedConversation, line.conversing);
            line.fill = line.selected ? line.trueFill : gray;

            atLeastOne = atLeastOne || line.selected;
          });
          return atLeastOne;
        }).flatten().value();
    } else {
      filteredLines = _.map(lines, line => {
        line.selected = true;
        line.fill = line.trueFill;
        return line;
      });
    }

    var linesById = _.keyBy(filteredLines, 'lineId');
    var filteredDiamonds = diamonds;
    filteredDiamonds = _.filter(diamonds, theme => {
      var startLine = linesById[theme.startLineId];
      var endLine = linesById[theme.endLineId];
      // keep a theme if either its start or end is in a selected character's line
      return (startLine && startLine.selected) || (endLine && endLine.selected);
    });

    return {filteredLines, filteredDiamonds};
  },

  positionLinesBySong(lines, diamonds, songs) {
    var lineSize = 5;
    var fontSize = 14;
    var padding = {x: 1, y: lineSize * 5};
    var s = 1;
    var x = lineSize * 6;
    var y = lineSize * 6;
    var lastLineId = null;

    var songPositions = [];
    // make it an object keyed by lineId for the sake of diamondPositions
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
        x += 2 * lineSize;
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
    var diamondPositions = _.map(diamonds, (theme) => {
      var startLine = linePositionsByLineId[theme.startLineId];

      var x = startLine.focusX + (theme.startLine - startLine.startLine) * lineSize;
      var y = startLine.trueY - 2 * startLine.fullRadius;
      theme.positions = [{x, y, size: lineSize}];

      if (theme.startLine !== theme.endLine) {
        var endLine = linePositionsByLineId[theme.startLineId];
        x = endLine.focusX + (theme.endLine - endLine.startLine) * lineSize;
        y = endLine.trueY - 2 * endLine.fullRadius;
        theme.positions.push({x, y, size: lineSize});
      }

      return theme;
    });

    return {linePositions, songPositions, diamondPositions};
  },
}

export default PositionGraph;
