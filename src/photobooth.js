export function setupPhotobooth(videoElement) {
  // Create a container for the photobooth experience
  const videoContainer = document.createElement('div');
  videoContainer.id = 'video-container';
  videoContainer.style.position = 'absolute';
  videoContainer.style.top = '50%';
  videoContainer.style.left = '50%';
  videoContainer.style.transform = 'translate(-50%, -50%)';
  videoContainer.style.width = '80%';
  videoContainer.style.maxWidth = '600px';
  videoContainer.style.aspectRatio = '4 / 3';
  videoContainer.style.border = '15px solid #fff';
  videoContainer.style.borderRadius = '20px';
  videoContainer.style.boxShadow = '0 0 20px rgba(0, 0, 0, 0.5)';
  videoContainer.style.background = '#000';
  videoContainer.style.overflow = 'hidden';

  // Move the video element into the container
  videoElement.style.width = '100%';
  videoElement.style.height = '100%';
  videoElement.style.objectFit = 'cover';
  videoContainer.appendChild(videoElement);

  // Add the container to the document body
  document.body.appendChild(videoContainer);

  // Create a wrapper for the buttons
  const buttonWrapper = document.createElement('div');
  buttonWrapper.id = 'button-wrapper';
  buttonWrapper.style.position = 'absolute';
  buttonWrapper.style.top = 'calc(50% + 260px)'; // Adjust based on video size
  buttonWrapper.style.left = '50%';
  buttonWrapper.style.transform = 'translate(-50%, 0)';
  buttonWrapper.style.textAlign = 'center';

  // Create the shutter button for capturing video and overlay
  const shutterButton = document.createElement('button');
  shutterButton.id = 'shutter-button';
  shutterButton.textContent = '📸 Capture Video + Overlay';
  shutterButton.style.padding = '10px 20px';
  shutterButton.style.fontSize = '18px';
  shutterButton.style.border = 'none';
  shutterButton.style.borderRadius = '5px';
  shutterButton.style.backgroundColor = '#ff6b6b';
  shutterButton.style.color = '#fff';
  shutterButton.style.cursor = 'pointer';
  shutterButton.style.marginRight = '10px';
  shutterButton.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.3)';

  shutterButton.addEventListener('click', () => {
    takePhoto(videoElement, document.getElementById('three-canvas'));
  });

  // Create the shutter button for capturing just the Three.js canvas
  const canvasButton = document.createElement('button');
  canvasButton.id = 'canvas-button';
  canvasButton.textContent = '📸 Capture Canvas Only';
  canvasButton.style.padding = '10px 20px';
  canvasButton.style.fontSize = '18px';
  canvasButton.style.border = 'none';
  canvasButton.style.borderRadius = '5px';
  canvasButton.style.backgroundColor = '#6b6bff';
  canvasButton.style.color = '#fff';
  canvasButton.style.cursor = 'pointer';
  canvasButton.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.3)';

  canvasButton.addEventListener('click', () => {
    takeCanvasPhoto(document.getElementById('three-canvas'));
  });

  // Add buttons to the wrapper
  buttonWrapper.appendChild(shutterButton);
  buttonWrapper.appendChild(canvasButton);

  // Add the wrapper to the body
  document.body.appendChild(buttonWrapper);

  console.log('Photobooth setup complete');
}

// Function to capture video feed and Three.js overlay
function takePhoto(videoElement, threeCanvas) {
  // Get displayed dimensions of the video
  const videoRect = videoElement.getBoundingClientRect();

  // Create a new canvas to combine video and Three.js overlay
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  // Set the canvas size to match the displayed video size
  canvas.width = videoRect.width;
  canvas.height = videoRect.height;

  // Draw the video frame onto the canvas
  context.drawImage(
    videoElement,
    0, 0, videoElement.videoWidth, videoElement.videoHeight, // Source dimensions
    0, 0, canvas.width, canvas.height // Destination dimensions
  );

  // Draw the Three.js canvas overlay
  if (threeCanvas) {
    const threeCanvasRect = threeCanvas.getBoundingClientRect();

    console.log('Three.js Canvas Rect:', threeCanvasRect);

    // Draw Three.js overlay at the same size as the video container
    context.drawImage(
      threeCanvas,
      0, 0, threeCanvas.width, threeCanvas.height, // Source dimensions
      0, 0, canvas.width, canvas.height // Destination dimensions
    );
  } else {
    console.warn('Three.js canvas not found!');
  }

  // Convert the canvas content to an image and download it
  const photoDataURL = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.href = photoDataURL;
  link.download = 'photo_with_overlay.png';
  link.click();

  console.log('Photo taken and saved with Three.js overlay and video');
}

// Function to capture just the Three.js canvas
function takeCanvasPhoto(threeCanvas) {
  if (!threeCanvas) {
    console.warn('Three.js canvas not found!');
    return;
  }

  // Create a new canvas to copy the Three.js content
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  // Set the canvas size to match the Three.js canvas
  canvas.width = threeCanvas.width;
  canvas.height = threeCanvas.height;

  // Copy the Three.js canvas content
  context.drawImage(threeCanvas, 0, 0);

  // Convert the canvas content to an image and download it
  const photoDataURL = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.href = photoDataURL;
  link.download = 'threejs_canvas_photo.png';
  link.click();

  console.log('Photo of Three.js canvas taken and saved');
}