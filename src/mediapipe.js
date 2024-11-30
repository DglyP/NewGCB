import { initializeHandLandmarker, processHands } from './hands.js';
import { initializeFaceLandmarker, processFace } from './face.js';

export async function setupMediaPipe(scene, visualizeLandmarks) {
  const video = document.getElementById('webcam'); // Use existing webcam element

  // Initialize MediaPipe models
  const handLandmarker = await initializeHandLandmarker();
  const faceLandmarker = await initializeFaceLandmarker();

  // Process video frames for hands and face detection
  function processVideoFrame() {
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      processHands(handLandmarker, video, scene);
      processFace(faceLandmarker, video, scene);
    }
    requestAnimationFrame(processVideoFrame);
  }

  // Start the video processing loop
  processVideoFrame();
}