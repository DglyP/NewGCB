import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { createGLBModel, updateGLBModel } from './glbManager.js';

export function initializeScene(videoElement) {
  const rect = videoElement.getBoundingClientRect();
  const displayedWidth = rect.width;
  const displayedHeight = rect.height;

  const scene = new THREE.Scene();

  const camera = new THREE.OrthographicCamera(
    -displayedWidth / 2,
    displayedWidth / 2,
    displayedHeight / 2,
    -displayedHeight / 2,
    -1000,
    1000
  );

  const renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById('three-canvas'),
    alpha: true, // To overlay on the video
  });

  renderer.setSize(displayedWidth, displayedHeight);
  camera.position.z = 10;

  // Add lighting and other scene setup here
  // ...

  return { scene, camera, renderer };
}

export function render({ scene, camera, renderer, pointLight }) {
  function animate() {
    requestAnimationFrame(animate);

    // Update the point light position to follow the camera
    if (pointLight) {
      pointLight.position.copy(camera.position);
    }
    //renderer.physicallyCorrectLights = true; // Enable physically correct lighting
    renderer.render(scene, camera);
  }
  animate();
}

export function visualizeLandmarks(scene, allLandmarks, videoWidth, videoHeight, color, groupName) {
  const videoElement = document.getElementById('input-video');
  const rect = videoElement.getBoundingClientRect(); // Get video position and dimensions
  const displayedWidth = rect.width;
  const displayedHeight = rect.height;

  let group = scene.getObjectByName(groupName);
  if (!group) {
    group = new THREE.Group();
    group.name = groupName;
    scene.add(group);
  } else {
    // Clear existing points
    while (group.children.length > 0) {
      const child = group.children.pop();
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
    }
  }

  const geometry = new THREE.BufferGeometry();
  const positions = [];

  allLandmarks.forEach((landmarks) => {
    landmarks.forEach((lm) => {
      positions.push(
        lm.x * displayedWidth - displayedWidth / 2, // Map x-coordinates
        -(lm.y * displayedHeight - displayedHeight / 2), // Map y-coordinates (invert Y-axis)
        lm.z * 500 // Depth scaling
      );
    });
  });

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    size: 10,
    color: color,
  });

  const points = new THREE.Points(geometry, material);

  group.add(points);

  console.log(`Updated group: ${groupName} with ${group.children.length} points objects`);
}

export function setupResizeHandler(renderer, camera, videoElement) {
  function adjustSize() {
    const rect = videoElement.getBoundingClientRect();
    const displayedWidth = rect.width;
    const displayedHeight = rect.height;

    // Update renderer size
    renderer.setSize(displayedWidth, displayedHeight);

    // Update camera frustum
    camera.left = -displayedWidth / 2;
    camera.right = displayedWidth / 2;
    camera.top = displayedHeight / 2;
    camera.bottom = -displayedHeight / 2;
    camera.updateProjectionMatrix();

    console.log('Adjusted renderer and camera size to match video dimensions:', {
      displayedWidth,
      displayedHeight,
    });
  }

  window.addEventListener('resize', adjustSize);

  adjustSize(); // Initial adjustment
}

// Debugging utility to add a static test sphere
export function addTestSphere(scene) {
  const testSphere = new THREE.Mesh(
    new THREE.SphereGeometry(50, 32, 32), // Large sphere for visibility
    new THREE.MeshStandardMaterial({ color: 0xff0000 }) // Light-reactive material
  );
  testSphere.position.set(0, 0, 0); // Centered and in front of the camera
  scene.add(testSphere);

  console.log('Added Test Sphere at (0, 0, 0)');
}

export function getDisplayedVideoDimensions(videoElement) {
  const rect = videoElement.getBoundingClientRect();
  return {
    width: rect.width,
    height: rect.height,
  };
}

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