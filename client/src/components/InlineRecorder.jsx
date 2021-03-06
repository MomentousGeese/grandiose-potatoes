import React from 'react';
import rebound from 'rebound';
import getWebcamVideo from '../util/mediaSource';

import { getPreSignedUrl, putObjectToS3 } from '../util/recordUtil.js';
import { createMessage } from '../util/profileUtil.js';

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
      blob: null,
      recVidUrl: null,
      uploading: false,
    };

    this.redrawFilters = this.redrawFilters.bind(this);
    this.changeSelectedEffect = this.changeSelectedEffect.bind(this);
    this.toggleRecording = this.toggleRecording.bind(this);
    this.discardVideo = this.discardVideo.bind(this);
    this.uploadRecording = this.uploadRecording.bind(this);
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
      .then(([video, stream]) => {
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
          stream,
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
      this.stopRecording();
    } else {
      this.state.canvases[this.state.selectedEffect].style.cursor = 'default';
      this.startRecording();
    }
    this.setState({
      recording: !this.state.recording,
    });
  }

  startRecording() {
    const currentCanvas = this.state.canvases[this.state.selectedEffect];

    const videoStream = currentCanvas.captureStream().getTracks()[0];
    const audioStream = this.state.stream.getTracks()[0];

    const combinedStream = new MediaStream();
    combinedStream.addTrack(videoStream);
    combinedStream.addTrack(audioStream);

    const recorder = new MediaRecorder(combinedStream);
    recorder.ondataavailable = (e) => {
      if (e.data) {
        this.state.buffer.push(e.data);
      }
    };
    recorder.start();

    this.setState({
      recorder,
    });
  }

  stopRecording() {
    this.state.recorder.stop();
    const blob = new Blob(this.state.buffer, { type: 'video/webm' });
    this.setState({
      blob,
      recVidUrl: window.URL.createObjectURL(blob),
    });
  }

  uploadRecording() {
    // Set the uploading to true to show the loader bar
    this.setState({
      uploading: true,
    });

    getPreSignedUrl()
      .then((data) => {
        // data: { preSignedUrl, publicUrl }
        data.blob = this.state.blob;
        return putObjectToS3(data);
      })
      .then((videoData) => {
        this.props.emitAndAppendNewMessage('vid', videoData.publicUrl);
        const info = {
          url: videoData.publicUrl,
          type: "vid",
          senderName: this.props.currentUser,
          receiverName: this.props.currentOtherUser,
        };
        return createMessage(info);
      })
      .then((res) => {
        console.log('Message created:', res);
      })
      .catch((err) => {
        throw err;
      });


    // /////////////////////////////////
    //    POST REQUEST DATA FORMAT    //
    //                                //
    //     info = {                   //
    //       url: url,                //
    //       type: type,              //
    //       senderName: sender,      //
    //       receiverName: receiver,  //
    //     };                         //
    //                                //
    // /////////////////////////////////

    // const info = {
    //   url: "http://clips.vorwaerts-gmbh.de/big_buck_bunny.mp4",
    //   type: "vid",
    //   senderName: "John Cena",
    //   receiverName: "ryan",
    // };
    // createMessage(info);
  }

  discardVideo() {
    this.setState({
      recorder: null,
      buffer: [],
      recVidUrl: null,
    });
  }

  render() {
    return (
      <li className="recorder blue lighten-2">
        {this.state.recVidUrl !== null ?
          <div id="preview-box">
            <i className="material-icons right" onClick={this.discardVideo}>close</i>
            <video id="preview-player" src={this.state.recVidUrl} controls autoPlay></video>
            <button onClick={this.uploadRecording}>
              <i className="material-icons right">send</i>
            </button>
          </div>
        : null}
        <button id="record-button" onClick={this.toggleRecording} className={!this.state.showRecordButton || this.state.recVidUrl ? 'hidden' : ''}>
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
  currentOtherUser: React.PropTypes.string,
  messages: React.PropTypes.array,
  emitAndAppendNewMessage: React.PropTypes.func,
};

export default InlineRecorder;
