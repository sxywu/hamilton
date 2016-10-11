import React from 'react';
import * as d3 from "d3";

var Characters = React.createClass({
  componentDidMount() {
    this.container = d3.select(this.refs.images).attr('transform', 'translate(' +
      [this.props.width / 2, this.props.height / 2] + ')');
    this.defineFilters();

    this.links = this.container.selectAll('path')
      .data(this.props.characterLinks, (d) => d.id)
      .enter().append('path')
      .style('cursor', 'pointer')
      .on('click', (d) => this.props.onSelectConversation(d.id))
      .attr('d', this.calcualteLinkPath)
      .attr('fill', 'none')
      .attr('stroke', (d) => d.color)
      .attr('stroke-width', (d) => d.weight)
      .attr('opacity', .75);

    this.images = this.container.selectAll('g')
      .data(this.props.characterNodes, (d) => d.id)
      .enter().append('g')
      .style('cursor', 'pointer')
      .attr('transform', (d, i) => 'translate(' + [d.x, d.y] + ')')
      .on('click', (d) => this.props.onSelectCharacter(d.id));
    this.images.append('circle')
      .attr('r', (d) => d.radius)
      .attr('fill', '#fff');
    this.images.filter((d) => d.image)
      .append('image')
      .attr('width', (d) => d.radius * 2)
      .attr('height', (d) => d.radius * 2)
      .attr('x', (d) => -d.radius)
      .attr('y', (d) => -d.radius)
      .attr('xlink:href', (d) => d.image);
    this.images.filter((d) => !d.image)
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em')
      .attr('fill', (d) => d.color)
      .text((d) => d.initials)
    this.images.append('circle')
      .attr('r', (d) => d.radius)
      .attr('fill', 'none')
      .attr('stroke', (d) => d.color)
      .attr('stroke-width', 2);

  },

  componentDidUpdate() {
    this.images.attr('filter', (d) => d.selected ? '' : 'url(#gray)')
      .attr('transform', (d) => 'translate(' + [d.x, d.y] + ')');

    this.links.attr('stroke', (d) => d.color);
  },

  calcualteLinkPath(link) {
    var x1, x2, y1, y2;
    if (link.source.x < link.target.x) {
      x1 = link.source.x;
      y1 = link.source.y - link.weight / 2;
      x2 = link.target.x;
      y2 = link.target.y - link.weight / 2;
    } else {
      x1 = link.target.x;
      y1 = link.target.y + link.weight / 2;
      x2 = link.source.x;
      y2 = link.source.y + link.weight / 2;
    }
    // if it's on same level, then curve if not straight line
    var curve = (y1 === y2) ? (x2 - x1) / 4 : 0;
    var cx1 = x1 + curve;
    var cy1 = y1 + curve;
    var cx2 = x2 - curve;
    var cy2 = y1 + curve;
    return 'M' + [x1, y1] + ' C' + [cx1, cy1] + ' ' + [cx2, cy2] + ' ' + [x2, y2];
  },

  defineFilters() {
    var defs = this.container.append('defs');
    var gray = defs.append('filter').attr('id','gray');
    gray.append('feColorMatrix')
      .attr('type','matrix')
      .attr('values','1 0 0 0 0  1 0 0 0 0  1 0 0 0 0  0 0 0 1 0');
  },

  render() {
    return (
      <svg width={this.props.width} height={this.props.height}>
        <g ref='images' className='images' />
      </svg>
    );
  }
});

export default Characters;
