import { initializeScene, render, visualizeLandmarks, setupResizeHandler } from './threeScene.js';
import { setupMediaPipe } from './mediapipe.js';
import { setupPhotobooth } from './photobooth.js';

// Video element
const video = document.getElementById('input-video');

// Setup the photobooth experience
setupPhotobooth(video);

// Initialize Three.js scene with video element dimensions
const { scene, camera, renderer } = initializeScene(video);

// Setup resize handler
setupResizeHandler(renderer, camera, video);

// Start rendering the scene
render({ scene, camera, renderer });

// Start MediaPipe processing
setupMediaPipe(scene, (scene, landmarks, width, height, colors, groupName) => {
  visualizeLandmarks(scene, landmarks, width, height, colors, groupName);
});