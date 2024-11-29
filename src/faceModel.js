import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const modelCache = {}; // Cache for loaded models
const faceModelMap = {}; // Map face index to model name

export async function loadGLBModel(url) {
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    loader.load(
      url,
      (gltf) => {
        resolve(gltf.scene);
      },
      undefined,
      (error) => {
        reject(error);
      }
    );
  });
}

export async function createGLBModelForFace(scene, modelUrl, faceIndex) {
  const modelName = `faceModel${faceIndex + 1}`;

  if (!modelCache[modelUrl]) {
    try {
      const model = await loadGLBModel(modelUrl);
      modelCache[modelUrl] = model;
      console.log(`GLB model loaded and cached: ${modelUrl}`);
    } catch (error) {
      console.error(`Failed to load GLB model ${modelUrl}:`, error);
      return;
    }
  }

  if (!faceModelMap[faceIndex]) {
    const model = modelCache[modelUrl].clone();
    model.name = modelName;

    // Initial properties
    model.rotation.set(0, 1, 0); // Reset initial rotation
    model.visible = false; // Hidden initially
    scene.add(model);

    faceModelMap[faceIndex] = modelName;
    console.log(`GLB model ${modelName} created and added to the scene.`);
  }
}

export function updateGLBModelForFace(scene, faceLandmarks, videoWidth, videoHeight, faceIndex) {
    const modelName = faceModelMap[faceIndex];
    const model = scene.getObjectByName(modelName);
  
    // Skip if the model or landmarks are not available
    if (!model || !faceLandmarks) {
        if (model) {
            model.visible = false; // Hide the model if the face is no longer detected
        }
        return;
    }
  
    // Get the landmarks for the forehead and chin
    const foreheadLandmark = faceLandmarks[10]; // Approximation: landmark 10 is the forehead center
    const chinLandmark = faceLandmarks[152]; // Landmark for the chin
  
    const foreheadX = (foreheadLandmark.x - 0.5) * videoWidth;
    const foreheadY = -(foreheadLandmark.y - 0.5) * videoHeight;
    const foreheadZ = -foreheadLandmark.z * videoWidth;
  
    const chinX = (chinLandmark.x - 0.5) * videoWidth;
    const chinY = -(chinLandmark.y - 0.5) * videoHeight;
    const chinZ = -chinLandmark.z * videoWidth;
  
    // Calculate the vector from chin to forehead
    const chinToForehead = new THREE.Vector3(
        foreheadX - chinX,
        foreheadY - chinY,
        foreheadZ - chinZ
    );

    // Calculate the top of the head as an extension of the chin-forehead vector
    const topOfHead = new THREE.Vector3(
        foreheadX,
        foreheadY - chinToForehead.y * 0.2, // Adjusted factor to raise the hat vertically
        foreheadZ + chinToForehead.z * 0.5  // Z-depth remains unchanged
    );

    // Update model position
    model.position.copy(topOfHead);
  
    // Dynamically scale the model based on the distance between forehead and chin
    const dx = foreheadLandmark.x - chinLandmark.x;
    const dy = foreheadLandmark.y - chinLandmark.y;
    const dz = foreheadLandmark.z - chinLandmark.z;
    const headHeight = Math.sqrt(dx * dx + dy * dy + dz * dz) * videoWidth;
  
    const scaleFactor = headHeight / 2; // Adjust divisor to tune size
    model.scale.set(scaleFactor, scaleFactor, scaleFactor);
  
    model.visible = true; // Make the model visible
    console.log(`Updated model ${modelName} position at top of the head, scaled, and centered.`);
}