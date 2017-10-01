import React from 'react';
import * as d3 from "d3";
import _ from 'lodash';
import textures from 'textures';
import isMobile from 'ismobilejs';

import Lines from './Lines';
import Diamonds from './Diamonds';
import Songs from './Songs';

var sf = isMobile.phone ? 1 : 2;
var duration = 300;
var simulation = d3.forceSimulation()
  .force('collide', d3.forceCollide().radius(d => d.radius + 3))
  .force('x', d3.forceX().x(d => d.focusX))
  .force('y', d3.forceY().y(d => d.focusY));

var Visualization = React.createClass({

  shouldComponentUpdate(nextProps) {
    // update is true when we've entered a new section or interacted with the filter
    // so if update is false, it must be something that doesn't trigger visualization positions to change
    if (!nextProps.update) {
      this.playMusic(nextProps);
      this.showHover(nextProps);
    }

    return nextProps.update;
  },

  componentDidMount() {
    // make canvas crispy
    this.crispyCanvas(this.refs.canvas, sf);
    this.ctx = this.refs.canvas.getContext('2d');
    this.ctx.scale(sf, sf);
    // and hidden canvas
    this.crispyCanvas(this.refs.hiddenCanvas, sf);
    this.hiddenCtx = this.refs.hiddenCanvas.getContext('2d');
    this.hiddenCtx.scale(sf, sf);
    // and svg
    this.svg = d3.select(this.refs.interactions);
    this.setupInteractions();

    // add mousemove
    d3.select(this.refs.canvas)
      .on('mousemove', () => {
        var [offsetX, offsetY] = d3.mouse(this.refs.canvas);
        this.mousemove(offsetX, offsetY);
      });

    simulation.on('tick', this.forceTick)
      .on('end', this.forceEnd)
      .stop();
  },

  componentDidUpdate() {
    this.updating = true;

    if (this.props.useForce) {
      // because we're using alpha which goes towards 0
      // the top we're going towards must be 0
      this.interpolateTop = d3.interpolateNumber(this.props.top, this.props.prevTop);
      simulation.nodes(this.props.linePositions)
        .force("charge", this.props.random ? d3.forceManyBody() : null)
        .alphaMin(this.props.random ? 0 : 0.5)
        .alpha(1).restart();
    } else {
      // as soon as this comes in, make sure to stop the simulation
      simulation.stop();
      this.interpolateTop = d3.interpolateNumber(this.props.prevTop, this.props.top);
      this.positionNoForce();
    }
  },

  setupInteractions() {
    this.texture = textures.lines()
      .size(4)
      .strokeWidth(1)
      .stroke('#fff');
    this.svg.call(this.texture);

    // append music group
    this.svg.append('g')
      .classed('music', true);

    // append hover group
    this.svg.append('g')
      .classed('hover', true);
  },

  playMusic(props) {
    var music = this.svg.select('.music');
    music.selectAll('*').remove();

    if (!props.playing) return;

    music.append('rect')
      .attr('width', props.width)
      .attr('height', props.vizHeight)
      .attr('fill', '#fff')
      .attr('opacity', 0.75)
      .style('pointer-events', 'none');
    var lines = props.playing.lines;
    _.each(lines, line => {
      var data = [
        {interpolate: 1, fill: props.gray},
        {interpolate: props.playing.currentTime / props.playing.duration, fill: line.fill},
      ];
      data = _.map(data, d => {
        return Object.assign(d, Lines.calculateLength(line, d.interpolate, props.top));
      });
      music.append('g').selectAll('rect')
        .data(data).enter().append('rect')
        .attr('x', d => d.x1 - d.radius)
        .attr('y', d => d.y1)
        .attr('width', d => d.x2 - d.x1 + 2 * d.radius)
        .attr('height', d => d.y2 - d.y1)
        .attr('rx', d => d.radius)
        .attr('ry', d => d.radius)
        .attr('fill', d => d.fill)
        .style('pointer-events', 'none');
    });
  },

  showHover(props) {
    var hover = this.svg.select('.hover');
    hover.selectAll('*').remove();

    if (!props.hovered) return;
    var line = props.hovered;
    var data = [
      {interpolate: 1, fill: line.fill},
      {interpolate: 1, fill: this.texture.url()},
    ];
    data = _.map(data, d => {
      return Object.assign(d, Lines.calculateLength(line, d.interpolate, props.top));
    });
    hover.append('g').selectAll('rect')
      .data(data).enter().append('rect')
      .attr('x', d => d.x1 - d.radius)
      .attr('y', d => d.y1)
      .attr('width', d => d.x2 - d.x1 + 2 * d.radius)
      .attr('height', d => d.y2 - d.y1)
      .attr('rx', d => d.radius)
      .attr('ry', d => d.radius)
      .attr('fill', d => d.fill)
      .style('pointer-events', 'none');
  },

  crispyCanvas(canvas, sf) {
    canvas.width = this.props.width * sf;
    canvas.height = this.props.vizHeight * sf;
    canvas.style.width = this.props.width + 'px';
    canvas.style.height = this.props.vizHeight + 'px';
  },

  forceTick() {
    var interpolate = (simulation.alpha() - simulation.alphaMin()) / (1 - simulation.alphaMin());
    var top = this.interpolateTop(Math.max(0, interpolate));


    this.ctx.clearRect(0, 0, this.props.width, this.props.vizHeight);
    Lines.drawCircles(this.ctx, this.props.linePositions, top);
  },

  forceEnd() {
    var t = d3.timer((elapsed) => {
      this.ctx.clearRect(0, 0, this.props.width, this.props.vizHeight);

      var interpolate = Math.min(elapsed / duration, 1);
      Diamonds.drawCurves(this.ctx, this.props.diamondPositions, interpolate, this.props);
      Songs.drawLines(this.ctx, this.props.songPositions, interpolate, this.props);
      Lines.drawPaths(this.ctx, this.props.linePositions, interpolate, this.props);
      Songs.highlightSong(this.ctx, this.props.songPositions, this.props.top, interpolate);
      if (elapsed > duration) {
        this.hiddenCtx.clearRect(0, 0, this.props.width, this.props.vizHeight);
        Lines.drawHover(this.hiddenCtx, this.props.linePositions, this.props.top);
        this.updating = false;
        t.stop();
      };
    });
  },

  positionNoForce() {
    var t = d3.timer((elapsed) => {
      this.ctx.clearRect(0, 0, this.props.width, this.props.vizHeight);

      var interpolate = Math.min(elapsed / duration, 1);
      var top = this.interpolateTop(interpolate);

      Diamonds.moveCurves(this.ctx, this.props.diamondPositions, top, this.props);
      Songs.moveLines(this.ctx, this.props.songPositions, top, this.props);
      Lines.movePaths(this.ctx, this.props.linePositions, top, this.props);
      Songs.highlightSong(this.ctx, this.props.songPositions, top, interpolate);
      if (elapsed > duration) {
        this.hiddenCtx.clearRect(0, 0, this.props.width, this.props.vizHeight);
        Lines.drawHover(this.hiddenCtx, this.props.linePositions, this.props.top);
        this.updating = false;
        t.stop();
      };
    });
  },

  mousemove(offsetX, offsetY) {
    if (this.updating) return;

    // multiply the x and y by whatever we scaled the canvas by to make it crispy
    var col = this.hiddenCtx.getImageData(offsetX * sf, offsetY * sf, 1, 1).data;
    var color = 'rgb(' + col[0] + "," + col[1] + ","+ col[2] + ")";

    this.props.hoverLine(this.props.hoverLookup[color]);
  },

  render() {
    var style = {
      // border: '1px solid',
      position: this.props.section && this.props.section.consecutive ? 'fixed' : 'relative',
      // if it's a consecutive section then use the calculated top (that vertically centers the lines)
      // else use that section's top that we're currently in
      top: this.props.section ?
        (this.props.section.consecutive ? this.props.top : this.props.section.top) : this.props.scrollTop,
    };
    var hiddenCanvasStyle = {
      display: 'none',
      // position: 'absolute',
      // top: 0,
      // left: 0,
      // zIndex: -1,
    };
    var svgStyle = {
      position: 'absolute',
      top: 0,
      left: 0,
      width: this.props.width,
      height: this.props.vizHeight,
      pointerEvents: 'none',
    };

    return (
      <div style={style}>
        <canvas ref='canvas' />
        <canvas ref='hiddenCanvas' style={hiddenCanvasStyle} />
        <svg ref='interactions' style={svgStyle} />
      </div>
    );
  }
});

export default Visualization;
