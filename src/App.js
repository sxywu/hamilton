import React from 'react';
import _ from 'lodash';

import Visualization from './Visualization';
import Characters from './Characters';
import Themes from './Themes';
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

    var {diamonds, groupedThemes} = ProcessGraph.processThemes();

    this.filterAndPosition(this.state.selectedCharacters, this.state.selectedConversation,
      characterNodes, characterLinks, lines, songs, diamonds, groupedThemes);
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
      this.state.lines, this.state.songs, this.state.diamonds, this.state.groupedThemes);
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
      this.state.lines, this.state.songs, this.state.diamonds, this.state.groupedThemes);
  },

  filterAndPosition(selectedCharacters, selectedConversation,
    characters, conversations, lines, songs, diamonds, themes) {
    var {filteredLines, filteredDiamonds} = ProcessGraph.filterBySelectedCharacter(
      selectedCharacters, selectedConversation, lines, diamonds);
    var {characterNodes, characterLinks, groupedThemes} = ProcessGraph.updateOpacity(
      filteredLines, filteredDiamonds, characters, conversations, themes);
    var {linePositions, songPositions, diamondPositions} =
      ProcessGraph.positionLinesBySong(filteredLines, filteredDiamonds, songs);

    this.setState({
      selectedCharacters, selectedConversation,
      linePositions, songPositions, diamondPositions,
      characterNodes, characterLinks,
      lines, songs, diamonds, groupedThemes,
    });
  },

  render() {
    var width = 1200;
    var vizHeight = 2400;
    var sideHeight = 800;
    var sideStyle = {
      width: width / 3,
      height: sideHeight,
      display: 'inline-block',
      verticalAlign: 'top',
    };
    var characterStyle = {
      width: width / 3,
      height: sideHeight / 2,
    };
    var themeStyle = {
      width: width / 3,
      height: sideHeight / 2,
    };
    var vizStyle = {
      width: width / 3 * 2,
      height: vizHeight,
    }

    return (
      <div className="App">
        <div style={sideStyle}>
          <Characters {...this.state} {...this.props} {...characterStyle}
            onSelectCharacter={this.filterByCharacter}
            onSelectConversation={this.filterByConversation} />
          <Themes {...this.state} {...this.props} {...themeStyle} />
        </div>
        <Visualization {...this.state} {...vizStyle}
          onSelectCharacter={this.filterByCharacter} />
      </div>
    );
  }
});

export default App;
