import React from 'react';
import _ from 'lodash';
import * as d3 from "d3";

import Visualization from './Visualization';
import Characters from './Characters';
import ProcessGraph from './ProcessGraph';
// load the data
import charList from './data/char_list.json';
import songList from './data/song_list.json';
import themeList from './data/theme_list.json';
import rawCharacters from './data/characters.json';
import rawLines from './data/lines.json';
import rawThemes from './data/themes.json';
// positions
import charPositions from './data/char_positions.json';
// import lineCharPositions from './data/line_char_positions.json';
// import lineSongPositions from './data/line_song_positions.json';

var color = d3.scaleOrdinal(d3.schemeCategory20);
var linkScale = d3.scaleLinear().range([2, 8]);

var App = React.createClass({

  getInitialState() {
    return {
      lines: [],
      diamonds: [],
      groupedThemes: [],
      characterNodes: [],
      characterLinks: [],
      linePositions: [],
      diamondPositions: [],
      songPositions: [],
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
            conversing: null,
            fill: color(character),
            trueFill: color(character),
            selected: true,
            data: line,
          };
        });
      }).flatten().value();
    var linesById = _.groupBy(lines, 'lineId');

    // character nodes
    var characterNodes = _.map(rawCharacters.characters, (lines, id) => {
      var character = charList[id];
      var name = character[0];
      var initials = _.map(name.split(' '), 0).join('');

      return {
        id,
        name,
        initials,
        radius: 20,
        color: color(id),
        image: character[3] && require('./images/' + id + '.png'),
        selected: true,
      };
    });
    var charactersById = _.keyBy(characterNodes, 'id');

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
        source, target, weight
      };
    });

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
            fill: color(theme),
            keys: lineKey[0],
            lines: lineKey[1],
          }
        });
      }).filter().flatten()
      .value();

    var songs = _.reduce(songList, (obj, name, id) => {
      obj[id] = {
        id,
        name,
      }
      return obj;
    }, {});

    this.filterAndPosition(this.state.selectedCharacters, this.state.selectedConversation,
      characterNodes, characterLinks, lines, diamonds, songs);
  },

  filterByCharacter(character) {
    var selectedCharacters = this.state.selectedCharacters;
    if (_.includes(selectedCharacters, character)) {
      selectedCharacters = _.without(selectedCharacters, character);
    } else {
      selectedCharacters.push(character);
    }
    selectedCharacters = _.sortBy(selectedCharacters);
    var selectedConversation = [];

    this.filterAndPosition(selectedCharacters, selectedConversation,
      this.state.characterNodes, this.state.characterLinks,
      this.state.lines, this.state.diamonds, this.state.songs);
  },

  filterByConversation(id) {
    var selectedConversation = this.state.selectedConversation;
    if (_.includes(selectedConversation, id)) {
      selectedConversation = _.without(selectedConversation, id);
    } else {
      selectedConversation.push(id);
    }
    var selectedCharacters = [];

    this.filterAndPosition(selectedCharacters, selectedConversation,
      this.state.characterNodes, this.state.characterLinks,
      this.state.lines, this.state.diamonds, this.state.songs);
  },

  filterAndPosition(selectedCharacters, selectedConversation,
    characters, conversations, lines, diamonds, songs) {
    var {filteredLines, filteredDiamonds} = ProcessGraph.filterBySelectedCharacter(
      selectedCharacters, selectedConversation, lines, diamonds);
    var {characterNodes, characterLinks} = ProcessGraph.updateCharacterOpacity(
      filteredLines, filteredDiamonds, characters, conversations);
    var {linePositions, songPositions, diamondPositions} =
      ProcessGraph.positionLinesBySong(filteredLines, filteredDiamonds, songs);

    console.log(selectedCharacters, selectedConversation)
    this.setState({
      selectedCharacters, selectedConversation,
      linePositions, songPositions, diamondPositions,
      characterNodes, characterLinks,
      lines, diamonds, songs
    });
  },

  render() {
    var width = 1200;
    var height = 2400;
    var sideStyle = {
      width: width / 3,
      height: height / 4,
      display: 'inline-block',
      verticalAlign: 'top',
    };
    var characterStyle = {
      width: width / 3,
      height: height / 4,
    };
    var vizStyle = {
      width: width / 3 * 2,
      height: height,
    }

    return (
      <div className="App">
        <div style={sideStyle}>
          <Characters {...this.state} {...this.props} {...characterStyle}
            onSelectCharacter={this.filterByCharacter}
            onSelectConversation={this.filterByConversation} />
        </div>
        <Visualization {...this.state} {...vizStyle}
          onSelectCharacter={this.filterByCharacter} />
      </div>
    );
  }
});

export default App;
