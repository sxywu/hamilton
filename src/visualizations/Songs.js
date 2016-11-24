import React from 'react';
import * as d3 from "d3";

var duration = 1000;
var Visualization = React.createClass({
  componentDidMount() {
    this.container = d3.select(this.refs.container);
    this.updateRender();
  },

  componentDidUpdate() {
    this.updateRender();
  },

  updateRender() {
    this.songs = this.container.selectAll('.song')
      .data(this.props.songPositions, d => d.id);

    this.songs.exit().remove();

    this.songs = this.songs.enter().append('g')
      .classed('song', true)
      .merge(this.songs)
      .attr('transform', d => 'translate(' + [d.x, d.y] + ')');
  },

  render() {
    return (
      <g className='songs' ref='container' />
    );
  }
});

export default Visualization;
