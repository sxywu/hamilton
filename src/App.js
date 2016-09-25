import React from 'react';
import _ from 'lodash';
import * as d3 from "d3";

import Visualization from './Visualization';
import ProcessGraph from './ProcessGraph';
// load the data
import charList from './data/char_list.json';
import songList from './data/song_list.json';
import rawCharacters from './data/characters.json';
import rawLines from './data/lines.json';
import rawThemes from './data/themes.json';
// positions
import charPositions from './data/char_positions.json';
// import lineCharPositions from './data/line_char_positions.json';
// import lineSongPositions from './data/line_song_positions.json';

var color = d3.scaleOrdinal(d3.schemeCategory20);
var linkScale = d3.scaleLinear().range([1, 10]);

var App = React.createClass({

  getInitialState() {
    return {
      width: 800,
      height: 2000,
      lines: [],
      themes: [],
      linePositions: [],
      characterPositions: [],
      themePositions: [],
      songPositions: [],
      positionType: 'song',
      selectedCharacters: [],
      selectedConversation: [],
    };
  },

  componentWillMount() {
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
            songName: songList[songId],
            numSingers: line[1][0].length,
            singerIndex: i,
            conversing: [],
            fill: color(character),
            trueFill: color(character),
            selected: true,
            data: line,
          };
        });
      }).flatten().value();
    var linesById = _.keyBy(lines, 'lineId');

    // get only the top 12 individuals by line count
    var topChars = _.chain(rawCharacters.characters)
      .map((lines, character) => [character, lines.length])
      // only keep individual characters' lines
      .filter((character) => charList[character[0]][2] === 'individual')
      .sortBy((character) => -character[1])
      .map(0)
      .take(11)
      .value();

    // character nodes
    var characters = _.map(topChars, (character, i) => {
      return {
        id: character,
        name: charList[character] ? charList[character][0] : 'Other',
        radius: 20,
        color: color(character),
        image: require('./images/' + character + '.png'),
        selected: true,
      };
    });
    var charactersById = _.keyBy(characters, 'id');

    // character links
    var conversingValues = _.values(rawCharacters.conversing);
    var minWidth = _.minBy(conversingValues, (lines) => lines.length).length;
    var maxWidth = _.maxBy(conversingValues, (lines) => lines.length).length;
    linkScale.domain([minWidth, maxWidth]);
    var characterLinks = _.map(rawCharacters.conversing, (lines, conversing) => {
      var source = conversing.split('-');
      var target = charactersById[source[1]];
      source = charactersById[source[0]];
      var weight = linkScale(lines.length);

      _.each(lines, lineId => {
        // remember the targets in the lines
        linesById[lineId].conversing.push(conversing);
      });

      return {id: conversing, source, target, weight};
    });

    var themes = _.chain(rawThemes)
      .map((lineKeys, theme) => {
        return _.map(lineKeys, (lineKey) => {
          var lineId = lineKey[0][0];
          var songId = parseInt(lineId.split(':')[0], 10);
          var startLine = lineId.split(':')[1].split('/');
          var startLineId = songId + ':' + startLine[1];
          startLine = parseInt(startLine[0], 10);
          var endLine = _.last(lineKey[0]).split(':')[1].split('/');
          var endLineId = songId + ':' + endLine[1];
          endLine = parseInt(endLine[0], 10);

          return {
            id: theme + '/' + songId + ':' + startLine,
            themeId: theme,
            lineId: lineId.split('/')[0],
            songId,
            startLine,
            endLine,
            startLineId,
            endLineId,
            fill: color(theme),
            keys: lineKey[0],
            lines: lineKey[1],
          }
        });
      }).flatten().value();
    // sort the themes by song, then start line
    themes.sort((a, b) => {
      if (a.songId === b.songId) {
        return a.startLine - b.startLine;
      }
      return a.songId - b.songId;
    });

    var songs = _.reduce(songList, (obj, name, id) => {
      obj[id] = {
        id,
        name,
      }
      return obj;
    }, {});
    // var savePos = _.reduce(characterPositions, (obj, char) => {
    //   obj[char.id] = [_.round(char.fx, 2), _.round(char.fy, 2)];
    //   return obj;
    // }, {});
    var {characterPositions, linePositions, songPositions, themePositions} =
      this.filterAndPosition(this.state.selectedCharacters,
      this.state.selectedConversation, characters, lines, themes, songs);

    this.setState({linePositions, characterPositions, songPositions, themePositions});
  },

  togglePositions(positionType) {
    var {characterPositions, linePositions} = this.updatePositions(
      positionType, this.state.characterPositions, this.state.linePositions);
    this.setState({positionType, characterPositions, linePositions});
  },

  filterByCharacter(character) {
    var selectedCharacters = this.state.selectedCharacters;
    if (_.includes(selectedCharacters, character)) {
      selectedCharacters = _.without(selectedCharacters, character);
    } else {
      selectedCharacters.push(character);
    }
    selectedCharacters = _.sortBy(selectedCharacters);

    var {linePositions, characterPositions} = this.filterAndPosition(
      selectedCharacters, this.state.selectedConversation,
      this.state.characterPositions, this.state.lines, this.state.themes, this.state.songs);

    this.setState({selectedCharacters, linePositions, selectedConversation: []});
  },

  filterAndPosition(selectedCharacters, selectedConversation, characters, lines, themes, songs) {
    var {lines, themes} = ProcessGraph.filterBySelectedCharacter(
      selectedCharacters, selectedConversation, lines, themes);

    var {linePositions, songPositions, themePositions} =
      ProcessGraph.positionLinesBySong(lines, themes, songs);

    return {linePositions, songPositions, themePositions};
  },

  render() {
    return (
      <div className="App">
        <Visualization {...this.state} onSelectCharacter={this.filterByCharacter} />
      </div>
    );
  }
});

export default App;
