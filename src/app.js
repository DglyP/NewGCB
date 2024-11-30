const video = document.getElementById('webcam');
const shutterButton = document.getElementById('shutter');
const canvas = document.getElementById('snapshot');
const context = canvas.getContext('2d');
const fileNameInput = document.getElementById('fileName');


// Access the webcam
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
// Initialize the webcam when the page loads
window.addEventListener('load', initWebcam);

