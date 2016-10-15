import React from 'react';
import * as d3 from "d3";
import charList from './data/char_list.json';
import chroma from 'chroma-js';
var Remarkable = require('remarkable');
var md = new Remarkable({linkTarget: '_new', html: true});

var Section = React.createClass({

  componentDidMount() {
    // use this section to post-process for music
    var color = this.props.fontColor;
    d3.select(this.refs.section)
      .selectAll('.music')
      .each(function() {
        var character = d3.select(this).attr('data-char');
        var background = charList[character][4];
        if (chroma.contrast(background, color) < 4.5) {
          // if the contrast isn't enough, make the color white isntead
          color = '#fff';
        }
        d3.select(this).selectAll('span')
          .style('background', background)
          .style('color', color)
          .style('padding', '3px 6px')
          .style('font-weight', 400)
          .style('line-height', 1.8);
      });
  },

  render() {
    var padding = 10;
    var style = this.props.style || {
      width: this.props.width - 2 * padding,
      marginTop: '80vh',
      fontSize: 16,
      lineHeight: 1.6,
      padding,
      marginLeft: this.props.vizAlign === 'left' ? this.props.left : 0,
      pointerEvents: 'auto',
      color: this.props.fontColor,
      backgroundColor: 'rgba(255, 255, 255, 0.75)',
    };
    var rawMarkup = { __html: md.render(this.props.text)};

    return (
      <div style={style} ref='section' className='section'
        id={this.props.id}
        dangerouslySetInnerHTML={rawMarkup} />
    );
  }
});

export default Section;
