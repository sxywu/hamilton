import React from 'react';
import * as d3 from "d3";

var simulation = d3.forceSimulation()
  .force('collide', d3.forceCollide().radius(d => d.radius + 25))
  .force('link', d3.forceLink())
  .force('charge', d3.forceManyBody().distanceMin(500))
  .alphaMin(.5);

var Characters = React.createClass({
  componentDidMount() {
    this.container = d3.select(this.refs.images);

    this.links = this.container.selectAll('line')
      .data(this.props.characterLinks, (d) => d.id)
      .enter().append('line')
      .attr('stroke', (d) => d.source.color)
      .attr('stroke-width', (d) => d.weight);

    this.images = this.container.selectAll('g')
      .data(this.props.characterNodes, (d) => d.id)
      .enter().append('g')
        .style('cursor', 'pointer')
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

    simulation
      .nodes(this.props.characterNodes)
      .on("tick", this.forceTick.bind(this));
    simulation
      .force("center", d3.forceCenter(this.props.width / 2, this.props.height / 2))
      .force("link").links(this.props.characterLinks);
  },

  forceTick() {
    this.images.attr('transform', (d) => 'translate(' + [d.x, d.y] + ')');
    this.links.attr('x1', (d) => d.source.x)
      .attr('x2', (d) => d.target.x)
      .attr('y1', (d) => d.source.y)
      .attr('y2', (d) => d.target.y);
  },

  shouldComponentUpdate(nextProps) {
    return nextProps.update;
  },

  componentDidUpdate() {
    // update selection
    this.images.attr('filter', (d) => d.selected ? '' : 'url(#gray)')
      .attr('transform', (d) => 'translate(' + [d.x, d.y] + ')');
  },

  render() {
    return (
      <g ref='images' className='images' />
    );
  }
});

export default Characters;
