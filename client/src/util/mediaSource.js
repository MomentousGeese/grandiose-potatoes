const constraints = {
  video: {
    mandatory: {
      maxWidth: 480,
      maxHeight: 360,
    },
  },
  audio: true,
};

let avstream;

// Returns a Promise that is resolved with a newly created video element,
// with a source from the webcam, in playing state
function getWebcamVideo() {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.setAttribute('autoplay', true);
    video.setAttribute('muted', true);

    navigator.getUserMedia(constraints, (stream) => {
      video.src = window.URL.createObjectURL(stream);
      avstream = stream;
    }, reject);

    video.addEventListener('play', () => {
      resolve([video, avstream]);
    });
  });
}

export default getWebcamVideo;
