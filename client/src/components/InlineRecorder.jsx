import React from 'react';

import rebound from 'rebound';

import getWebcamVideo from '../util/mediaSource';

const CANVAS_COUNT = 9;
const VIDEO_WIDTH_BIG = 480;
const VIDEO_HEIGHT_BIG = 360;
const VIDEO_WIDTH_SMALL = 144;
const VIDEO_HEIGHT_SMALL = 104;
const SPRING_CONSTANT = 80;
const SPRING_FRICTION = 3;

class InlineRecorder extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      video: null,
      canvases: [],
      textures: [],
      springSystem: new rebound.SpringSystem(),
      selectedEffect: null,
      recording: false,
      showRecordButton: false,
      recorder: null,
      buffer: [],
    };

    this.redrawFilters = this.redrawFilters.bind(this);
    this.changeSelectedEffect = this.changeSelectedEffect.bind(this);
    this.toggleRecording = this.toggleRecording.bind(this);
  }

  componentDidMount() {
    this.initFilters()
      .then(() => {
        this.initSprings();
        requestAnimationFrame(this.redrawFilters);
      });
  }

  initFilters() {
    return getWebcamVideo()
      .then((video) => {
        const canvases = _.range(0, CANVAS_COUNT).map((i) => fx.canvas());
        const textures = canvases.map((canvas) => canvas.texture(video));

        canvases.forEach((canvas, i) => {
          const rows = Math.sqrt(canvases.length);
          const row = Math.floor(i / rows);
          document.getElementById(`grid-row-${row}`).appendChild(canvas);

          canvas.id = `filter-${i}`;
          canvas.dataset.index = i;
          canvas.addEventListener('click', this.changeSelectedEffect);
        });

        this.setState({
          video,
          canvases,
          textures,
        });
      });
  }

  changeSelectedEffect(e) {
    if (!this.state.recording) {
      const springs = this.state.springSystem.getAllSprings();
      if (this.state.selectedEffect === e.target.dataset.index) {
        // Toggle off selectedEffect (set to null)
        this.state.canvases[e.target.dataset.index].style['z-index'] = 0;
        springs[e.target.dataset.index].setEndValue(0);
        this.setState({
          selectedEffect: null,
          showRecordButton: false,
        });
      } else {
        this.state.canvases[e.target.dataset.index].style['z-index'] = 1;
        springs[e.target.dataset.index].setEndValue(1);
        this.setState({
          selectedEffect: e.target.dataset.index,
          showRecordButton: true,
        });
      }
    }
  }

  initSprings() {
    const springSystem = this.state.springSystem;

    this.state.canvases.forEach((canvas, i) => {
      const spring = springSystem.createSpring(SPRING_CONSTANT, SPRING_FRICTION);
      ((elem, index) => {
        spring.addListener({
          onSpringUpdate: (spr) => {
            const val = spr.getCurrentValue();
            this.moveCanvas(elem, index, val);
          },
        });
      })(canvas, i);
      this.moveCanvas(canvas, i, 0);
    });
  }

  moveCanvas(canvas, i, val) {
    const rows = Math.sqrt(CANVAS_COUNT);
    const row = i % rows;
    const col = Math.floor(i / rows);
    const leftSm = 12 + row * (12 + 144);
    const topSm = 12 + col * (12 + 104);
    const left = rebound.MathUtil.mapValueInRange(val, 0, 1, leftSm, 0);
    const top = rebound.MathUtil.mapValueInRange(val, 0, 1, topSm, 0);
    const width = rebound.MathUtil.mapValueInRange(val, 0, 1, VIDEO_WIDTH_SMALL, VIDEO_WIDTH_BIG);
    const height = rebound.MathUtil.mapValueInRange(val, 0, 1, VIDEO_HEIGHT_SMALL, VIDEO_HEIGHT_BIG);
    canvas.style.left = `${left}px`;
    canvas.style.top = `${top}px`;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
  }

  redrawFilters() {
    this.state.canvases.forEach((canvas, i) => {
      const texture = this.state.textures[i];
      texture.loadContentsOf(this.state.video);
      if (i === 0) canvas.draw(texture).bulgePinch(canvas.width / 2, canvas.height / 2, 200, 0.80).update();
      if (i === 1) canvas.draw(texture).swirl(canvas.width / 2, canvas.height / 2, 150, 3).update();
      if (i === 2) canvas.draw(texture).bulgePinch(canvas.width / 2, canvas.height / 2, 100, 0.80).update();
      if (i === 3) canvas.draw(texture).ink(0.35).update();
      if (i === 4) canvas.draw(texture).update();
      if (i === 5) canvas.draw(texture).unsharpMask(20, 2).update();
      if (i === 6) canvas.draw(texture).sepia(1).update();
      if (i === 7) canvas.draw(texture).edgeWork(5).update();
      if (i === 8) canvas.draw(texture).hueSaturation(-1, 0).update();
    });

    requestAnimationFrame(this.redrawFilters);
  }

  toggleRecording() {
    if (this.state.recording) {
      this.state.canvases[this.state.selectedEffect].style.cursor = 'pointer';
      // this.stopRecording();
    } else {
      this.state.canvases[this.state.selectedEffect].style.cursor = 'default';
      // this.startRecording();
    }
    this.setState({
      recording: !this.state.recording,
    });
  }

  startRecording() {
    const currentCanvas = this.state.canvases[this.state.selectedEffect];
    const stream = currentCanvas.captureStream();
    const recorder = new MediaRecorder(stream);

  }

  render() {
    return (
      <li className="recorder blue lighten-2">
        <button id="record-button" onClick={this.toggleRecording} className={this.state.showRecordButton ? '' : 'hidden'}>
          <div id="record-button-inside" className={this.state.recording ? 'recording' : ''}></div>
        </button>
        <div id="grid-row-0"></div>
        <div id="grid-row-1"></div>
        <div id="grid-row-2"></div>
      </li>
    );
  }
}

InlineRecorder.propTypes = {
  currentUser: React.PropTypes.string,
  messages: React.PropTypes.array,
};

export default InlineRecorder;
