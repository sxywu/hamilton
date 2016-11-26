import _ from 'lodash';
import * as d3 from "d3";
// load the data
import charList from './data/char_list.json';
import songList from './data/song_list.json';
import rawLines from './data/lines.json';
import themeList from './data/theme_list.json';
import rawCharacters from './data/characters.json';
import rawThemes from './data/themes.json';

var themeColor = d3.scaleOrdinal(d3.schemeCategory20);
var linkScale = d3.scaleLinear().range([3, 10]);

var ProcessGraph = {
  processLinesSongs(width) {
    // duplicate any of the lines sung by multiple characters
    var lines = _.chain(rawLines)
      .map((line, lineId) => {
        var songId = lineId.split(':')[0];
        // get all characters from the line
        return _.map(line[1][0], (character, i) => {
          var id = character + '/' + lineId;

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
            x: line.x || _.random(window.innerWidth * -0.5, window.innerWidth * 1.5),
            y: line.y || _.random(window.innerHeight * -0.5, window.innerHeight * 1.5),
          };
        });
      }).flatten().value();

    var songs = _.chain(rawLines)
      .groupBy(line => line[0].split(':')[0])
      .map((lines, id) => {
        return {
          id,
          name: songList[id][0],
          selected: true,
          lineLength: _.reduce(lines, (sum, line) => sum + line[2].length, 0),
        }
      }).value();

    return {songs, lines};
  },

  processCharacters(lines, width, height) {
    var radius = 20;
    var linesById = _.groupBy(lines, 'lineId');
    var filteredCharList = _.pickBy(charList, char => char[3]);
    // character nodes
    var characters = _.chain(rawCharacters.characters)
      .map((lines, id) => {
        var character = filteredCharList[id];
        if (!character) return null;

        var name = character[0];
        var initials = _.map(name.split(' '), 0).join('');

        return {
          id,
          name,
          initials,
          radius,
          fx: id === '2' ? 0 : null,
          fy: id === '2' ? 0 : null,
          color: character[4],
          selected: true,
          numLines: lines.length,
          available: true,
        };
      }).filter().value();
    var charactersById = _.keyBy(characters, 'id');

    // character links
    var conversingValues = _.values(rawCharacters.conversing);
    var minWidth = _.minBy(conversingValues, (lines) => lines.length).length;
    var maxWidth = _.maxBy(conversingValues, (lines) => lines.length).length;
    linkScale.domain([minWidth, maxWidth]);
    var conversations = _.chain(rawCharacters.conversing)
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
          available: true,
          source, target, weight,
        };
      }).filter().value();

    // position them right away
    var simulation = d3.forceSimulation(characters)
      .force('collide', d3.forceCollide().radius(radius * 2.5))
      // .force('y', d3.forceY().y(d => d.focusY))
      .force('charge', d3.forceManyBody().strength(-radius))
      .force('link', d3.forceLink(conversations).distance(radius))
      .force("center", d3.forceCenter())
      .stop();

    _.times(1000, simulation.tick);

    return {characters, conversations};
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
              diamonds,
            }
          }).sortBy(diamond => -diamond.length).value();

        _.each(diamonds, (diamond, i) => {
          _.each(diamond.diamonds, theme => theme.groupId = i + 1);
        });
        return {name: themeType, diamonds};
      }).value();

    return {diamonds, groupedThemes};
  },
}

export default ProcessGraph;
