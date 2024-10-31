// Check for warning acknowledgment in localStorage
if (!localStorage.getItem('warningAcknowledged')) {
  document.getElementById('warning-box').style.display = 'block';
}

// Handle warning acknowledgment
document.getElementById('understand-button').onclick = function() {
  localStorage.setItem('warningAcknowledged', 'true');
  document.getElementById('warning-box').style.display = 'none';
};

// Initialize the map
const map = L.map('map').setView([51.505, -0.09], 13);

// OpenStreetMap Tile Layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Create a custom marker with the Font Awesome icon
const customIcon = L.icon({
  iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d0/Location_icon_%28black%29.png', // Change to your desired marker URL
  iconSize: [30, 30], // Size of the icon
  iconAnchor: [15, 30], // Point of the icon which will correspond to marker's location
  popupAnchor: [0, -30] // Point from which the popup should open relative to the iconAnchor
});

let droppedLatLng;
const draggableIcon = document.getElementById('draggable-icon');

draggableIcon.addEventListener('dragstart', (event) => {
  event.dataTransfer.setData('text/plain', 'dragging');
});

map.getContainer().addEventListener('dragover', (event) => {
  event.preventDefault();
});

map.getContainer().addEventListener('drop', (event) => {
  event.preventDefault();
  const mapRect = map.getContainer().getBoundingClientRect();
  droppedLatLng = map.containerPointToLatLng([
    event.clientX - mapRect.left,
    event.clientY - mapRect.top
  ]);

  // Add the marker to the map
  L.marker(droppedLatLng, { icon: customIcon }).addTo(map);

  document.getElementById('info-modal').style.display = 'flex';
  document.getElementById('coords-display').innerText = `Coordinates: ${droppedLatLng.lat.toFixed(5)}, ${droppedLatLng.lng.toFixed(5)}`;
});

// Locate Me button functionality
document.getElementById('locate-me').addEventListener('click', () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      map.setView([latitude, longitude], 13);
      L.marker([latitude, longitude], { icon: customIcon }).addTo(map);
    }, () => {
      alert('Unable to retrieve your location.');
    });
  } else {
    alert('Geolocation is not supported by your browser.');
  }
});

// Close the info modal
function closeInfoModal() {
  document.getElementById('info-modal').style.display = 'none';
}

// Show image previews
function showImagePreviews() {
  const previewContainer = document.getElementById('preview-container');
  previewContainer.innerHTML = ''; // Clear previous previews
  const files = document.getElementById('images').files;

  Array.from(files).forEach((file, index) => {
    const img = document.createElement('img');
    img.src = URL.createObjectURL(file);
    img.className = 'preview-image';
    img.onload = function() {
      URL.revokeObjectURL(this.src); // Free memory
    };

    const wrapper = document.createElement('div');
    wrapper.className = 'preview-wrapper';
    wrapper.appendChild(img);

    const closeButton = document.createElement('button');
    closeButton.className = 'close-preview';
    closeButton.innerText = '✖'; // Cross sign
    closeButton.onclick = function() {
      // Remove this image preview
      previewContainer.removeChild(wrapper);
      // Also remove the file from the input
      const dataTransfer = new DataTransfer();
      Array.from(document.getElementById('images').files).forEach((file, i) => {
        if (i !== index) dataTransfer.items.add(file);
      });
      document.getElementById('images').files = dataTransfer.files;
    };
    
    wrapper.appendChild(closeButton);
    previewContainer.appendChild(wrapper);
  });
}

// Send data to Discord via webhook
const webhookURL = 'YOUR_DISCORD_WEBHOOK_URL'; // Update with your Discord webhook URL

function sendToDiscord(title, description, coords) {
  const embed = {
    title: title,
    description: description,
    fields: [
      {
        name: 'Coordinates',
        value: `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`,
      }
    ],
    footer: {
      text: "New Marker Submitted"
    },
    color: 65280 // Green color in Discord
  };

  fetch(webhookURL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ embeds: [embed] }),
  })
  .then(response => response.json())
  .then(data => console.log('Success:', data))
  .catch((error) => console.error('Error:', error));
}

// Submit the marker form
function submitMarkerForm() {
  const title = document.getElementById('title').value;
  const description = document.getElementById('description').value;

  if (!title) {
    alert('Title is required.');
    return;
  }

  sendToDiscord(title, description, droppedLatLng);
  closeInfoModal();
}
