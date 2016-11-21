import _ from 'lodash';
import * as d3 from "d3";

var themeScale = d3.scaleLinear().range([10, 20]);
var FilterGraph = {
  updateFilterOpacities(lines, diamonds, songs,
    selectedCharacters, selectedConversation, selectedThemes,
    characterNodes, characterLinks, groupedThemes) {
    var nonSelected = _.isEmpty(selectedCharacters)
      && _.isEmpty(selectedConversation) && _.isEmpty(selectedThemes);

    var availableCharacters = _.chain(lines).map('characterId').uniq().value();
    var availableConversations = _.chain(lines).map('conversing').uniq().value();
    var selectedLines = _.filter(lines, 'selected');
    var filteredCharacters = _.chain(selectedLines)
      .map('characterId').uniq().value();
    var filteredConversation = _.chain(selectedLines)
      .map('conversing').uniq().value();

    if (!_.isEmpty(selectedThemes)) {
      // only if there are themes selected, intersect the characters and conversations
      var selectedThemeCharacters = _.chain(diamonds).filter('selected')
        .map('characterIds').flatten().uniq().value();
      var selectedThemeConversations = _.chain(diamonds).filter('selected')
        .map('conversationIds').flatten().uniq().value();
      availableCharacters = _.intersection(availableCharacters, selectedThemeCharacters);
      availableConversations = _.intersection(availableConversations, selectedThemeConversations);
      filteredCharacters = _.intersection(filteredCharacters, selectedThemeCharacters);
      filteredConversation = _.intersection(filteredConversation, selectedThemeConversations);
    }

    characterNodes = _.chain(characterNodes)
      .map((node) => {
        node.available = _.includes(availableCharacters, node.id);
        node.selected = nonSelected || _.includes(selectedCharacters, node.id);
        node.filtered = _.includes(filteredCharacters, node.id);
        return node;
      }).value();
    characterLinks = _.chain(characterLinks)
      .map((link) => {
        link.available = _.includes(availableConversations, link.id);
        link.selected = nonSelected || _.includes(selectedConversation, link.id);
        link.filtered = _.includes(filteredConversation, link.id);
        return link;
      }).value();

    var availableDiamonds = _.chain(diamonds).map('themeId').uniq().value();
    var filteredDiamonds = _.chain(diamonds).filter('selected').map('themeId').uniq().value();
    var countedDiamonds = _.countBy(diamonds, 'themeId');
    var maxDiamonds = _.chain(diamonds).countBy('themeId').values().max().value();
    themeScale.domain([0, maxDiamonds]);
    var svgSize = themeScale(maxDiamonds);
    _.each(groupedThemes, (theme) => {
      theme.svgWidth = svgSize * theme.diamonds.length;
      theme.svgHeight = svgSize;
      _.each(theme.diamonds, (diamond, i) => {
        diamond.available = _.includes(availableDiamonds, diamond.id);
        diamond.selected = nonSelected || _.includes(selectedThemes, diamond.id);
        diamond.filtered = _.includes(filteredDiamonds, diamond.id);
        diamond.length = countedDiamonds[diamond.id] || 0;

        var size = themeScale(diamond.length);
        diamond.positions = [{x: (i + .5) * svgSize, y: svgSize / 2, size: size / 2}];
      });
    });

    var availableSongs = _.chain(lines).map('songId').uniq().value();
    _.each(songs, song => {
      song.selected = _.includes(availableSongs, song.id);
    });

    return {characterNodes, characterLinks, groupedThemes};
  },

  filterLinesBySelectedCharacter(selectedCharacters, selectedConversation, lines) {
    var filteredLines = lines;
    if (!_.isEmpty(selectedCharacters)) {
      filteredLines = _.chain(lines)
        .groupBy((line) => line.songId)
        .filter((lines) => {
          // only keep the song if all the selected characters are in it
          return _.chain(lines)
            .map(line => {
              // also use this chance to update the fill based on selected characters
              line.selected = _.includes(selectedCharacters, line.characterId);
              return line.characterId;
            }).uniq()
            .intersection(selectedCharacters)
            .sortBy().isEqual(selectedCharacters)
            .value();
        }).flatten().value();
    }
    if (!_.isEmpty(selectedConversation)) {
      filteredLines = _.chain(filteredLines)
        .groupBy(line => line.songId)
        .filter(lines => {
          // if even one of the lines
          var atLeastOne = false;
          _.each(lines, line => {
            var selected = _.includes(selectedConversation, line.conversing);
            // if there's also selected characters take that into consideration
            line.selected = !_.isEmpty(selectedCharacters) ? line.selected || selected : selected;

            atLeastOne = atLeastOne || selected;
          });
          return atLeastOne;
        }).flatten().value();
    }

    if (_.isEmpty(selectedCharacters) && _.isEmpty(selectedConversation)) {
      filteredLines = _.map(filteredLines, line => {
        line.selected = true;
        return line;
      });
    }

    return {filteredLines};
  },

  filterLinesBySelectedThemes(selectedThemes, lines) {
    // first take out the themes
    var filteredLines2 = lines;
    if (!_.isEmpty(selectedThemes)) {
      filteredLines2 = _.chain(filteredLines2)
        .groupBy(line => line.songId)
        .filter(lines => {
          var atLeastOne = false;
          _.each(lines, line => {
            line.selected = line.selected && _.some(line.themes, theme =>
              _.includes(selectedThemes, theme));

            atLeastOne = atLeastOne || line.selected;
          });
          return atLeastOne;
        }).flatten().value();
    }

    return {filteredLines2};
  },

  filterDiamondsByRemainingLines(lines, diamonds) {
    var linesById = _.groupBy(lines, 'lineId');
    var filteredDiamonds = _.filter(diamonds, diamond => {
      var startLine = linesById[diamond.startLineId];
      var endLine = linesById[diamond.endLineId];
      // keep a theme if either its start or end is in a selected character's line
      diamond.selected = (startLine && _.some(startLine, 'selected')) ||
        (endLine && _.some(endLine, 'selected'));
      return startLine || endLine;
    });

    return {filteredDiamonds}
  },
};

export default FilterGraph;
