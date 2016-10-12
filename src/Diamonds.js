import React from 'react';
import * as d3 from "d3";

var duration = 1000;
var Themes = React.createClass({
  shouldComponentUpdate(nextProps) {
    return nextProps.update;
  },

  componentDidMount() {
    this.containers = d3.select(this.refs.diamonds);
    this.updateRender();
  },

  componentDidUpdate() {
    this.updateRender();
  },

  updateRender() {

    this.diamonds = this.containers.selectAll('g')
      .data(this.props.diamondPositions, (d) => d.id);

    this.diamonds.exit().remove();

    var enter = this.diamonds.enter().append('g')
      .classed('diamond', true);

    this.diamonds = enter.merge(this.diamonds)
      .attr('fill', '#fff')
      .attr('stroke-width', 2)
      .attr('stroke', (d) => d.selected ? d.fill : this.props.gray)
      .style('cursor', this.props.cursor || 'default')
      .on('mouseenter', (d) => this.props.hover(d))
      .on('mouseleave', (d) => this.props.hover(null))
      .on('click', (d) => this.props.click(d.id));

    this.diamonds.selectAll('path')
      .data((d) => d.positions)
      .enter().append('path');
    this.diamonds.filter((d) => d.positions.length > 1)
      .insert('line', 'path');

    this.diamonds.selectAll('path')
      .attr('stroke-width', 2)
      .attr('transform', (d) => 'translate(' + [d.x, d.y]+ ')')
      .attr('d', (d) => 'M-' + d.size + ',-' + (d.size / 2) + // left
        'L' + d.size + ',-' + (d.size / 2) + // right
        'L0,' + d.size + 'Z') // bottom
      .transition().duration(duration)
      .ease(d3.easeSin)
      .attr('transform', (d) => 'translate(' + [d.x, d.y]+ ')');

    // only draw lines for those with two positions
    this.diamonds.selectAll('line')
      .attr('x1', (d) => d.positions[0].x)
      .attr('x2', (d) => d.positions[1].x)
      .attr('y1', (d) => d.positions[0].y)
      .attr('y2', (d) => d.positions[1].y)
      .transition().duration(duration)
      .ease(d3.easeSin)
      .attr('x1', (d) => d.positions[0].x)
      .attr('x2', (d) => d.positions[1].x)
      .attr('y1', (d) => d.positions[0].y)
      .attr('y2', (d) => d.positions[1].y);
  },

  render() {
    return (
      <g ref='diamonds' className='diamonds' />
    );
  }
});

export default Themes;
