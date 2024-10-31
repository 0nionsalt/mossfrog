const map = L.map('map').setView([51.505, -0.09], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '© OpenStreetMap'
}).addTo(map);

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

  document.getElementById('info-modal').style.display = 'flex';
  document.getElementById('coords-display').innerText = `Coordinates: ${droppedLatLng.lat.toFixed(5)}, ${droppedLatLng.lng.toFixed(5)}`;
});

document.getElementById('locate-me').addEventListener('click', () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      map.setView([latitude, longitude], 13);
      L.marker([latitude, longitude]).addTo(map).bindPopup('You are here!').openPopup();
    }, () => {
      alert('Geolocation failed. Please allow location access.');
    });
  } else {
    alert('Geolocation is not supported by your browser.');
  }
});

function closeInfoModal() {
  document.getElementById('info-modal').style.display = 'none';
}

function showImagePreviews() {
  const imagesInput = document.getElementById('images');
  const previewContainer = document.getElementById('preview-container');
  previewContainer.innerHTML = '';
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
        imagesInput.files = new FileListItems(files);
        showImagePreviews();
      };

      previewWrapper.appendChild(img);
      previewWrapper.appendChild(closeButton);
      previewContainer.appendChild(previewWrapper);
    };
    reader.readAsDataURL(file);
  });
}

function submitMarkerForm() {
  const title = document.getElementById('title').value.trim();
  const description = document.getElementById('description').value.trim();
  const imagesInput = document.getElementById('images');
  const images = Array.from(imagesInput.files);

  if (!title) {
    alert('Please enter a title for the abandoned building.');
    return;
  }

  if (images.length > 5) {
    alert('Please select up to 5 images.');
    return;
  }

  if (title && description && droppedLatLng) {
    const marker = L.marker(droppedLatLng).addTo(map)
      .bindPopup(`<strong>${title} (Pending Review)</strong><br>${description}`);
    closeInfoModal();
  }
}