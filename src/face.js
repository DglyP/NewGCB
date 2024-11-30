import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

import { createGLBModelForFace, updateGLBModelForFace } from './faceModel.js';

export async function initializeFaceLandmarker() {
  try {
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm'
    );

    const faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
        delegate: 'GPU',
      },
      runningMode: 'VIDEO',
      numFaces: 1, // Detect up to 1 face
    });

    //console.log('FaceLandmarker initialized:', faceLandmarker);
    return faceLandmarker;
  } catch (error) {
    console.error('Error initializing FaceLandmarker:', error);
    throw error;
  }
}

export async function processFace(faceLandmarker, video, scene) {
  try {
    const faceResults = faceLandmarker.detectForVideo(video, Date.now());
    
    // Get displayed dimensions of the video element
    const rect = video.getBoundingClientRect();
    const videoWidth = rect.width;
    const videoHeight = rect.height;

    if (Array.isArray(faceResults?.faceLandmarks) && faceResults.faceLandmarks.length > 0) {
      const faceIndex = 0; // Assuming only one face is being tracked
      const faceLandmarks = faceResults.faceLandmarks[0];

      // Create and update face model
      const modelUrl = 'models/faceModel.glb'; // Path to your face model
      await createGLBModelForFace(scene, modelUrl, faceIndex);
      updateGLBModelForFace(scene, faceLandmarks, videoWidth, videoHeight, faceIndex);
    }
  } catch (error) {
    console.error('Error processing face landmarks:', error);
  }
}