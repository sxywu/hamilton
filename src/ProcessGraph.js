import _ from 'lodash';
import * as d3 from "d3";
// load the data
import charList from './data/char_list.json';
import songList from './data/song_list.json';
import rawLines from './data/lines.json';
import themeList from './data/theme_list.json';
import rawCharacters from './data/characters.json';
import rawThemes from './data/themes.json';
import lineImagePositions from './data/line_image_positions.json';
import lineCharPositions from './data/line_char_positions.json';
import lineSongPositions from './data/line_song_positions.json';

var themeColor = d3.scaleOrdinal(d3.schemeCategory20);
var linkScale = d3.scaleLinear().range([3, 8]);
var themeScale = d3.scaleLinear().range([10, 20]);
var radiusScale = d3.scaleLinear();

var PositionGraph = {
  processLinesSongs(width) {
    // duplicate any of the lines sung by multiple characters
    var lines = _.chain(rawLines)
      .map((line, lineId) => {
        // get all characters from the line
        return _.map(line[1][0], (character, i) => {
          var id = character + '/' + lineId;
          var songId = lineId.split(':')[0];

        	return {
            id,
            lineId,
            songId,
            characterId: character,
            characterName: charList[character][0],
            songName: songList[songId][0],
            numSingers: line[1][0].length,
            singerIndex: i,
            lineLength: line[2].length,
            conversing: null,
            themes: [],
            fill: charList[character][4],
            selected: true,
            data: line,
          };
        });
      }).flatten().value();

    // radius scale for the lines
    var minLength = _.minBy(lines, 'lineLength').lineLength;
    var maxLength = _.maxBy(lines, 'lineLength').lineLength;
    radiusScale.domain([minLength, maxLength]);

    var i = 0;
    var radius = 6;
    var songWidth = (3 * radius) * _.size(songList);
    var songs = _.map(songList, (song, id) => {
      var x = (width / 2 - songWidth / 2) + i * (radius * 3);
      i += 1;

      return {
        id,
        name: song[0],
        color: song[1],
        x,
        radius,
        selected: true,
      }
    });
    return {songs, lines};
  },

  processCharacters(lines, width, height) {
    var linesById = _.groupBy(lines, 'lineId');
    var filteredCharList = _.pickBy(charList, char => char[3]);
    // character nodes
    var characterNodes = _.chain(rawCharacters.characters)
      .map((lines, id) => {
        var character = filteredCharList[id];
        if (!character) return null;

        var name = character[0];
        var initials = _.map(name.split(' '), 0).join('');

        return {
          id,
          name,
          initials,
          color: character[4],
          selected: true,
          numLines: lines.length,
        };
      }).filter().value();
    var charactersById = _.keyBy(characterNodes, 'id');

    // character links
    var conversingValues = _.values(rawCharacters.conversing);
    var minWidth = _.minBy(conversingValues, (lines) => lines.length).length;
    var maxWidth = _.maxBy(conversingValues, (lines) => lines.length).length;
    linkScale.domain([minWidth, maxWidth]);
    var characterLinks = _.chain(rawCharacters.conversing)
      .map((lines, conversing) => {
        var source = conversing.split('-');
        var target = charactersById[source[1]];
        source = charactersById[source[0]];
        if (!source || !target) return null;

        var weight = linkScale(lines.length);
        _.each(lines, lineId => {
          // for each line that has this conversation,
          // there could be multiple characters, so go through them all
          _.each(linesById[lineId], line => {
            if (line.characterId === source.id) {
              line.conversing = conversing;
            }
          });
        });

        return {
          id: conversing,
          color: source.color,
          selected: true,
          source, target, weight
        };
      }).filter().value();

    // position them right away
    var middleRow = Math.ceil(characterNodes.length / 2);
    var radius = Math.min(20, width / middleRow * 3);
    var simulation = d3.forceSimulation()
      .force('collide', d3.forceCollide().radius(d => d.radius * 2))
      // .force('y', d3.forceY().y(d => d.focusY))
      .force('link', d3.forceLink(characterLinks).distance(radius))
      .force("center", d3.forceCenter())
      .stop();

    _.chain(characterNodes)
      .sortBy(character => -character.numLines)
      .each((character, i) => {
        if (i < middleRow) {
          character.fy = 0;
        } else {
          character.fy = -radius * 4;
        }

        character.radius = radius;
      }).value();

    simulation.nodes(characterNodes);
    _.times(1000, simulation.tick);

    return {characterNodes, characterLinks};
  },

  processThemes(lines) {
    var linesById = _.groupBy(lines, 'lineId');

    var diamonds = _.chain(rawThemes)
      .map((lineKeys, theme) => {
        if (!themeList[theme][2]) return null;

        return _.map(lineKeys, (lineKey) => {
          var lineId = lineKey[0][0];
          var songId = parseInt(lineId.split(':')[0], 10);
          var startLine = lineId.split(':')[1].split('/');
          var startLineId = songId + ':' + startLine[1];
          startLine = parseInt(startLine[0], 10);
          var endLine = _.last(lineKey[0]).split(':')[1].split('/');
          var endLineId = songId + ':' + endLine[1];
          endLine = parseInt(endLine[0], 10);
          var characterIds = [];
          var conversationIds = [];

          // add themes to the lines
          _.chain(lineKey[0])
            .map((lineId) => lineId.split(':')[0] + ':' + lineId.split('/')[1])
            .uniq()
            .each((lineId) => {
              // have to loop through all the lines bc could have multiple characters
              _.each(linesById[lineId], (line) => {
                line.themes.push(theme);
                // also add in characters
                characterIds.push(line.characterId);
                conversationIds.push(line.conversing);
              });
            }).value();

          return {
            id: theme + '/' + songId + ':' + startLine,
            themeId: theme,
            themeType: themeList[theme][1],
            themeLines: themeList[theme][0],
            lineId: lineId.split('/')[0],
            songId,
            startLine,
            endLine,
            startLineId,
            endLineId,
            characterIds: _.uniq(characterIds),
            conversationIds: _.uniq(conversationIds),
            fill: themeColor(theme),
            keys: lineKey[0],
            lines: lineKey[1],
            selected: true,
            available: true,
          }
        });
      }).filter().flatten()
      .value();

    var groupedThemes = _.chain(diamonds)
      .groupBy(diamond => diamond.themeType)
      .map((diamonds, themeType) => {
        diamonds = _.chain(diamonds)
          .groupBy(diamond => diamond.themeId)
          .map((diamonds, themeId) => {
            return {
              id: themeId,
              lines: diamonds[0].themeLines,
              length: diamonds.length,
              fill: diamonds[0].fill,
            }
          }).sortBy(diamond => -diamond.length).value();

        return {name: themeType, diamonds};
      }).value();

    return {diamonds, groupedThemes};
  },

  updateFilterOpacities(lines, diamonds, songs,
    selectedCharacters, selectedConversation, selectedThemes,
    characterNodes, characterLinks, groupedThemes) {
    var nonSelected = _.isEmpty(selectedCharacters)
      && _.isEmpty(selectedConversation) && _.isEmpty(selectedThemes);

    var availableCharacters = _.chain(lines).map('characterId').uniq().value();
    var availableConversations = _.chain(lines).map('conversing').uniq().value();
    var selectedLines = _.filter(lines, 'selected');
    var filteredCharacters = _.chain(selectedLines)
      .map('characterId').uniq().value();
    var filteredConversation = _.chain(selectedLines)
      .map('conversing').uniq().value();

    if (!_.isEmpty(selectedThemes)) {
      // only if there are themes selected, intersect the characters and conversations
      var selectedThemeCharacters = _.chain(diamonds).filter('selected')
        .map('characterIds').flatten().uniq().value();
      var selectedThemeConversations = _.chain(diamonds).filter('selected')
        .map('conversationIds').flatten().uniq().value();
      availableCharacters = _.intersection(availableCharacters, selectedThemeCharacters);
      availableConversations = _.intersection(availableConversations, selectedThemeConversations);
      filteredCharacters = _.intersection(filteredCharacters, selectedThemeCharacters);
      filteredConversation = _.intersection(filteredConversation, selectedThemeConversations);
    }

    characterNodes = _.chain(characterNodes)
      .map((node) => {
        node.available = _.includes(availableCharacters, node.id);
        node.selected = nonSelected || _.includes(selectedCharacters, node.id);
        node.filtered = _.includes(filteredCharacters, node.id);
        return node;
      }).value();
    characterLinks = _.chain(characterLinks)
      .map((link) => {
        link.available = _.includes(availableConversations, link.id);
        link.selected = nonSelected || _.includes(selectedConversation, link.id);
        link.filtered = _.includes(filteredConversation, link.id);
        return link;
      }).value();

    var availableDiamonds = _.chain(diamonds).map('themeId').uniq().value();
    var filteredDiamonds = _.chain(diamonds).filter('selected').map('themeId').uniq().value();
    var countedDiamonds = _.countBy(diamonds, 'themeId');
    var maxDiamonds = _.chain(diamonds).countBy('themeId').values().max().value();
    themeScale.domain([0, maxDiamonds]);
    var svgSize = themeScale(maxDiamonds);
    _.each(groupedThemes, (theme) => {
      theme.svgWidth = svgSize * theme.diamonds.length;
      theme.svgHeight = svgSize;
      _.each(theme.diamonds, (diamond, i) => {
        diamond.available = _.includes(availableDiamonds, diamond.id);
        diamond.selected = nonSelected || _.includes(selectedThemes, diamond.id);
        diamond.filtered = _.includes(filteredDiamonds, diamond.id);
        diamond.length = countedDiamonds[diamond.id] || 0;

        var size = themeScale(diamond.length);
        diamond.positions = [{x: (i + .5) * svgSize, y: svgSize / 2, size: size / 2}];
      });
    });

    var availableSongs = _.chain(lines).map('songId').uniq().value();
    _.each(songs, song => {
      song.selected = _.includes(availableSongs, song.id);
    });

    return {characterNodes, characterLinks, groupedThemes};
  },

  filterLinesBySelectedCharacter(selectedCharacters, selectedConversation, lines) {
    var filteredLines = lines;
    if (!_.isEmpty(selectedCharacters)) {
      filteredLines = _.chain(lines)
        .groupBy((line) => line.songId)
        .filter((lines) => {
          // only keep the song if all the selected characters are in it
          return _.chain(lines)
            .map(line => {
              // also use this chance to update the fill based on selected characters
              line.selected = _.includes(selectedCharacters, line.characterId);
              return line.characterId;
            }).uniq()
            .intersection(selectedCharacters)
            .sortBy().isEqual(selectedCharacters)
            .value();
        }).flatten().value();
    }
    if (!_.isEmpty(selectedConversation)) {
      filteredLines = _.chain(filteredLines)
        .groupBy(line => line.songId)
        .filter(lines => {
          // if even one of the lines
          var atLeastOne = false;
          _.each(lines, line => {
            var selected = _.includes(selectedConversation, line.conversing);
            // if there's also selected characters take that into consideration
            line.selected = !_.isEmpty(selectedCharacters) ? line.selected || selected : selected;

            atLeastOne = atLeastOne || selected;
          });
          return atLeastOne;
        }).flatten().value();
    }

    if (_.isEmpty(selectedCharacters) && _.isEmpty(selectedConversation)) {
      filteredLines = _.map(filteredLines, line => {
        line.selected = true;
        return line;
      });
    }

    return {filteredLines};
  },

  filterLinesBySelectedThemes(selectedThemes, lines) {
    // first take out the themes
    var filteredLines2 = lines;
    if (!_.isEmpty(selectedThemes)) {
      filteredLines2 = _.chain(filteredLines2)
        .groupBy(line => line.songId)
        .filter(lines => {
          var atLeastOne = false;
          _.each(lines, line => {
            line.selected = line.selected && _.some(line.themes, theme =>
              _.includes(selectedThemes, theme));

            atLeastOne = atLeastOne || line.selected;
          });
          return atLeastOne;
        }).flatten().value();
    }

    return {filteredLines2};
  },

  filterDiamondsByRemainingLines(lines, diamonds) {
    var linesById = _.groupBy(lines, 'lineId');
    var filteredDiamonds = _.filter(diamonds, diamond => {
      var startLine = linesById[diamond.startLineId];
      var endLine = linesById[diamond.endLineId];
      // keep a theme if either its start or end is in a selected character's line
      diamond.selected = (startLine && _.some(startLine, 'selected')) ||
        (endLine && _.some(endLine, 'selected'));
      return startLine || endLine;
    });

    return {filteredDiamonds}
  },

  positionLinesBySong(lines, diamonds, songs, width) {
    var lineSize = 5;
    var padding = {x: 1, y: lineSize * 5, right: 50};
    var songWidth = 170;
    var s = 1;
    var x = songWidth;
    var y = lineSize * 8;
    var lastLineId = null;
    var songPositions = [];
    var songsById = _.keyBy(songs, 'id');
    // make it an object keyed by lineId for the sake of diamondPositions
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
        var song = songsById[songNum];
        songPositions.push({
          id: song.id,
          name: song.name,
          x, y,
        });
      }
      // and if a song has gone over the width
      // bring it to next line
      if (x > width - padding.right && lastLineId !== line.lineId) {
        x = songWidth;
        y += 4 * lineSize;
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
      theme.positions = [{x, y, size: lineSize * .8}];

      if (theme.startLine !== theme.endLine) {
        var endLine = linePositionsByLineId[theme.startLineId];
        x = endLine.focusX + (theme.endLine - endLine.startLine) * lineSize;
        y = endLine.trueY - 2 * endLine.fullRadius;
        theme.positions.push({x, y, size: lineSize * .8});
      }

      return theme;
    });

    return {linePositions, songPositions, diamondPositions};
  },

  positionLinesAsImage(lines, width, vizTop, vizAlign) {
    var dotSize = 10;
    var linePositions = [];

    radiusScale.range([6, 10]);

    var left = 0;
    var vizWidth = dotSize * 71;
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
    // width = 800;
    // var perRow = 6;
    // var rowWidth = width / perRow;
    // var linePositions = _.chain(lines)
    //   .groupBy(line => line.songId)
    //   .sortBy((lines, id) => id)
    //   .map((lines, i) => {
    //     var focusX = (i % perRow + .5) * rowWidth;
    //     var focusY = (Math.floor(i / perRow) + .5) * (rowWidth);
    //
    //     return _.map(lines, line => {
    //       var radius = Math.floor(radiusScale(line.lineLength));
    //
    //       return Object.assign(line, {
    //         focusX: focusX,
    //         focusY: focusY,
    //         radius: radius / 2,
    //         fullRadius: radius / 2,
    //         length: radius,
    //       });
    //     });
    //   }).flatten().value();
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
    var minLength = _.minBy(lines, 'lineLength').lineLength;
    var maxLength = _.maxBy(lines, 'lineLength').lineLength;
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
}

export default PositionGraph;
