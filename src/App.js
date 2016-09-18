import React from 'react';
import _ from 'lodash';
import * as d3 from "d3";

import Visualization from './Visualization';
// load the data
import charList from './data/char_list.json';
// import charPositions from './data/char_positions.json';
// import lineCharPositions from './data/line_char_positions.json';
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
    var lineWidth = 3;
    var lineHeight = 3;
    var padding = {x: 17, y: lineHeight * 2};
    var s = 1;
    var x = lineWidth * 6;
    var y = 100;
    // duplicate any of the lines sung by multiple characters
    var linesByCharacter = _.chain(lines)
      .map((line, lineId) => {
        // get all characters from the line
        return _.map(line[1][0], (character) => {
          var id = character + '/' + lineId;
          // var pos = lineCharPositions[id];
          var songNum = parseInt(lineId.split(':')[0], 10);
          var startLine = parseInt(lineId.split(':')[1].split('-')[0], 10);
          var endLine = parseInt(lineId.split(':')[1].split('-')[1], 10) || startLine;

          // if next song
          if (songNum !== s) {
            s = songNum;
            x += padding.x;
            y = 100;
          }
          if (y > 600) {
            x += 2 * lineWidth + 1;
            y = 100;
          }
          var start = y;
          var length = lineHeight * (endLine - startLine);
          y += length + padding.y;

        	return {
            id,
            lineId,
            characterId: character,
            fx: x,
            fy: start,
            radius: lineWidth,
            length,
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
