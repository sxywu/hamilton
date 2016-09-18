import React from 'react';
import _ from 'lodash';
import * as d3 from "d3";

import Visualization from './Visualization';
// load the data
import charList from './data/char_list.json';
import charPositions from './data/char_positions.json';
import lineCharPositions from './data/line_char_positions.json';
import lineSongPositions from './data/line_song_positions.json';
import characters from './data/characters.json';
import lines from './data/lines.json';

var color = d3.scaleOrdinal(d3.schemeCategory20);
var App = React.createClass({

  getInitialState() {
    return {
      width: 800,
      height: 1000,
      linesByCharacter: [],
      characterPositions: [],
      positionType: 'song',
      selectedCharacters: [],
    };
  },

  componentWillMount() {
    // duplicate any of the lines sung by multiple characters
    var linesByCharacter = _.chain(lines)
      .map((line, lineId) => {
        // get all characters from the line
        return _.map(line[1][0], (character, i) => {
          var id = character + '/' + lineId;

        	return {
            id,
            lineId,
            characterId: character,
            fill: color(character),
            data: line,
          };
        });
      }).flatten().value();

    // get only the top 12 individuals by line count
    var topChars = _.chain(characters.characters)
      .map((lines, character) => [character, lines.length])
      // only keep individual characters' lines
      .filter((character) => charList[character[0]][2] === 'individual')
      .sortBy((character) => -character[1])
      .map(0)
      .take(11)
      .value();

    // now position the characters
    var characterPositions = _.reduce(topChars, (obj, character, i) => {
      obj[character] = {
        id: character,
        name: charList[character] ? charList[character][0] : 'Other',
        radius: 20,
        color: color(character),
        image: require('./images/' + character + '.png'),
        selected: true,
      };
      return obj;
    }, {});

    // var savePos = _.reduce(characterPositions, (obj, char) => {
    //   obj[char.id] = [_.round(char.fx, 2), _.round(char.fy, 2)];
    //   return obj;
    // }, {});
    // console.log(JSON.stringify(savePos))

    characterPositions = _.values(characterPositions);
    var {characterPositions, linesByCharacter} = this.updatePositions(
      this.state.positionType, characterPositions, linesByCharacter);

    this.setState({linesByCharacter, characterPositions});
  },

  togglePositions(positionType) {
    var {characterPositions, linesByCharacter} = this.updatePositions(
      positionType, this.state.characterPositions, this.state.linesByCharacter);
    this.setState({positionType, characterPositions, linesByCharacter});
  },

  updatePositions(type, characterPositions, linesByCharacter) {
    var charWidth = this.state.width / (characterPositions.length + 1);
    characterPositions = _.map(characterPositions, (character, i) => {
      var fx = charWidth * (i + 1);
      var fy = 30;
      if (type === 'characters') {
        fx = charPositions[character.id][0];
        fy = charPositions[character.id][1];
      }
      return Object.assign(character, {
        fx,
        fy,
      })
    });

    linesByCharacter = _.map(linesByCharacter, line => {
      var pos = type === 'characters' ?
        lineCharPositions[line.id] : lineSongPositions[line.id];
      return Object.assign(line, {
        focusX: pos[0],
        focusY: pos[1],
        radius: pos[2],
        fullRadius: pos[3],
        length: pos[4],
      });
    });

    return {characterPositions, linesByCharacter};
  },

  filterByCharacter(character) {
    var selectedCharacters = this.state.selectedCharacters;
    selectedCharacters.push(character);
    var {linesByCharacter} = this.updateOpacities(
      selectedCharacters, this.state.characterPositions, this.state.linesByCharacter);

    this.setState({selectedCharacters, linesByCharacter});
  },

  updateOpacities(characters, characterPositions, linesByCharacter) {
    characterPositions = _.map(characterPositions, character => {
      var selected = true;
      if (!_.isEmpty(characters)) {
        // if there are selected characters, then we should
        // only have 100% opacity for those lines with those characters
        selected = _.includes(characters, character.id) ? selected : false;
      }
      return Object.assign(character, {
        selected,
      });
    });

    linesByCharacter = _.map(linesByCharacter, line => {
      var fill = color(line.characterId);
      if (!_.isEmpty(characters)) {
        // if there are selected characters, then we should
        // only have 100% opacity for those lines with those characters
        fill = _.includes(characters, line.characterId) ? fill : '#eee';
      }
      return Object.assign(line, {
        fill,
      });
    });

    return {linesByCharacter, characterPositions};
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
