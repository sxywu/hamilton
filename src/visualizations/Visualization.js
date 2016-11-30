import React from 'react';
import * as d3 from "d3";

import Lines from './Lines';
import Diamonds from './Diamonds';
import Songs from './Songs';

var duration = 300;
var simulation = d3.forceSimulation()
  .force('collide', d3.forceCollide().radius(d => d.radius + 3))
  .force('x', d3.forceX().x(d => d.focusX))
  .force('y', d3.forceY().y(d => d.focusY));

var Visualization = React.createClass({

  shouldComponentUpdate(nextProps) {
    return nextProps.update;
  },

  componentDidMount() {
    // make canvas crispy
    var sf = window.devicePixelRatio;
    this.crispyCanvas(this.refs.canvas, sf);
    this.ctx = this.refs.canvas.getContext('2d');
    this.ctx.scale(sf, sf);
    // and hidden canvas
    this.crispyCanvas(this.refs.hiddenCanvas, sf);
    this.hiddenCtx = this.refs.hiddenCanvas.getContext('2d');
    this.hiddenCtx.scale(sf, sf);

    // add mousemove
    d3.select(this.refs.canvas)
      .on('mousemove', this.mousemove);

    simulation.on('tick', this.forceTick.bind(this))
      .on('end', this.forceEnd.bind(this))
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

  crispyCanvas(canvas, sf) {
    canvas.width = this.props.width * sf;
    canvas.height = this.props.height * sf;
    canvas.style.width = this.props.width + 'px';
    canvas.style.height = this.props.height + 'px';
  },

  forceTick() {
    var interpolate = (simulation.alpha() - simulation.alphaMin()) / (1 - simulation.alphaMin());
    var top = this.interpolateTop(Math.max(0, interpolate));


    this.ctx.clearRect(0, 0, this.props.width, this.props.height);
    Lines.drawCircles(this.ctx, this.props.linePositions, top);
  },

  forceEnd() {
    var t = d3.timer((elapsed) => {
      this.ctx.clearRect(0, 0, this.props.width, this.props.height);

      var interpolate = Math.min(elapsed / duration, 1);
      Diamonds.drawCurves(this.ctx, this.props.diamondPositions, interpolate, this.props);
      Songs.drawLines(this.ctx, this.props.songPositions, interpolate, this.props);
      Lines.drawPaths(this.ctx, this.props.linePositions, interpolate, this.props);
      Songs.highlightSong(this.ctx, this.props.songPositions, this.props.top, interpolate);
      if (elapsed > duration) {
        this.hiddenCtx.clearRect(0, 0, this.props.width, this.props.height);
        Lines.drawHover(this.hiddenCtx, this.props.linePositions, this.props.top);
        this.updating = false;
        t.stop();
      };
    });
  },

  positionNoForce() {
    var t = d3.timer((elapsed) => {
      this.ctx.clearRect(0, 0, this.props.width, this.props.height);

      var interpolate = Math.min(elapsed / duration, 1);
      var top = this.interpolateTop(interpolate);
      Diamonds.moveCurves(this.ctx, this.props.diamondPositions, top, this.props);
      Songs.moveLines(this.ctx, this.props.songPositions, top, this.props);
      Lines.movePaths(this.ctx, this.props.linePositions, top, this.props);
      Songs.highlightSong(this.ctx, this.props.songPositions, top, interpolate);
      if (elapsed > duration) {
        this.hiddenCtx.clearRect(0, 0, this.props.width, this.props.height);
        Lines.drawHover(this.hiddenCtx, this.props.linePositions, this.props.top);
        this.updating = false;
        t.stop();
      };
    });
  },

  mousemove() {
    if (this.updating) return;

    var [offsetX, offsetY] = d3.mouse(this.refs.canvas);
    var col = this.hiddenCtx.getImageData(offsetX, offsetY, 1, 1).data;
    var color = 'rgb(' + col[0] + "," + col[1] + ","+ col[2] + ")";
    
    this.props.hoverLine(this.props.hoverLookup[color]);
  },

  render() {
    var style = {
      // border: '1px solid',
      position: this.props.section && this.props.section.consecutive ? 'fixed' : 'relative',
    };

    return (
      <div style={style}>
        <canvas ref='hiddenCanvas' style={{display: 'none'}} />
        <canvas ref='canvas' />
      </div>
    );
  }
});

export default Visualization;
