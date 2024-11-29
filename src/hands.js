import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { createGLBModel, updateGLBModel } from './glbManager.js';
import { currentModelUrl } from './glbManager.js'; // Import the global variable

export async function initializeHandLandmarker() {
  try {
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm'
    );

    const handLandmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
        delegate: 'GPU',
      },
      runningMode: 'VIDEO',
      numHands: 2, // Detect up to 2 hands
    });

    console.log('HandLandmarker initialized');
    return handLandmarker;
  } catch (error) {
    console.error('Error initializing HandLandmarker:', error);
    throw error;
  }
}

export async function processHands(handLandmarker, video, scene) {
  try {
    const handResults = handLandmarker.detectForVideo(video, Date.now());
    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;

    if (handResults?.landmarks?.length > 0) {
      for (let i = 0; i < handResults.landmarks.length; i++) {
        const handLandmarks = handResults.landmarks[i];

        // Use the current model URL dynamically
        console.log(`Using model URL: ${currentModelUrl}`);
        await createGLBModel(scene, currentModelUrl, i);

        // Update the model's position, scale, and visibility
        updateGLBModel(scene, handLandmarks, videoWidth, videoHeight, i);
      }
    }

    // Hide models for hands that are no longer detected
    for (let i = handResults.landmarks.length; i < 2; i++) {
      updateGLBModel(scene, null, videoWidth, videoHeight, i);
    }
  } catch (error) {
    console.error('Error processing hand landmarks:', error);
  }
}