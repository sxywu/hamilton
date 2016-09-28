import React from 'react';
import _ from 'lodash';
import Diamonds from './Diamonds';

var Characters = React.createClass({

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
        return (
          <span style={diamondStyle}>
            <svg width={diamond.size} height={diamond.size}>
              <Diamonds diamondPositions={[diamond]} />
            </svg>
            {diamond.length}
          </span>
        );
      });

      return (
        <div>
          <h2>{theme.name}</h2>
          <h3>{diamonds}</h3>
        </div>
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
