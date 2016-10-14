import React from 'react';
import _ from 'lodash';
import * as d3 from 'd3';

import Visualization from './Visualization';
import Characters from './Characters';
import Themes from './Themes';
import Section from './Section';

import sectionsData from './data/sections';
import ProcessGraph from './ProcessGraph';

import charList from './data/char_list.json';

var width = 1200;
var vizWidth = 800;
var vizTop = 0;
var vizAlign = 'center';
var sectionWidth = width - vizWidth;
var characterWidth = 620;
var themeWidth = width - characterWidth;
var filterHeight = 220;
var sectionPositions = [];

var App = React.createClass({

  getInitialState() {
    var images = _.reduce(charList, (obj, character, id) => {
      try {
        // load image
        obj[id] = require('./images/' + id + '.png');
      } catch(e) {
        console.log(e);
      }
      return obj;
    }, {});
    return {
      lines: [],
      diamonds: [],
      songs: [],
      groupedThemes: [],
      characters: [],
      conversations: [],
      characterNodes: [],
      characterLinks: [],
      linePositions: [],
      diamondPositions: [],
      songPositions: [],
      selectedCharacters: [],
      selectedConversation: [],
      selectedThemes: [],
      images,
      gray: '#eee',
    };
  },

  componentWillMount() {
    var {lines, songs} = ProcessGraph.processLinesSongs(width);

    var {characterNodes, characterLinks} = ProcessGraph.processCharacters(lines, characterWidth, filterHeight);

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

    this.filterAndPosition(selectedCharacters, this.state.selectedConversation,
      this.state.selectedThemes, this.state.characters, this.state.conversations,
      this.state.lines, this.state.songs, this.state.diamonds, this.state.groupedThemes);
  },

  filterByConversation(id) {
    var selectedConversation = this.state.selectedConversation;
    if (_.includes(selectedConversation, id)) {
      selectedConversation = _.without(selectedConversation, id);
    } else {
      selectedConversation.push(id);
    }

    this.filterAndPosition(this.state.selectedCharacters, selectedConversation,
      this.state.selectedThemes, this.state.characters, this.state.conversations,
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
      selectedThemes, this.state.characters, this.state.conversations,
      this.state.lines, this.state.songs, this.state.diamonds, this.state.groupedThemes);
  },

  resetFilters() {
    var selectedCharacters = [];
    var selectedConversation = [];
    var selectedThemes = [];

    this.filterAndPosition(selectedCharacters, selectedConversation,
      selectedThemes, this.state.characters, this.state.conversations,
      this.state.lines, this.state.songs, this.state.diamonds, this.state.groupedThemes);
  },

  filterAndPosition(selectedCharacters, selectedConversation, selectedThemes,
    characters, conversations, lines, songs, diamonds, themes) {
    var {filteredLines} = ProcessGraph.filterLinesBySelectedCharacter(
      selectedCharacters, selectedConversation, lines);
    var {filteredLines2} = ProcessGraph.filterLinesBySelectedThemes(selectedThemes, filteredLines);
    var {filteredDiamonds} = ProcessGraph.filterDiamondsByRemainingLines(filteredLines2, diamonds);
    var {characterNodes, characterLinks, groupedThemes} =
      ProcessGraph.updateFilterOpacities(filteredLines2, filteredDiamonds, songs,
        selectedCharacters, selectedConversation, selectedThemes,
        characters, conversations, themes);
    // var {linePositions, songPositions, diamondPositions} =
    //   ProcessGraph.positionLinesBySong(filteredLines2, filteredDiamonds, songs, width);
    var {linePositions, songPositions, diamondPositions} =
      ProcessGraph.positionLinesAsImage(filteredLines2, width, vizTop, vizAlign);

    this.setState({
      update: true,
      selectedCharacters, selectedConversation, selectedThemes,
      linePositions, songPositions, diamondPositions,
      characters, conversations, characterNodes, characterLinks,
      lines, songs, diamonds, groupedThemes,
    });
  },

  componentDidMount() {
    this.updateSectionPositions();
    window.addEventListener('scroll', _.debounce(this.onScroll.bind(this), 200));
  },

  componentDidUpdate() {
    this.updateSectionPositions();
  },

  updateSectionPositions() {
    var bodyRect = document.body.getBoundingClientRect();
    sectionPositions = _.map(sectionsData, section => {
      var top = d3.select('.section#' + section.id).node().getBoundingClientRect();
      top = top.top - bodyRect.top;
      return Object.assign(section, {top});
    });
  },

  onScroll() {
    var scrollTop = document.body.scrollTop;
    var section;
    _.some(sectionPositions, s => {
      if (scrollTop <= s.top) return true;
      section = s;
    });
    var currentTop = section ? section.top + (window.innerHeight * .35) : 0;
    if (currentTop === vizTop) return;

    vizTop = currentTop;
    vizAlign = section ? section.vizAlign : 'center';
    this.filterAndPosition(this.state.selectedCharacters, this.state.selectedConversation,
      this.state.selectedThemes, this.state.characters, this.state.conversations,
      this.state.lines, this.state.songs, this.state.diamonds, this.state.groupedThemes);
  },

  render() {
    var style = {
      width,
      height: 30000,
      margin: 'auto',
    };
    var headerStyle = {
      width,
      top: 0,
      textAlign: 'center',
      marginTop: '25vh',
      marginBottom: '40vh',
      position: 'absolute',
      padding: '40px 0',
      backgroundColor: 'rgba(255, 255, 255, 0.75)',
    };
    var sectionStyle = {
      width: 900,
      position: 'absolute',
      top: width,
      pointerEvents: 'none',
    };


    // var sideStyle = {
    //   width,
    //   height: filterHeight,
    //   verticalAlign: 'top',
    // };
    // var characterStyle = {
    //   width: characterWidth,
    //   height: filterHeight,
    // };
    // var themeStyle = {
    //   width: themeWidth,
    //   height: filterHeight,
    //   display: 'inline-block',
    // };
    // var resetFilter = this.state.selectedCharacters.length ||
    //   this.state.selectedConversation.length || this.state.selectedThemes.length;
    // var resetFilterStyle = {
    //   color: resetFilter ? '#000' : this.state.gray,
    //   cursor: resetFilter ? 'pointer' : 'default',
    // };

    // <div style={{textAlign: 'center'}}>
    //   <h1>Filters</h1>
    //   <h3 style={resetFilterStyle} onClick={this.resetFilters}>(reset filters)</h3>
    // </div>
    // <div style={sideStyle}>
    //   <Characters {...this.state} {...this.props} {...characterStyle}
    //     onSelectCharacter={this.filterByCharacter}
    //     onSelectConversation={this.filterByConversation} />
    //   <Themes {...this.state} {...this.props} {...themeStyle}
    //     onSelectTheme={this.filterByThemes} />
    // </div>
    //
    var sections = _.map(sectionsData, section => {
      return (<Section {...section} width={sectionWidth} left={vizWidth} />);
    });

    return (
      <div ref='app' style={style}>
        <Visualization {...this.state} />
        <div className='header' style={headerStyle}>
          <h1 style={{fontSize: 36, lineHeight: '48px'}}>
            An Interactive Visualization of<br />
            Every Line in Hamilton
          </h1>
        </div>
        <div className='sections' style={sectionStyle}>
          {sections}
        </div>
      </div>
    );
  }
});

export default App;
