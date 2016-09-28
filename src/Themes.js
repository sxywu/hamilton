import React from 'react';
import _ from 'lodash';
import Diamonds from './Diamonds';

var Characters = React.createClass({
  selectTheme(diamond) {
    diamond.selected && this.props.onSelectTheme(diamond.id);
  },

  render() {
    var style = {
      padding: 20,
    };
    var diamondStyle = {
      padding: '0 5px',
    };
    var themes = _.map(this.props.groupedThemes, theme => {
      var diamonds = _.map(theme.diamonds, diamond => {
        var props = {update: true, diamondPositions: [diamond]};
        return (
          <span style={diamondStyle} onClick={this.selectTheme.bind(this, diamond)}>
            <svg width={diamond.size} height={diamond.size}>
              <Diamonds {...props} hover={this.props.onHoverTheme} />
            </svg>
            {diamond.length}
          </span>
        );
      });

      return (
        <h3>{theme.name} {diamonds}</h3>
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
