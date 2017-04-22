import _ from 'lodash';

import FilterGraph from '../FilterGraph';
import PositionGraph from '../PositionGraph';

var padding = 20;
var marginBottom = 400;

function sections(width, vizWidth, sectionWidth, images, isMobile) {
  function positionAngelica(data, selectedCharacters, selectedConversation, highlightedSong) {
    selectedCharacters = _.chain(selectedCharacters).union(['2', '8']).sortBy().value();
    var {linePositions, songPositions, characterNodes, characterLinks} =
      FilterGraph.filterForCharacters(data, selectedCharacters, selectedConversation, highlightedSong);

    var left = isMobile ? 0 : sectionWidth;
    var {linePositions, songPositions, top} =
      PositionGraph.positionForCharacters(linePositions, songPositions,
        vizWidth, left, 0, highlightedSong);

    return {linePositions, songPositions, diamondPositions: [],
      characterNodes, characterLinks, selectedCharacters, selectedConversation, top};
  }

  function positionEliza(data, selectedThemes, highlightedSong) {
    selectedThemes = _.union(selectedThemes, ['10', '18']);
    var {linePositions, songPositions, diamondPositions, groupedThemes} =
      FilterGraph.filterForThemes(data, selectedThemes, highlightedSong);

    var left = isMobile ? 0 : sectionWidth;
    var {linePositions, songPositions, diamondPositions, top} =
      PositionGraph.positionForAll(linePositions, diamondPositions, songPositions,
        vizWidth, left, 0, highlightedSong);

    return {linePositions, songPositions, diamondPositions, groupedThemes, selectedThemes, top};
  }

  return [
    {
      id: 'filter_tool',
      style: {
        paddingTop: 0,
        height: isMobile ? 'auto' : 1300,
      },
      contentStyle: {
        padding: 10,
        backgroundColor: isMobile ? 'rgba(255, 255, 255, 0.9)' : '',
        textAlign: 'center',
      },
      filter: isMobile ? '' : 'all',
      position(data, selectedCharacters, selectedConversation, selectedThemes) {
        // if we're on mobile just do nothing
        if (isMobile) return {linePositions: [], songPositions: [], diamondPositions: []};

        var {linePositions, diamondPositions, songPositions, groupedThemes, characterNodes, characterLinks} =
          FilterGraph.filterForAll(data, selectedCharacters, selectedConversation, selectedThemes);

        if (selectedCharacters.length || selectedConversation.length || selectedThemes.length) {
          var {linePositions, songPositions, diamondPositions} =
            PositionGraph.positionForAll(linePositions, diamondPositions, songPositions,
              vizWidth, sectionWidth, 50);

          return {linePositions, songPositions, diamondPositions, groupedThemes,
            characterNodes, characterLinks, selectedCharacters, selectedConversation, selectedThemes};
        } else {
          var {linePositions} = PositionGraph.positionLinesBySong(data.lines, sectionWidth - 75, 0);
          return {linePositions, songPositions: [], diamondPositions: [], groupedThemes,
            characterNodes, characterLinks, selectedCharacters, selectedConversation, selectedThemes};
        }
      },
      text: `
  ${!isMobile ? `### Explore their stories.`: ''}

  Angelica and Eliza are only two of the stories I've found; **there are many more**. ${isMobile ? `
  I have built an interactive tool to filter every line in Hamilton by character, conversation, and theme.  Unfortunately, the tool is too computationally intensive for mobile.
  ### Make sure to explore their stories with the filter tool on desktop.
  `
  : `
  Filter by any combination of characters, conversations, and themes below to explore them.  Take advantage of the fact that some characters, conversations, or themes will disappear as you filter down; their co-appearances and co-occurrences are often times just as interesting as the songs that are left.

  <h3>
  <span class='background'>
If you get into a bad state, <span class='underline reset'>reset</span>.
  </span><br />
  <span class='background'>
↓
  </span>
  </h3>
  `
}
      `
    },
  ];
}

export default sections;
