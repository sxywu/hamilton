import React from 'react';
import _ from 'lodash';
import * as d3 from 'd3';

import Visualization from './Visualization';
import Characters from './Characters';
import Themes from './Themes';
import LineSummary from './LineSummary';
import ProcessGraph from './ProcessGraph';

var App = React.createClass({

  getInitialState() {
    return {
      update: true,
      hovered: null,
      sideHovered: null,
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
      selectedThemes: [],
    };
  },

  componentWillMount() {
    var {lines, songs} = ProcessGraph.processLinesSongs();

    var {characterNodes, characterLinks} = ProcessGraph.processCharacters(lines);

    var {diamonds, groupedThemes} = ProcessGraph.processThemes(lines);

    this.filterAndPosition(this.state.selectedCharacters,
      this.state.selectedConversation, this.state.selectedThemes,
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
      this.state.selectedThemes, this.state.characterNodes, this.state.characterLinks,
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
      this.state.selectedThemes, this.state.characterNodes, this.state.characterLinks,
      this.state.lines, this.state.songs, this.state.diamonds, this.state.groupedThemes);
  },

  filterByThemes(id) {
    var selectedThemes = this.state.selectedThemes;
    if (_.includes(selectedThemes, id)) {
      selectedThemes = _.without(selectedThemes, id);
    } else {
      selectedThemes.push(id);
    }

    this.filterAndPosition(this.state.selectedCharacters, this.state.selectedConversation,
      selectedThemes, this.state.characterNodes, this.state.characterLinks,
      this.state.lines, this.state.songs, this.state.diamonds, this.state.groupedThemes);
  },

  filterAndPosition(selectedCharacters, selectedConversation, selectedThemes,
    characters, conversations, lines, songs, diamonds, themes) {
    var {filteredLines, filteredDiamonds} = ProcessGraph.filterBySelectedCharacter(
      selectedCharacters, selectedConversation, lines, diamonds);
    var {filteredLines2, filteredDiamonds2} = ProcessGraph.filterBySelectedThemes(
      selectedThemes, filteredLines, filteredDiamonds);
    var {characterNodes, characterLinks, groupedThemes} =
      ProcessGraph.updateOpacity(filteredLines2, filteredDiamonds2, characters, conversations, themes);
    var {linePositions, songPositions, diamondPositions} =
      ProcessGraph.positionLinesBySong(filteredLines2, filteredDiamonds2, songs);

    this.setState({
      update: true,
      selectedCharacters, selectedConversation, selectedThemes,
      linePositions, songPositions, diamondPositions,
      characterNodes, characterLinks,
      lines, songs, diamonds, groupedThemes,
    });
  },

  hoverLine(hoveredLine) {
    // TODO: fix x-position to not be hardcoded
    var hovered = hoveredLine && {
      title: hoveredLine.characterName,
      lines: hoveredLine.data[2],
      x: hoveredLine.x,
      y: hoveredLine.y,
    };
    this.setState({hovered, update: false});
  },

  hoverTheme(hoveredTheme) {
    var hovered = hoveredTheme && {
      title: hoveredTheme.themeType,
      lines: hoveredTheme.lines,
      x: hoveredTheme.positions[0].x,
      y: hoveredTheme.positions[0].y,
    }
    this.setState({hovered, update: false});
  },

  hoverSideTheme(hoveredTheme) {
    var sideHovered = hoveredTheme && {
      lines: hoveredTheme.lines,
      x: d3.event.x,
      y: d3.event.y,
    }
    this.setState({sideHovered, update: false});
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
      textAlign: 'center',
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
      position: 'relative',
      display: 'inline-block',
    }

    return (
      <div className="App">
        <div style={sideStyle}>
          <h1>Filters</h1>
          <h2>Characters</h2>
          <Characters {...this.state} {...this.props} {...characterStyle}
            onSelectCharacter={this.filterByCharacter}
            onSelectConversation={this.filterByConversation} />
          <h2>Recurring Themes</h2>
          <Themes {...this.state} {...this.props} {...themeStyle}
            onHoverTheme={this.hoverSideTheme}
            onSelectTheme={this.filterByThemes} />
          <LineSummary {...this.state.sideHovered} />
        </div>
        <div style={vizStyle}>
          <Visualization {...this.state} {...vizStyle}
            onHoverLine={this.hoverLine}
            onHoverTheme={this.hoverTheme} />
          <LineSummary {...this.state.hovered} />
        </div>
      </div>
    );
  }
});

export default App;
