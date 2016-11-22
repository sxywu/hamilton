import React from 'react';
import _ from 'lodash';
import * as d3 from 'd3';

import Visualization from './visualizations/Visualization';
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
var characterWidth = 460;
// var themeWidth = width - characterWidth;
var characterHeight = 440;
var prevSection = null;
var currentSection = null;
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
      // render properties
      prevTop: null,
      top: null,
      random: false,
    };
  },

  componentWillMount() {
    var {lines, songs} = ProcessGraph.processLinesSongs(width);

    var {characters, conversations} = ProcessGraph.processCharacters(lines, characterWidth, characterHeight);

    var {diamonds, groupedThemes} = ProcessGraph.processThemes(lines);

    this.setState({lines, songs, characters, conversations, diamonds, groupedThemes});
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

    var positions = this.state.section.position(this.state,
      selectedCharacters, this.state.selectedConversation, this.state.selectedThemes);
    positions.selectedCharacters = selectedCharacters;
    this.setState(positions);
  },

  filterByConversation(id) {
    var selectedConversation = this.state.selectedConversation;
    if (_.includes(selectedConversation, id)) {
      selectedConversation = _.without(selectedConversation, id);
    } else {
      selectedConversation.push(id);
    }

    var positions = this.state.section.position(this.state,
      this.state.selectedCharacters, selectedConversation, this.state.selectedThemes);
    positions.selectedConversation = selectedConversation;
    this.setState(positions);
  },

  filterByThemes(id) {
    var selectedThemes = this.state.selectedThemes;
    if (_.includes(selectedThemes, id)) {
      selectedThemes = _.without(selectedThemes, id);
    } else {
      selectedThemes.push(id);
    }

    var positions = this.state.section.position(this.state,
      this.state.selectedCharacters, this.state.selectedConversation, selectedThemes);
    positions.selectedThemes = selectedThemes;
    this.setState(positions);
  },

  resetFilters() {
    var selectedCharacters = [];
    var selectedConversation = [];
    var selectedThemes = [];

    var positions = this.state.section.position(this.state,
      selectedCharacters, selectedConversation, selectedThemes);
    positions.selectedCharacters = [];
    positions.selectedConversation = [];
    positions.selectedThemes = [];
    this.setState(positions);
  },

  selectLines(lineIds) {
    var linePositions = PositionGraph.positionSelectLines(
      lineIds, this.state.linePositions, 2, width, vizWidth);
    if (!lineIds) {
      linePositions = this.positionByVizType(this.state.vizType);
    };
    this.setState({linePositions});
  },

  updateSectionPositions() {
    var bodyRect = document.body.getBoundingClientRect();
    _.each(sections, section => {
      var sectionRect = d3.select('.section#' + section.id).node().getBoundingClientRect();
      var top = Math.max(0, sectionRect.top - bodyRect.top);
      var bottom = top + sectionRect.height;

      Object.assign(section, {top, bottom});
    });
  },

  onScroll() {
    var scrollTop = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;

    var random = false;
    var section = _.find(sections, (section, i) => {
      if (section.top <= scrollTop && scrollTop < section.bottom) {
        // if within a section, return that
        return true;
      } else if (section.bottom <= scrollTop &&
        sections[i + 1] && scrollTop < sections[i + 1].top) {
        // if between the bottom of a section and top of the next
        // only concerned about whether to randomly position
        random = section.random;
      }
      return false;
    });

    var positions = {};
    // if we just entered a new section (so the prev current section was null), position
    if (section && !currentSection) {
      var selectedCharacters = this.state.selectedCharacters;
      var selectedConversation = this.state.selectedConversation;
      var selectedThemes = this.state.selectedThemes;

      // if it's new section, reset filters
      if (section !== prevSection) {
        selectedCharacters = positions.selectedCharacters = [];
        selectedConversation = positions.selectedConversation = [];
        selectedThemes = positions.selectedThemes = [];
      }

      positions = section.position(this.state, selectedCharacters,
        selectedConversation, selectedThemes);
      positions.random = positions.random || false;
      positions.prevTop = section.consecutive ? 0 : this.state.top || scrollTop;
      positions.top = section.consecutive ? 0 : section.top;
      positions.section = section;
    } else if (!section && currentSection && random) {
      // if there's no section, but there was previously a section
      positions = PositionGraph.positionLinesRandomly(this.state.lines, width);
      positions.random = random;
      positions.prevTop = this.state.top || scrollTop;
      positions.top = scrollTop;
      positions.section = null;
    }

    if (_.size(positions)) {
      prevSection = currentSection;
      currentSection = section;

      this.setState(positions);
    }
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
      sectionWidth,
      width,
      characterWidth,
      characterHeight,
    };
    var eventProps = {
      selectLines: this.selectLines,
      onSelectCharacter: this.filterByCharacter,
      onSelectConversation: this.filterByConversation,
    };

    var sectionsEl = _.map(sections, section => {
      return (<Section {...this.state} {...styleProps} {...eventProps} {...section} />);
    });

    return (
      <div ref='app' style={style}>
        <Visualization {...this.state} {...styleProps} {...eventProps} />
        <div className='sections' style={sectionStyle}>
          {sectionsEl}
        </div>
      </div>
    );
  }
});

export default App;
