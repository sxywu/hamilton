import React from 'react';
import * as d3 from "d3";
import _ from 'lodash';

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
    this.container.attr('transform', 'translate(' + [0, this.props.top] + ')');

    this.songs = this.container.selectAll('.song')
      .data(this.props.songPositions, d => d.id);

    this.songs.exit().remove();

    var enter = this.songs.enter().append('g')
      .classed('song', true);
    enter.append('text')
      .classed('header', true)
      .attr('x', 5)
      .attr('y', -2)
      .attr('font-size', 12)
      .text(d => d.name);

    this.songs = enter.merge(this.songs)
      .attr('transform', d => 'translate(' + [d.x, d.y] + ')');

    this.updateRows();
    this.updateColumns();
  },

  updateRows() {
    var rows = this.songs.selectAll('.row')
      .data(d => {
        return _.map(d.rows, row => {
          return {
            x2: d.width,
            y1: row,
            y2: row,
          };
        });
      });
    rows.exit().remove();
    rows.enter().append('line')
      .classed('row', true)
      .merge(rows)
      .attr('x2', d => d.x2)
      .attr('y1', d => d.y1)
      .attr('y2', d => d.y2)
      .attr('stroke', this.props.fontColor);
  },

  updateColumns() {
    var columns = this.songs.selectAll('.column')
      .data(d => {
        return _.map(d.columns, column => {
          return {
            x1: column[1],
            x2: column[1],
            y2: d.height,
            strokeWidth: column[0],
          };
        });
      });
    columns.exit().remove();
    columns.enter().append('line')
      .classed('column', true)
      .attr('stroke', this.props.fontColor)
      .merge(columns)
      .attr('x1', d => d.x1)
      .attr('x2', d => d.x2)
      .attr('y2', d => d.y2)
      .attr('stroke-width', d => d.strokeWidth);
  },

  render() {
    return (
      <g className='songs' ref='container' />
    );
  }
});

export default Visualization;
