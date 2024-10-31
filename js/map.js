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

// Alternative OpenStreetMap Tile Layer (France)
L.tileLayer('https://a.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Custom icon for draggable marker
const customIcon = L.icon({
  iconUrl: 'https://urbexology.com/imgs/marker-icon.png', // This URL is the original marker icon
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

let droppedLatLng;
const draggableIcon = document.getElementById('draggable-icon');

// Drag start event
draggableIcon.addEventListener('dragstart', (event) => {
  event.dataTransfer.setData('text/plain', 'dragging');
});

// Handle map drop to add marker
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

  document.getElementById('info-modal').style.display = 'flex';
  document.getElementById('coords-display').innerText = `Coordinates: ${droppedLatLng.lat.toFixed(5)}, ${droppedLatLng.lng.toFixed(5)}`;
});

// Locate Me button functionality
document.getElementById('locate-me').addEventListener('click', () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      map.setView([latitude, longitude], 13);
      L.marker([latitude, longitude], { icon: customIcon }).addTo(map).bindPopup('You are here!').openPopup();
    }, () => {
      alert('Geolocation failed. Please allow location access.');
    });
  } else {
    alert('Geolocation is not supported by your browser.');
  }
});

// Close info modal
function closeInfoModal() {
  document.getElementById('info-modal').style.display = 'none';
}

// Show image previews
function showImagePreviews() {
  const previewContainer = document.getElementById('preview-container');
  previewContainer.innerHTML = '';
  const imagesInput = document.getElementById('images');
  const files = Array.from(imagesInput.files);

  files.slice(0, 5).forEach((file, index) => {
    const reader = new FileReader();
    reader.onload = function(e) {
      const previewWrapper = document.createElement('div');
      previewWrapper.classList.add('preview-wrapper');

      const img = document.createElement('img');
      img.src = e.target.result;
      img.classList.add('preview-image');

      const closeButton = document.createElement('button');
      closeButton.classList.add('close-preview');
      closeButton.innerHTML = '✕';
      closeButton.onclick = () => {
        files.splice(index, 1);
        const newFileList = new DataTransfer();
        files.forEach(file => newFileList.items.add(file));
        imagesInput.files = newFileList.files;
        showImagePreviews();
      };

      previewWrapper.appendChild(img);
      previewWrapper.appendChild(closeButton);
      previewContainer.appendChild(previewWrapper);
    };
    reader.readAsDataURL(file);
  });
}

// Submit marker form
function submitMarkerForm() {
  const title = document.getElementById('title').value.trim();
  const description = document.getElementById('description').value.trim();
  const imagesInput = document.getElementById('images');
  const images = Array.from(imagesInput.files);

  if (!title) {
    alert('Please enter a title for the abandoned building.');
    return;
  }

  if (droppedLatLng) {
    const marker = L.marker(droppedLatLng, { icon: customIcon }).addTo(map)
      .bindPopup(`<strong>${title} (Pending Review)</strong><br>${description}`);
    closeInfoModal();
  }
}
