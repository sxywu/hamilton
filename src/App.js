import React from 'react';
import _ from 'lodash';
import * as d3 from 'd3';

import Visualization from './visualizations/Visualization';
import LineHover from './LineHover';
// import Themes from './Themes';
import Section from './Section';
import SectionsData from './data/sections';
import charList from './data/char_list.json';

import ProcessGraph from './ProcessGraph';
import FilterGraph from './FilterGraph';
import PositionGraph from './PositionGraph';

var images = _.reduce(charList, (obj, character, id) => {
  try {
    // load image
    obj[id] = require('./images/' + id + '.png');
  } catch(e) {
    console.log(e);
  }
  return obj;
}, {});

var width = 1200;
var height = 16000;
var vizWidth = 710;
var padding = 20;
var sectionWidth = width - vizWidth;
var characterWidth = sectionWidth - 5 * padding;
var themeWidth = characterWidth;
var characterHeight = 440;
var themeHeight = 250;
var prevSection = null;
var currentSection = null;
var sections = SectionsData(width, vizWidth, sectionWidth, images);

var App = React.createClass({

  getInitialState() {

    return {
      // original data
      hoverLookup: [],
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
      hovered: null,
      playing: null,
      random: false,
      update: true,
      useForce: true,
    };
  },

  componentWillMount() {
    var {lines, songs, hoverLookup} = ProcessGraph.processLinesSongs(width);

    var {characters, conversations} = ProcessGraph.processCharacters(lines, characterWidth, characterHeight);

    var {diamonds, groupedThemes} = ProcessGraph.processThemes(lines);

    this.setState({lines, songs, hoverLookup, characters, conversations, diamonds, groupedThemes});
  },

  componentDidMount() {
    this.updateSectionPositions();
    this.onScroll();
    window.addEventListener('scroll', _.throttle(this.onScroll, 100));
  },

  filterByCharacter(character) {
    // if we're not in a section, or if the seciton we're in isn't a filter section
    // then don't do anything and just return
    if (!this.state.section || !this.state.section.filter) return;

    var selectedCharacters = this.state.selectedCharacters;
    if (_.includes(selectedCharacters, character)) {
      selectedCharacters = _.without(selectedCharacters, character);
    } else {
      selectedCharacters.push(character);
    }
    selectedCharacters = _.sortBy(selectedCharacters);

    var positions = this.state.section.position(this.state,
      selectedCharacters, this.state.selectedConversation, this.state.selectedThemes);
    this.afterFilter(positions);

    this.setState(positions);
  },

  filterByConversation(id) {
    if (!this.state.section || !this.state.section.filter) return;

    var selectedConversation = this.state.selectedConversation;
    if (_.includes(selectedConversation, id)) {
      selectedConversation = _.without(selectedConversation, id);
    } else {
      selectedConversation.push(id);
    }

    var positions = this.state.section.position(this.state,
      this.state.selectedCharacters, selectedConversation, this.state.selectedThemes);
    this.afterFilter(positions);

    this.setState(positions);
  },

  filterByThemes(id) {
    if (!this.state.section || !this.state.section.filter) return;

    var selectedThemes = this.state.selectedThemes;
    if (_.includes(selectedThemes, id)) {
      selectedThemes = _.without(selectedThemes, id);
    } else {
      selectedThemes.push(id);
    }

    var positions = this.state.section.position(this.state,
      this.state.selectedCharacters, this.state.selectedConversation, selectedThemes);
    this.afterFilter(positions);

    this.setState(positions);
  },

  resetFilters() {
    if (!this.state.section || !this.state.section.filter) return;

    var selectedCharacters = [];
    var selectedConversation = [];
    var selectedThemes = [];

    var positions = this.state.section.position(this.state,
      selectedCharacters, selectedConversation, selectedThemes);
    this.afterFilter(positions);

    this.setState(positions);
  },

  afterFilter(positions) {
    positions.update = true;
    positions.useForce = true;
    positions.prevTop = this.state.top;
    positions.hovered = null;
    if (this.state.section.id === 'filter_tool') {
      // only update the height of a section if it's the final filter tool
      positions.section = PositionGraph.updateSectionWithHeight(this.state.section, positions.linePositions);
    }
  },

  playLines(playing) {
    if (playing && this.state.playing) {
      // if already playing, just modify the current time
      playing = Object.assign(this.state.playing, {currentTime: playing.currentTime});
    } else if (playing) {
      // if it just started playing
      var lines = _.filter(this.state.linePositions, line =>
        _.includes(playing.lineIds, line.id));
      playing = Object.assign(playing, {lines});
    }
    this.setState({playing, update: false});
  },

  hoverLine(hoveredLine) {
    if (hoveredLine === this.state.hovered) return;
    this.setState({hovered: hoveredLine, update: false});
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
    var selectedCharacters = this.state.selectedCharacters;
    var selectedConversation = this.state.selectedConversation;
    var selectedThemes = this.state.selectedThemes;
    if (section && !currentSection) {
      // if we just entered a new section (so the prev current section was null), position
      // if it's new section, reset filters
      if (section !== prevSection) {
        selectedCharacters = positions.selectedCharacters = [];
        selectedConversation = positions.selectedConversation = [];
        selectedThemes = positions.selectedThemes = [];
      }

      positions = Object.assign(positions,
        section.position(this.state, selectedCharacters, selectedConversation, selectedThemes));
      positions.random = positions.random || false;
      positions.prevTop = section.consecutive ? 0 : this.state.top || scrollTop;
      positions.top = (section.consecutive ? 0 : section.top) + (positions.top || 0);
      positions.section = section;
      positions.useForce = true;
    } else if (section && section.consecutive && section !== currentSection) {
      // if we just entered a consecutive section for the first time
      // don't pass in any filters, only want filters at the beginning
      positions = section.position(this.state, [], [], [], section.consecutive);
      positions.prevTop = this.state.top;
      positions.section = section;
      positions.useForce = false;
    } else if (!section && random) {
      // if there's no section, but there was previously a section
      positions = PositionGraph.positionLinesRandomly(this.state.lines, width);
      positions.random = random;
      positions.prevTop = currentSection && currentSection.consecutive ?
        scrollTop : (this.state.top || scrollTop);
      positions.top = scrollTop;
      positions.section = null;
      positions.useForce = true;
    }

    if (_.size(positions)) {
      prevSection = currentSection;
      currentSection = section;
      positions.hovered = null;
      positions.update = true;

      this.setState(positions);
    }
  },

  render() {
    var style = {
      width,
      height,
      margin: 'auto',
      color: this.state.fontColor,
      position: 'relative',
    };
    var sectionStyle = {
      top: 0,
      width,
      position: 'absolute',
      pointerEvents: 'none',
    };

    var styleProps = {
      images,
      gray: 'rgb(238, 238, 238)',
      medGray: 'rgb(204, 204, 204)',
      fontColor: 'rgb(51, 51, 51)',
      vizType: 'image',
      vizWidth,
      sectionWidth,
      width,
      height,
      characterWidth,
      characterHeight,
      themeWidth,
      themeHeight,
      headerFont: 'Open Sans',
      bodyFont: 'Libre Baskerville',
    };
    var eventProps = {
      playLines: this.playLines,
      hoverLine: this.hoverLine,
      onSelectCharacter: this.filterByCharacter,
      onSelectConversation: this.filterByConversation,
      onSelectTheme: this.filterByThemes,
      resetFilters: this.resetFilters,
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
        <LineHover {...this.state} {...styleProps} />
      </div>
    );
  }
});

export default App;
