import React, { Component } from 'react';
import _ from 'lodash';
import * as d3 from "d3";

import Visualization from './Visualization';
// load the data
import charList from './data/char_list.json';
import characters from './data/characters.json';
import lines from './data/lines.json';

var width = 800;
var height = 800;
// var color = d3.scaleOrdinal(d3.schemeCategory20);
var radius = 3;
class App extends Component {

  componentWillMount() {
    // get the length of each set of lines
    // and use that for the radius
    var linesArray = _.values(lines);
    var maxSize = _.maxBy(linesArray, 3)[3];
    var minSize = _.minBy(linesArray, 3)[3];
    var radiusScale = d3.scaleLinear()
      .domain([minSize, maxSize])
    	.range([radius, radius * 5]);

    // now duplicate any of the lines sung by multiple characters
    this.linesByCharacter = _.chain(lines)
      .map((line, id) => {
        // get all characters from the line
        return _.map(line[1][0], (character) => {
        	return {
            id: character + ':' + id,
            lineId: id,
            characterId: character,
            radius: radiusScale(line[3]),
            x: width / 2,
            y: height / 2,
            data: line,
          };
        });
      }).flatten().value();

    // get only the top 12 individuals by line count
    this.topChars = _.chain(characters.characters)
      .map((lines, character) => [character, lines.length])
      // only keep individual characters' lines
      .filter((character) => charList[character[0]][2] === 'individual')
      .sortBy((character) => -character[1])
      .map(0).take(12).value();
    this.topChars.push('other');

    // now position the characters
    var perRow = 4;
    var rowWidth = width / (perRow + 1);
    this.charPos = _.reduce(this.topChars, (obj, character, i) => {
      obj[character] = {
        id: character,
        name: charList[character] ? charList[character][0] : 'Other',
        x: (i % perRow + .5) * rowWidth,
        y: (Math.floor(i / perRow) + .5) * rowWidth,
        radius: radius * 10,
      };
      if (character !== 'other') {
        // only load image if it's a character
        obj[character].image = require('./images/' + character + '.png');
      }
      return obj;
    }, {});

    // now assign the character positions to all nodes
    _.each(this.linesByCharacter, line => {
      var pos = this.charPos[line.characterId] || this.charPos['other'];
      line.focusX = pos.x;
      line.focusY = pos.y;
    });
  }

  render() {
    return (
      <div className="App">
        <Visualization />
      </div>
    );
  }
}

export default App;
