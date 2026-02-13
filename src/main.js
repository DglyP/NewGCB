// Import necessary modules
import { initializeScene, render, visualizeLandmarks, setupResizeHandler } from './threeScene.js';
import { setupMediaPipe } from './mediapipe.js';
import { setupPhotobooth } from './photobooth.js';

// Get the existing video element
const video = document.getElementById('webcam');

// Initialize Three.js scene with the video element dimensions
const { scene, camera, renderer } = initializeScene(video);

// Set up the resize handler
setupResizeHandler(renderer, camera, video);

// Start rendering the scene
render({ scene, camera, renderer });

// Start MediaPipe processing
setupMediaPipe(scene, (scene, landmarks, width, height, colors, groupName) => {
  visualizeLandmarks(scene, landmarks, width, height, colors, groupName);
});

//const video = document.getElementById('webcam');
const shutterButton = document.getElementById('shutter');
const canvas = document.getElementById('snapshot');
const context = canvas.getContext('2d');
const videoContainer = document.getElementById('videoContainer');
const heightSlider = document.getElementById('heightSlider');
const topSlider = document.getElementById('topSlider');
const leftSlider = document.getElementById('leftSlider');
const fileNameInput = document.getElementById('fileName');
const editableText = document.getElementById('editableText');
const controls = document.querySelector('.controls');
const toggleButton = document.getElementById('toggleControls');

// Pass the sliders to setupResizeHandler
setupResizeHandler(renderer, camera, videoContainer, [heightSlider, topSlider, leftSlider]);
// Toggle the visibility of the controls
toggleButton.addEventListener('click', () => {
  if (controls.style.display === 'none') {
    controls.style.display = 'flex'; // Show the controls
    toggleButton.textContent = 'Hide Controls';
  } else {
    controls.style.display = 'none'; // Hide the controls
    toggleButton.textContent = 'Show Controls';
  }
});
// Separate controls for text box adjustments
const textScaleSlider = document.getElementById('textScaleSlider');
const textTopSlider = document.getElementById('textTopSlider');
const textLeftSlider = document.getElementById('textLeftSlider');

// Function to update the video-container size and position
// Function to update the video-container size and position
function updateVideoContainer() {
    const height = heightSlider.value + '%';
    const top = topSlider.value + '%';
    const left = leftSlider.value + '%';
  
    videoContainer.style.height = height;
    videoContainer.style.top = top;
    videoContainer.style.left = left;
  
    // After updating the container size, adjust the renderer
    adjustRendererSize();
  }
function adjustRendererSize() {
  const rect = videoContainer.getBoundingClientRect();
  renderer.setSize(rect.width, rect.height);

  camera.left = -rect.width / 2;
  camera.right = rect.width / 2;
  camera.top = rect.height / 2;
  camera.bottom = -rect.height / 2;
  camera.updateProjectionMatrix();
}
// Event listeners for video container sliders
// Event listeners for video container sliders
heightSlider.addEventListener('input', () => {
    updateVideoContainer();
    adjustRendererSize();
  });
  
  topSlider.addEventListener('input', () => {
    updateVideoContainer();
    adjustRendererSize();
  });
  
  leftSlider.addEventListener('input', () => {
    updateVideoContainer();
    adjustRendererSize();
  });

// Function to update text box scale
textScaleSlider.addEventListener('input', () => {
  const scaleValue = textScaleSlider.value;
  editableText.style.fontSize = `${scaleValue}px`; // Update font size dynamically
});

// Function to update text box top position
textTopSlider.addEventListener('input', () => {
  const topValue = textTopSlider.value;
  editableText.style.top = `${topValue}%`; // Update top position dynamically
});

// Function to update text box left position
textLeftSlider.addEventListener('input', () => {
  const leftValue = textLeftSlider.value;
  editableText.style.left = `${leftValue}%`; // Update left position dynamically
  editableText.style.transform = `translate(-50%, 0)`; // Maintain horizontal centering
});

// Initialize the webcam and set default video-container styles
window.addEventListener('load', () => {
  initWebcam();
  updateVideoContainer();
});

// Access the webcam
async function initWebcam() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
  } catch (error) {
    console.error('Error accessing the webcam:', error);
  }
}

// Capture a snapshot and save it as a file
function captureSnapshot() {
  const videoWidth = video.videoWidth;
  const videoHeight = video.videoHeight;

  canvas.width = videoWidth;
  canvas.height = videoHeight;

  // Draw the video frame on the canvas
  context.drawImage(video, 0, 0, videoWidth, videoHeight);

  // Convert the canvas to a data URL
  const imageDataURL = canvas.toDataURL('image/png');

  // Get the file name from the input field
  const fileName = fileNameInput.value.trim() || 'snapshot';

  // Create a temporary <a> element to trigger the download
  const downloadLink = document.createElement('a');
  downloadLink.href = imageDataURL;
  downloadLink.download = `${fileName}.png`; // Use the input file name with .png extension
  downloadLink.click(); // Programmatically click the link to trigger the download
}

// Event listener for the capture button
shutterButton.addEventListener('click', captureSnapshot);