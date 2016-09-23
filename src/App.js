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
      linePositions: [],
      characterPositions: [],
      themePositions: [],
      songPositions: [],
      positionType: 'song',
      selectedCharacters: [],
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

    var themes = _.map(rawThemes, (lineKeys, theme) => {
      console.log(theme, lineKeys)
      return _.map(lineKeys, (lineKey) => {

      });
    });

    var songs = _.map(songList, (name, id) => {
      return {
        id,
        name,
      }
    });

    // var savePos = _.reduce(characterPositions, (obj, char) => {
    //   obj[char.id] = [_.round(char.fx, 2), _.round(char.fy, 2)];
    //   return obj;
    // }, {});
    // console.log(JSON.stringify(savePos))

    var {characterPositions, linePositions} = this.updatePositions(
      this.state.positionType, characters, lines, themes, songs);

    this.setState({linePositions, characterPositions});
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

    var {linePositions} = PositionGraph.positionLinesBySong(lines, themes, songs);
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

    return {characterPositions, linePositions};
  },

  filterByCharacter(character) {
    var selectedCharacters = this.state.selectedCharacters;
    if (_.includes(selectedCharacters, character)) {
      selectedCharacters = _.without(selectedCharacters, character);
    } else {
      selectedCharacters.push(character);
    }
    var {linePositions} = this.updateOpacities(
      selectedCharacters, this.state.characterPositions, this.state.linePositions);

    this.setState({selectedCharacters, linePositions});
  },

  updateOpacities(selectedCharacters, characterPositions, linePositions) {
    characterPositions = _.map(characterPositions, character => {
      var selected = true;
      if (!_.isEmpty(selectedCharacters)) {
        // if there are selected characters, then we should
        // only have 100% opacity for those lines with those characters
        selected = _.includes(selectedCharacters, character.id) ? selected : false;
      }
      return Object.assign(selectedCharacters, {
        selected,
      });
    });

    linePositions = _.map(linePositions, line => {
      var fill = color(line.characterId);
      var selected = true;
      if (!_.isEmpty(selectedCharacters)) {
        // if there are selected characters, then we should
        // only have 100% opacity for those lines with those characters
        fill = _.includes(selectedCharacters, line.characterId) ? fill : '#eee';
        selected = _.includes(selectedCharacters, line.characterId) ? selected : false;
      }
      return Object.assign(line, {
        fill,
        selected,
      });
    });

    return {linePositions, characterPositions};
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
