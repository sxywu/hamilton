import React from 'react';
import _ from 'lodash';
import * as d3 from 'd3';

import Visualization from './visualizations/Visualization';
// import Characters from './Characters';
// import Themes from './Themes';
import Section from './Section';
import SectionsData from './data/sections';
import charList from './data/char_list.json';

import ProcessGraph from './ProcessGraph';
import FilterGraph from './FilterGraph';
import PositionGraph from './PositionGraph';


var width = 1200;
var vizWidth = 700;
var sectionWidth = width - vizWidth;
var characterWidth = 620;
// var themeWidth = width - characterWidth;
var filterHeight = 220;
var sections = SectionsData(width, vizWidth, sectionWidth);

var images = _.reduce(charList, (obj, character, id) => {
  try {
    // load image
    obj[id] = require('./images/' + id + '.png');
  } catch(e) {
    console.log(e);
  }
  return obj;
}, {});

var App = React.createClass({

  getInitialState() {
    return {
      // original data
      lines: [],
      diamonds: [],
      songs: [],
      groupedThemes: [],
      characters: [],
      conversations: [],
      // filtered data to render
      characterNodes: [],
      characterLinks: [],
      linePositions: [],
      diamondPositions: [],
      songPositions: [],
      // filters
      selectedCharacters: [],
      selectedConversation: [],
      selectedThemes: [],
    };
  },

  componentWillMount() {
    var {lines, songs} = ProcessGraph.processLinesSongs(width);

    var {characterNodes, characterLinks} = ProcessGraph.processCharacters(lines, characterWidth, filterHeight);

    var {diamonds, groupedThemes} = ProcessGraph.processThemes(lines);

    this.setState({lines, songs, characterNodes, characterLinks, diamonds, groupedThemes});
  },

  componentDidMount() {
    this.updateSectionPositions();
    this.onScroll();
    window.addEventListener('scroll', _.debounce(this.onScroll.bind(this), 100));
  },

  componentDidUpdate() {
    this.updateSectionPositions();
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
    var {filteredLines} = FilterGraph.filterLinesBySelectedCharacter(
      selectedCharacters, selectedConversation, lines);
    var {filteredLines2} = FilterGraph.filterLinesBySelectedThemes(selectedThemes, filteredLines);
    var {filteredDiamonds} = FilterGraph.filterDiamondsByRemainingLines(filteredLines2, diamonds);
    var {characterNodes, characterLinks, groupedThemes} =
      FilterGraph.updateFilterOpacities(filteredLines2, filteredDiamonds, songs,
        selectedCharacters, selectedConversation, selectedThemes,
        characters, conversations, themes);
    var {linePositions, songPositions, diamondPositions} =
      PositionGraph.positionLinesForFilter(filteredLines2, filteredDiamonds, songs, width);

    this.setState({
      selectedCharacters, selectedConversation, selectedThemes,
      linePositions, songPositions, diamondPositions,
      characters, conversations, characterNodes, characterLinks,
      lines, songs, diamonds, groupedThemes,
    });
  },

  selectLines(lineIds) {
    var linePositions = PositionGraph.positionSelectLines(
      lineIds, this.state.linePositions, 2, width, vizWidth);
    if (!lineIds) {
      linePositions = this.positionByVizType(this.state.vizType);
    };
    this.setState({linePositions});
  },

  positionByVizType(vizType) {
    var linePositions = [];
    var scrollTop = document.body.scrollTop;
    if (vizType === 'image') {
      linePositions = ProcessGraph.positionLinesAsImage(this.state.lines, width, width * .85, vizTop, vizAlign);
    } else if (vizType === 'character') {
      linePositions = ProcessGraph.positionLinesByCharacter(
        this.state.lines, width, vizTop, vizAlign, vizWidth);
    } else if (vizType === 'song') {
      linePositions = ProcessGraph.positionLinesBySong(
        this.state.lines, width, vizTop, vizAlign, vizWidth);
    } else if (vizType === 'line') {
      var positions = ProcessGraph.positionLinesForFilter(this.state.lines, [], [], vizWidth, vizTop);
      linePositions = positions.linePositions;
    } else if (vizType === 'random') {
      linePositions = ProcessGraph.positionLinesRandomly(
        this.state.lines, width, scrollTop - window.innerHeight, scrollTop + 2 * window.innerHeight);
    }

    return linePositions;
  },

  updateSectionPositions() {
    var bodyRect = document.body.getBoundingClientRect();
    _.each(sections, section => {
      var sectionRect = d3.select('.section#' + section.id).node().getBoundingClientRect();
      var top = (sectionRect.top - bodyRect.top);
      var bottom = top + sectionRect.height * (section.bottomMultiple || 0.8);
      top += window.innerHeight * (section.topMultiple || -0.35);

      Object.assign(section, {top, bottom});
    });
  },

  onScroll() {
    var scrollTop = document.body.scrollTop;
    var prevSection;
    var vizType = this.state.vizType;
    var currentTop = vizTop;
    var currentAlign = vizAlign;
    _.some(sectionPositions, section => {
      // if it's within section's top and bottom return that section
      if (section.top <= scrollTop && scrollTop < section.bottom) {
        currentAlign = section.vizAlign;
        currentTop = (currentAlign === 'bottom') ? section.bottom :
          section.top + window.innerHeight * (section.vizTopMultiple || 0.25);
        vizType = section.vizType;
        return true;
      }
      // if scrollTop is between previous section's bottom
      // and this section's top, then return
      if (prevSection && prevSection.bottom <= scrollTop && scrollTop < section.top) {
        currentTop = prevSection.bottom;
        vizType = 'random';
        return true;
      }
      prevSection = section;
    });

    if (vizTop && currentTop === vizTop) return;

    vizTop = currentTop;
    vizAlign = currentAlign;
    var linePositions = this.positionByVizType(vizType);

    this.setState({linePositions, vizType});
  },

  render() {
    var style = {
      width,
      height: 30000,
      margin: 'auto',
      color: this.state.fontColor,
    };
    var sectionStyle = {
      top: 0,
      width,
      position: 'absolute',
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
    var styleProps = {
      images,
      gray: '#eee',
      fontColor: '#333',
      vizType: 'image',
      vizWidth,
      width,
    };

    var sectionsEl = _.map(sections, section => {
      return (<Section {...section} {...styleProps} selectLines={this.selectLines} />);
    });

    return (
      <div ref='app' style={style}>
        <Visualization {...this.state} {...styleProps} />
        <div className='sections' style={sectionStyle}>
          {sectionsEl}
        </div>
      </div>
    );
  }
});

export default App;
