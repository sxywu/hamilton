import React from 'react';
import * as d3 from "d3";

var duration = 1000;
var Visualization = React.createClass({
  componentDidMount() {
    this.container = d3.select(this.refs.songs);
    this.updateRender();
  },

  componentDidUpdate() {
    this.updateRender();
  },

  updateRender() {

    this.text = this.container.selectAll('text')
      .data(this.props.songPositions, d => d.id);

    this.text.exit().remove();

    this.text = this.text.enter()
      .append('text')
      .attr('text-anchor', 'end')
      .attr('dy', '.35em')
      .attr('x', d => d.x - 10)
      .attr('y', d => d.y)
      .text(d => {
        var name = d.name;
        var nameLength = 20;
        if (name.length > nameLength) {
          name = name.substring(0, nameLength) + '...';
        }
        return name;
      }).merge(this.text)
      .transition().duration(duration)
      .ease(d3.easeSin)
      .attr('x', d => d.x - 10)
      .attr('y', d => d.y);
  },

  render() {
    return (
      <g ref='songs' className='songs' />
    );
  }
});

export default Visualization;
