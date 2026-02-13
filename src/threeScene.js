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
    -1000, // Near clipping plane
    1000   // Far clipping plane
  );

  const renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById('three-canvas'),
    preserveDrawingBuffer: true,
    alpha: true, // Transparent background for overlaying on video
  });

  renderer.setSize(displayedWidth, displayedHeight);

  camera.position.z = 10; // Position the camera

  // Add directional light
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5); // Bright white light
  directionalLight.position.set(0, 5, 10); // Above and in front of the camera
  directionalLight.target.position.set(0, 0, 0); // Pointing towards the center
  scene.add(directionalLight);
  scene.add(directionalLight.target); // Add the target to the scene

  // Add directional light helper
  const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 5); // Smaller helper
  //scene.add(directionalLightHelper);

  // Add point light
  const pointLight = new THREE.PointLight(0xffffff, 10, 10000); // Soft white light
  pointLight.position.set(0, 200, 100); // Positioned near the camera
  scene.add(pointLight);

  // Add point light helper
  const pointLightHelper = new THREE.PointLightHelper(pointLight, 5); // Helper for debugging
  //scene.add(pointLightHelper);

  // Add ambient light
  const ambientLight = new THREE.AmbientLight(0x404040, 1); // Subtle ambient light
  scene.add(ambientLight);

  // Add spotlight for focused lighting
  const spotLight = new THREE.SpotLight(0xffffff, 100000); // Bright white spotlight
  spotLight.position.set(0, 200, 100); // Position above and in front of the sphere
  spotLight.angle = Math.PI ; // Narrow beam angle
  spotLight.penumbra = 0.2; // Slightly softer edges
  spotLight.distance = 500000; // Ensure the light reaches the sphere
  spotLight.target.position.set(0, 0, 0); // Pointing towards the sphere
  spotLight.target.updateMatrixWorld(); // Update target's world matrix
  scene.add(spotLight);
  scene.add(spotLight.target); // Add the target to the scene

  // Add spotlight helper
  const spotLightHelper = new THREE.SpotLightHelper(spotLight);
  //scene.add(spotLightHelper);

  // Add axis helper
  const axesHelper = new THREE.AxesHelper(50); // Smaller size for better visibility
  //scene.add(axesHelper);

  // Add test sphere to the scene
  //addTestSphere(scene);

  console.log('Directional Light Helper:', directionalLightHelper);
  console.log('Point Light Helper:', pointLightHelper);
  console.log('Spot Light Helper:', spotLightHelper);
  console.log('Axes Helper:', axesHelper);

  return {
    scene,
    camera,
    renderer,
    pointLight,
    directionalLightHelper,
    pointLightHelper,
    spotLightHelper,
    axesHelper,
  };
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