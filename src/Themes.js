import React from 'react';
import _ from 'lodash';
import Diamonds from './Diamonds';

var Characters = React.createClass({
  shouldComponentUpdate(nextProps) {
    return nextProps.update;
  },
  
  selectTheme(diamond) {
    this.props.onSelectTheme(diamond.id);
  },

  render() {
    var style = {
      display: 'inline-block',
      width: this.props.width,
      height: this.props.height,
      verticalAlign: 'top',
      textAlign: 'center',
    };
    var groupStyle = {
      display: 'inline-block',
      padding: '0 15px',
    };
    var diamondStyle = {
      padding: '0 5px',
      cursor: 'pointer',
    };
    var themes = _.map(this.props.groupedThemes, theme => {
      var diamonds = _.map(theme.diamonds, diamond => {
        var props = {update: true, diamondPositions: [diamond]};
        return (
          <svg style={diamondStyle} onClick={this.selectTheme.bind(this, diamond)}
            width={diamond.size} height={diamond.size}>
            <Diamonds {...props} hover={this.props.onHoverTheme} />
          </svg>
        );
      });

      return (
        <h3 style={groupStyle}>
          {theme.name}
          <br />
          {diamonds}
        </h3>
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
