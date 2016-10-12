import React from 'react';
import _ from 'lodash';
import Diamonds from './Diamonds';

var Characters = React.createClass({
  shouldComponentUpdate(nextProps) {
    return nextProps.update;
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
      gray: this.props.gray,
      cursor: 'pointer',
    };
    var themes = _.map(this.props.groupedThemes, theme => {
      var props = {update: true, diamondPositions: theme.diamonds};
      var diamonds = (<Diamonds {...props} {...diamondStyle}
        hover={this.props.onHoverTheme} click={this.props.onSelectTheme} />);

      return (
        <h3 style={groupStyle}>
          {theme.name}
          <br />
          <svg width={theme.svgWidth} height={theme.svgHeight}>
            {diamonds}
          </svg>
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
