import React from 'react';
import _ from 'lodash';
import * as d3 from "d3";

import Visualization from './Visualization';
// load the data
import charList from './data/char_list.json';
// import charPositions from './data/char_positions.json';
// import lineCharPositions from './data/line_char_positions.json';
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
    };
  },

  componentWillMount() {
    // duplicate any of the lines sung by multiple characters
    var linesByCharacter = _.chain(lines)
      .map((line, lineId) => {
        // get all characters from the line
        return _.map(line[1][0], (character, i) => {
          var id = character + '/' + lineId;
          var pos = lineSongPositions[id];

        	return {
            id,
            lineId,
            characterId: character,
            focusX: pos[0],
            focusY: pos[1],
            radius: pos[2],
            length: pos[3],
            color: color(character),
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
    topChars.push('other');

    // now position the characters
    var charWidth = this.state.width / topChars.length;
    var characterPositions = _.reduce(topChars, (obj, character, i) => {
      obj[character] = {
        id: character,
        name: charList[character] ? charList[character][0] : 'Other',
        fx: charWidth * (i + 1),
        fy: 30,
        radius: 20,
        color: color(character),
      };
      if (character !== 'other') {
        // only load image if it's a character
        obj[character].image = require('./images/' + character + '.png');
      }
      return obj;
    }, {});

    // var savePos = _.reduce(characterPositions, (obj, char) => {
    //   obj[char.id] = [_.round(char.fx, 2), _.round(char.fy, 2)];
    //   return obj;
    // }, {});
    // console.log(JSON.stringify(savePos))
    
    // now that we've set the positions, take out "other"
    delete characterPositions['other'];
    characterPositions = _.values(characterPositions);


    this.setState({linesByCharacter, characterPositions});
  },

  render() {
    return (
      <div className="App">
        <Visualization {...this.state} />
      </div>
    );
  }
});

export default App;
