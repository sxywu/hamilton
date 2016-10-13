import React from 'react';
import * as d3 from "d3";

var Characters = React.createClass({
  shouldComponentUpdate(nextProps) {
    return nextProps.update;
  },

  componentDidMount() {
    this.container = d3.select(this.refs.images).attr('transform', 'translate(' +
      [this.props.width / 2, this.props.height / 2] + ')');
    this.defineFilters();

    this.updateLinks();
    this.updateImages();

  },

  componentDidUpdate() {
    this.updateLinks();
    this.updateImages();
  },

  updateImages() {
    this.images = this.container.selectAll('g')
      .data(this.props.characterNodes, (d) => d.id);

    this.images.exit().remove();

    var enter = this.images.enter().append('g')
      .classed('image', true);

    enter.append('circle')
      .classed('bg', true)
      .attr('fill', '#fff');
    enter.append('image');
    enter.append('circle')
      .classed('ring', true)
      .attr('fill', 'none')
      .attr('stroke-width', 2);

    this.images = enter.merge(this.images)
      .attr('transform', (d, i) => 'translate(' + [d.x, d.y] + ')')
      .style('cursor', (d) => d.available ? 'pointer' : 'default')
      .on('click', (d) => d.available && this.props.onSelectCharacter(d.id));

    this.images.selectAll('.bg')
      .attr('r', (d) => d.radius);
    this.images.selectAll('image')
      .attr('width', (d) => d.radius * 2)
      .attr('height', (d) => d.radius * 2)
      .attr('x', (d) => -d.radius)
      .attr('y', (d) => -d.radius)
      .attr('xlink:href', (d) => this.props.images[d.id])
      .attr('filter', (d) => !d.selected && !d.filtered ? 'url(#gray)' : '')
      .attr('opacity', (d) => {
        if (d.selected) return 1;
        if (d.filtered) return .5;
        if (d.available) return 1;
        return 0;
      });
    this.images.selectAll('.ring')
      .attr('r', (d) => d.radius)
      .attr('stroke', (d) => !d.selected && !d.filtered ? this.props.gray : d.color)
      .attr('stroke-dasharray', (d) => !d.available ? '5 5' : '')
      .attr('opacity', (d) => !d.selected && d.filtered ? .5 : 1);
  },

  updateLinks() {
      this.links = this.container.selectAll('path')
        .data(this.props.characterLinks, (d) => d.id);

      this.links.exit().remove();

      this.links = this.links.enter().insert('path', '.image')
          .attr('fill', 'none')
        .merge(this.links)
          .attr('d', this.calcualteLinkPath)
          .attr('stroke', (d) => d.selected || d.filtered ? d.color : this.props.gray)
          .on('click', (d) => d.available && this.props.onSelectConversation(d.id))
          .style('cursor', (d) => d.available ? 'pointer' : 'default')
          .attr('opacity', d => {
            if (d.selected) return 1;
            if ((!d.selected && d.filtered) || !d.available) return .25;
            return .75;
          }).attr('stroke-dasharray', d => !d.available ? '10 2' : '')
          .transition().duration(500)
          .attr('stroke-width', (d) => d.available ? d.weight : 2);
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
