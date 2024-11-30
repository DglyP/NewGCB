// Import necessary modules
import { initializeScene, render, visualizeLandmarks, setupResizeHandler } from './threeScene.js';
import { setupMediaPipe } from './mediapipe.js';
import { setupPhotobooth } from './photobooth.js';

// Get the existing video element
const video = document.getElementById('webcam');

// Initialize the photobooth experience (if applicable)
setupPhotobooth(video);

// Initialize Three.js scene with the video element dimensions
const { scene, camera, renderer } = initializeScene(video);

// Set up the resize handler
//setupResizeHandler(renderer, camera, video);

// Start rendering the scene
render({ scene, camera, renderer });

// Start MediaPipe processing
setupMediaPipe(scene, (scene, landmarks, width, height, colors, groupName) => {
  visualizeLandmarks(scene, landmarks, width, height, colors, groupName);
});