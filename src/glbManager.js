import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const modelCache = {}; // Cache for loaded models
const handModelMap = {}; // Map hand index to model name
const debugLines = {}; // Debug lines for each hand

// Rotation inversion flags
let invertX = false;
let invertY = true;
let invertZ = false;

const yOffset = -80; // Adjust this value to move the model lower in the Y-axis

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

export async function createGLBModel(scene, modelUrl, handIndex) {
  const modelName = `model${handIndex + 1}`;

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

  if (!handModelMap[handIndex]) {
    const model = modelCache[modelUrl].clone();
    model.name = modelName;

    // Initial properties
    model.rotation.x = Math.PI / 2; // Align model upright
    model.visible = false; // Hidden initially
    scene.add(model);

    // Create a debug line for this hand
    const material = new THREE.LineBasicMaterial({ color: 0xff0000 });
    const geometry = new THREE.BufferGeometry();
    const line = new THREE.Line(geometry, material);
    scene.add(line);
    debugLines[handIndex] = line;

    handModelMap[handIndex] = modelName;
    console.log(`GLB model ${modelName} created and added to the scene.`);
  }
}

export function updateGLBModel(scene, handLandmarks, videoWidth, videoHeight, handIndex) {
  const modelName = handModelMap[handIndex];
  const model = scene.getObjectByName(modelName);

  // Skip if the model or landmarks are not available
  if (!model || !handLandmarks) {
    if (model) {
      model.visible = false; // Hide the model if the hand is no longer detected
    }
    if (debugLines[handIndex]) {
      debugLines[handIndex].visible = false; // Hide debug line
    }
    return;
  }

  // Landmarks for position
  const wrist = handLandmarks[0]; // Wrist
  const indexFingerTip = handLandmarks[8]; // Index finger tip

  // Midpoint between wrist and index finger tip
  const midX = (wrist.x + indexFingerTip.x) / 2;
  const midY = (wrist.y + indexFingerTip.y) / 2;
  const midZ = (wrist.z + indexFingerTip.z) / 2;

  // Convert midpoint to 3D space and apply Y-axis offset
  const x = (midX - 0.5) * videoWidth;
  const y = -(midY - 0.5) * videoHeight + yOffset;
  const z = -midZ * videoWidth;

  // Update model position
  model.position.set(x, y, z);

  // Calculate hand size (distance between wrist and index finger tip for scaling)
  const dx = (indexFingerTip.x - wrist.x) * videoWidth;
  const dy = (indexFingerTip.y - wrist.y) * videoHeight;
  const dz = (indexFingerTip.z - wrist.z) * videoWidth;
  const handLength = Math.sqrt(dx * dx + dy * dy + dz * dz);

  // Dynamically scale the model based on hand size
  const scaleFactor = handLength / 2; // Adjust divisor to tune size
  model.scale.set(scaleFactor, scaleFactor, scaleFactor);

  // Landmarks for rotation
  const indexKnuckle = handLandmarks[5]; // Index finger knuckle
  const pinkyKnuckle = handLandmarks[17]; // Pinky knuckle for orientation

  const vectorX = new THREE.Vector3(
    indexKnuckle.x - wrist.x,
    indexKnuckle.y - wrist.y,
    indexKnuckle.z - wrist.z
  ).normalize();

  const vectorY = new THREE.Vector3(
    pinkyKnuckle.x - wrist.x,
    pinkyKnuckle.y - wrist.y,
    pinkyKnuckle.z - wrist.z
  ).normalize();

  const normalVector = new THREE.Vector3().crossVectors(vectorX, vectorY).normalize();

  // Construct the rotation matrix using hand vectors
  const rotationMatrix = new THREE.Matrix4();
  rotationMatrix.makeBasis(vectorX, normalVector, vectorY);

  // Extract Euler angles
  const euler = new THREE.Euler();
  euler.setFromRotationMatrix(rotationMatrix);

  // Apply inversion if needed
  const rotatedX = invertX ? -euler.x : euler.x;
  const rotatedY = invertY ? -euler.y : euler.y;
  const rotatedZ = invertZ ? -euler.z : euler.z;

  // Apply rotation to the model
  model.rotation.set(rotatedX, rotatedY, rotatedZ);

  // Debug log for angles
  console.log(`Rotation angles for ${modelName}:`);
  console.log(`X: ${THREE.MathUtils.radToDeg(rotatedX)}°`);
  console.log(`Y: ${THREE.MathUtils.radToDeg(rotatedY)}°`);
  console.log(`Z: ${THREE.MathUtils.radToDeg(rotatedZ)}°`);

  model.visible = true; // Make the model visible

  // Update the debug line between knuckles
  if (debugLines[handIndex]) {
    const line = debugLines[handIndex];
    const points = [
      new THREE.Vector3(
        (indexKnuckle.x - 0.5) * videoWidth,
        -(indexKnuckle.y - 0.5) * videoHeight,
        -indexKnuckle.z * videoWidth
      ),
      new THREE.Vector3(
        (pinkyKnuckle.x - 0.5) * videoWidth,
        -(pinkyKnuckle.y - 0.5) * videoHeight,
        -pinkyKnuckle.z * videoWidth
      ),
    ];
    line.geometry.setFromPoints(points);
    line.visible = true;
  }

  console.log(`Updated model ${modelName} position, scale, rotation, and debug line.`);
}

// Function to toggle inversion for debugging
export function toggleInversion(axis) {
  if (axis === 'x') invertX = !invertX;
  if (axis === 'y') invertY = !invertY;
  if (axis === 'z') invertZ = !invertZ;

  console.log(`Inversion toggles: X: ${invertX}, Y: ${invertY}, Z: ${invertZ}`);
}