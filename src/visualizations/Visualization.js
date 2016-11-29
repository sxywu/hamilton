import React from 'react';
import * as d3 from "d3";

import Lines from './Lines';
import Diamonds from './Diamonds';
import Songs from './Songs';
import LineSummary from '../LineSummary';

var duration = 300;
var simulation = d3.forceSimulation()
  .force('collide', d3.forceCollide().radius(d => d.radius + 3))
  .force('x', d3.forceX().x(d => d.focusX))
  .force('y', d3.forceY().y(d => d.focusY));

var Visualization = React.createClass({
  getInitialState() {
    return {
      hovered: null,
      update: true,
    };
  },

  componentWillReceiveProps(nextProps) {
    this.setState({update: true});
  },

  componentDidMount() {
    // make canvas crispy
    var sf = window.devicePixelRatio;
    this.refs.canvas.width = this.props.width * sf;
    this.refs.canvas.height = this.props.height * sf;
    this.refs.canvas.style.width = this.props.width + 'px';
    this.refs.canvas.style.height = this.props.height + 'px';

    this.ctx = this.refs.canvas.getContext('2d');
    this.ctx.scale(sf, sf);

    simulation.on('tick', this.forceTick.bind(this))
      .on('end', this.forceEnd.bind(this))
      .stop();
  },

  componentDidUpdate() {
    this.timer && this.timer.stop();

    if (this.props.useForce) {
      // because we're using alpha which goes towards 0
      // the top we're going towards must be 0
      this.interpolateTop = d3.interpolateNumber(this.props.top, this.props.prevTop);
      simulation.nodes(this.props.linePositions)
        .force("charge", this.props.random ? d3.forceManyBody() : null)
        .alphaMin(this.props.random ? 0 : 0.5)
        .alpha(1).restart();
    } else {
      this.interpolateTop = d3.interpolateNumber(this.props.prevTop, this.props.top);
      this.positionNoForce();
    }
  },

  hoverLine(hoveredLine) {
    var hovered = hoveredLine && {
      title: hoveredLine.characterName,
      lines: hoveredLine.data[2],
      x: hoveredLine.x,
      y: hoveredLine.y,
      color: hoveredLine.fill,
      image: this.props.images[hoveredLine.characterId],
      hoverWidth: hoveredLine.length,
      hoverHeight: hoveredLine.radius,
      data: hoveredLine,
    };
    this.setState({hovered, update: false});
  },

  hoverTheme(hoveredTheme) {
    var hovered = hoveredTheme && {
      title: hoveredTheme.themeType,
      lines: hoveredTheme.lines,
      x: hoveredTheme.positions[0].x,
      y: hoveredTheme.positions[0].y,
    }
    this.setState({hovered, update: false});
  },

  forceTick() {
    var interpolate = (simulation.alpha() - simulation.alphaMin()) / (1 - simulation.alphaMin());
    var top = this.interpolateTop(Math.max(0, interpolate));

    this.ctx.clearRect(0, 0, this.props.width, this.props.height);
    Lines.drawCircles(this.ctx, this.props.linePositions, top);
  },

  forceEnd() {
    this.timer = d3.timer((elapsed) => {
      this.ctx.clearRect(0, 0, this.props.width, this.props.height);

      var interpolate = Math.min(elapsed / duration, 1);
      Diamonds.drawCurves(this.ctx, this.props.diamondPositions, interpolate, this.props);
      Songs.drawLines(this.ctx, this.props.songPositions, interpolate, this.props);
      Lines.drawPaths(this.ctx, this.props.linePositions, interpolate, this.props);
      if (elapsed > duration) this.timer.stop();
    });
  },

  positionNoForce() {
    this.timer = d3.timer((elapsed) => {
      this.ctx.clearRect(0, 0, this.props.width, this.props.height);

      var interpolate = Math.min(elapsed / duration, 1);
      var top = this.interpolateTop(interpolate);
      // Diamonds.drawCurves(this.ctx, this.props.diamondPositions, interpolate, this.props);
      Songs.moveLines(this.ctx, this.props.songPositions, top, this.props);
      Lines.movePaths(this.ctx, this.props.linePositions, top, this.props);
      if (elapsed > duration) this.timer.stop();
    });
  },

  render() {
    var style = {
      // border: '1px solid',
      position: this.props.section && this.props.section.consecutive ? 'fixed' : 'relative',
    };

    return (
      <div style={style}>
        <canvas ref='canvas' />
        <LineSummary {...this.state.hovered} hover={this.hoverLine} />
      </div>
    );
  }
});

export default Visualization;
