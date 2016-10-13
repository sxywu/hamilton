import React from 'react';
import * as d3 from "d3";

var duration = 1000;
var Visualization = React.createClass({
  componentDidMount() {
    this.textContainer = d3.select(this.refs.text);
    this.rectContainer = d3.select(this.refs.rect);
    this.updateText();
    this.updateRect();
  },

  componentDidUpdate() {
    this.updateText();
    this.updateRect();
  },

  updateRect() {
    this.rect = this.rectContainer
      .attr('transform', 'translate(0, 15)')
      .selectAll('rect').data(this.props.songs, d => d.id);
    this.rect.exit().remove();

    this.rect = this.rect.enter()
      .append('rect')
      .attr('x', d => d.x)
      .attr('width', d => d.width)
      .attr('height', 10)
      .merge(this.rect)
      .attr('fill', d => d.selected ? d.color : this.props.gray);

  },

  updateText() {

    this.text = this.textContainer.selectAll('text')
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
        var nameLength = 18;
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
      <g className='songs'>
        <g ref='rect' className='rect' />
        <g ref='text' className='text' />
      </g>
    );
  }
});

export default Visualization;
