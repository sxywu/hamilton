import React from 'react';
import _ from 'lodash';
import Diamonds from './Diamonds';

var Characters = React.createClass({
  hoverTheme() {

  },

  render() {
    var style = {
      padding: 20,
      textAlign: 'center',
    };
    var diamondStyle = {
      padding: '0 5px',
    };
    var themes = _.map(this.props.groupedThemes, theme => {
      var diamonds = _.map(theme.diamonds, diamond => {
        var props = {update: true, diamondPositions: [diamond]};
        return (
          <span style={diamondStyle}>
            <svg width={diamond.size} height={diamond.size}>
              <Diamonds {...props} hover={this.hoverTheme} />
            </svg>
            {diamond.length}
          </span>
        );
      });

      return (
        <h2>{theme.name}: {diamonds}</h2>
      );
    });

    return (
      <div style={style}>
        {themes}
      </div>
    );
  }
});

export default Characters;
