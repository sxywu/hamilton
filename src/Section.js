import React from 'react';
import * as d3 from "d3";
var Remarkable = require('remarkable');
var md = new Remarkable({linkTarget: '_new', html: true});

var Section = React.createClass({

  render() {
    var style = {
      width: this.props.width,
      paddingTop: '40vh',
      paddingBottom: '25vh',
      fontSize: 16,
      lineHeight: 1.6,
      paddingLeft: 20,
      marginLeft: this.props.vizAlign === 'left' ? this.props.left : 0,
      pointerEvents: 'auto',
    };
    var rawMarkup = { __html: md.render(this.props.text)};

    return (
      <div style={style} className='section' id={this.props.id}
        dangerouslySetInnerHTML={rawMarkup} />
    );
  }
});

export default Section;
