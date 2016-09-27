import React from 'react';
import _ from 'lodash';

import Visualization from './Visualization';
import Characters from './Characters';
import ProcessGraph from './ProcessGraph';

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
    var {lines, songs} = ProcessGraph.processLinesSongs();

    var {characterNodes, characterLinks} = ProcessGraph.processCharacters(lines);

    var {diamonds} = ProcessGraph.processThemes();

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
