import React from 'react';
import _ from 'lodash';
import * as d3 from "d3";

import Visualization from './Visualization';
import PositionGraph from './PositionGraph';
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
var App = React.createClass({

  getInitialState() {
    return {
      width: 800,
      height: 1800,
      lines: [],
      themes: [],
      linePositions: [],
      characterPositions: [],
      themePositions: [],
      songPositions: [],
      positionType: 'song',
      selectedCharacters: ['7'],
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
            fill: color(character),
            selected: true,
            data: line,
          };
        });
      }).flatten().value();

    // get only the top 12 individuals by line count
    var topChars = _.chain(rawCharacters.characters)
      .map((lines, character) => [character, lines.length])
      // only keep individual characters' lines
      .filter((character) => charList[character[0]][2] === 'individual')
      .sortBy((character) => -character[1])
      .map(0)
      .take(11)
      .value();

    // now position the characters
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
    // console.log(JSON.stringify(savePos))
    var {characterPositions, linePositions, songPositions, themePositions} =
      this.filterAndPosition(this.state.selectedCharacters, characters, lines, themes, songs);

    this.setState({linePositions, characterPositions, songPositions, themePositions});
  },

  togglePositions(positionType) {
    var {characterPositions, linePositions} = this.updatePositions(
      positionType, this.state.characterPositions, this.state.linePositions);
    this.setState({positionType, characterPositions, linePositions});
  },

  updatePositions(type, characters, lines, themes, songs) {
    var charWidth = this.state.width / (characters.length + 1);
    var characterPositions = _.map(characters, (character, i) => {
      var x = charWidth * (i + 1);
      var y = 30;
      if (type === 'characters') {
        x = charPositions[character.id][0];
        y = charPositions[character.id][1];
      }
      return Object.assign(character, {
        x,
        y,
      })
    });

    var {linePositions, songPositions, themePositions} =
      PositionGraph.positionLinesBySong(lines, themes, songs);
    // var linePositions = _.map(lines, line => {
    //   var pos = type === 'characters' ?
    //     lineCharPositions[line.id] : lineSongPositions[line.id];
    //   return Object.assign(line, {
    //     focusX: pos[0],
    //     focusY: pos[1],
    //     radius: pos[2],
    //     fullRadius: pos[3],
    //     length: pos[4],
    //   });
    // });

    return {characterPositions, lines, themes, linePositions, songPositions, themePositions};
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
      selectedCharacters, this.state.characterPositions, this.state.lines);

    this.setState({selectedCharacters, linePositions});
  },

  filterAndPosition(selectedCharacters, characters, lines, themes, songs) {
    // filter the songs to keep only those with all characters
    lines = _.chain(lines)
      .groupBy((line) => line.songId)
      .filter((lines) => {
        // only keep the song if all the selected characters are in it
        return _.chain(lines)
          .map(line => {
            // also use this chance to update the fill based on selected characters
            line.fill = color(line.characterId);
            if (!_.isEmpty(selectedCharacters)) {
              line.fill = _.includes(selectedCharacters, line.characterId) ? line.fill : '#eee';
            }
            return line.characterId;
          }).uniq()
          .intersection(selectedCharacters)
          .sortBy().isEqual(selectedCharacters)
          .value();
      }).flatten().value();

    var {characterPositions, linePositions, songPositions, themePositions} = this.updatePositions(
      this.state.positionType, characters, lines, themes, songs);

    return {linePositions, characterPositions, songPositions, themePositions};
  },

  render() {
    return (
      <div className="App">
        <div>
          <button onClick={this.togglePositions.bind(this, 'characters')}>character</button>
          <button onClick={this.togglePositions.bind(this, 'songs')}>song</button>
        </div>
        <Visualization {...this.state} onSelectCharacter={this.filterByCharacter} />
      </div>
    );
  }
});

export default App;
