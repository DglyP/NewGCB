export function connectMediapipeToVideo(videoElement, mediapipeInstance) {
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      videoElement.srcObject = stream;
      videoElement.onloadedmetadata = () => {
        videoElement.play();
        mediapipeInstance.send({ image: videoElement });
      };
    });
  }