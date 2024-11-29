import { initializeHandLandmarker, processHands } from './hands.js';
import { initializeFaceLandmarker, processFace } from './face.js';
import { getDisplayedVideoDimensions } from './threeScene.js';

export async function setupMediaPipe(scene, visualizeLandmarks) {
  const video = document.getElementById('input-video');
  const cameraSelect = document.getElementById('camera-select');

  // Helper function to get available video devices
  async function getCameraDevices() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter((device) => device.kind === 'videoinput');
      if (videoDevices.length === 0) {
        console.error('No video input devices found');
        return null;
      }
      return videoDevices;
    } catch (error) {
      console.error('Error fetching camera devices:', error);
      return null;
    }
  }

  // Helper function to start a selected camera
  async function selectCamera(videoElement, deviceId) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: deviceId ? { exact: deviceId } : undefined },
      });
      videoElement.srcObject = stream;
  
      videoElement.onloadedmetadata = () => {
        // Wait for video metadata before initializing
        videoElement.width = videoElement.videoWidth;
        videoElement.height = videoElement.videoHeight;
  
        console.log('Video Dimensions:', videoElement.videoWidth, videoElement.videoHeight);
  
      };
  
      await videoElement.play();
      console.log('Camera stream started');
    } catch (error) {
      console.error('Error accessing selected camera:', error);
    }
  }

  // Initialize MediaPipe models
  const handLandmarker = await initializeHandLandmarker();
  const faceLandmarker = await initializeFaceLandmarker();

  // Fetch and populate available cameras
  const videoDevices = await getCameraDevices();
  if (!videoDevices) return;

  videoDevices.forEach((device, index) => {
    const option = document.createElement('option');
    option.value = device.deviceId;
    option.textContent = device.label || `Camera ${index + 1}`;
    cameraSelect.appendChild(option);
  });

  cameraSelect.addEventListener('change', async () => {
    await selectCamera(video, cameraSelect.value);
    processVideoFrame(); // Restart video frame processing after camera change
  });

  // Automatically select the first camera if available
  if (videoDevices.length > 0) {
    await selectCamera(video, videoDevices[0].deviceId);
    processVideoFrame(); // Start processing video frames
  }

  // Process video frames for hands and face detection
  function processVideoFrame() {
    const videoElement = document.getElementById('input-video');
    const rect = videoElement.getBoundingClientRect(); // Get displayed dimensions
    const displayedWidth = rect.width;
    const displayedHeight = rect.height;
  
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      processHands(handLandmarker, video, scene, (scene, landmarks) =>
        visualizeLandmarks(scene, landmarks, displayedWidth, displayedHeight, 0x00ff00, 'hands') // Green for hands
      );
  
      processFace(faceLandmarker, video, scene, (scene, landmarks) =>
        visualizeLandmarks(scene, landmarks, displayedWidth, displayedHeight, 0xff0000, 'face') // Red for face
      );
    }
  
    requestAnimationFrame(processVideoFrame);
  }

}