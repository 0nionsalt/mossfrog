// Show warning only if not previously acknowledged
if (!localStorage.getItem('warningAcknowledged')) {
  document.getElementById('warning-box').style.display = 'block';
}

document.getElementById('understand-button').onclick = function() {
  localStorage.setItem('warningAcknowledged', 'true');
  document.getElementById('warning-box').style.display = 'none';
};

// Initialize Map
const map = L.map('map').setView([51.505, -0.09], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

const markerIcon = L.icon({
  iconUrl: 'https://urbexology.com/imgs/marker-icon.png',
  iconSize: [30, 30],
  iconAnchor: [15, 30]
});

document.getElementById('locate-me').onclick = function() {
  if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
          const { latitude, longitude } = position.coords;
          map.setView([latitude, longitude], 13);
          L.marker([latitude, longitude], { icon: markerIcon }).addTo(map)
              .bindPopup("You are here!")
              .openPopup();
      }, function(error) {
          alert("Could not get your location.");
      });
  } else {
      alert("Geolocation is not supported.");
  }
};

const draggableIcon = document.getElementById('draggable-icon');
let newMarker;

draggableIcon.ondragstart = function(event) {
  event.dataTransfer.setData('text/plain', '');
};

map.on('dragover', function(event) {
  event.preventDefault();
});

map.on('drop', function(event) {
  event.preventDefault();
  const coords = map.mouseEventToLatLng(event.originalEvent);

  if (newMarker) map.removeLayer(newMarker);
  newMarker = L.marker(coords, { icon: markerIcon }).addTo(map);
  newMarker.coords = coords;

  showInfoModal(coords);
});

function showInfoModal(coords) {
  console.log("Opening info modal");
  const modal = document.getElementById('info-modal');
  modal.style.display = 'block';

  document.getElementById('coords-display').textContent = 
      `Latitude: ${coords.lat.toFixed(5)}, Longitude: ${coords.lng.toFixed(5)}`;
}

document.getElementById('close-info-modal').onclick = function() {
  document.getElementById('info-modal').style.display = 'none';
};

document.getElementById('submit-marker').onclick = function() {
  const title = document.getElementById('title').value;
  if (!title) {
      alert("Title is required.");
      return;
  }

  const description = document.getElementById('description').value;
  const coords = newMarker.coords;
  const images = document.getElementById('images').files;
  const imageUrls = Array.from(images).map(file => URL.createObjectURL(file));

  const data = {
      title: title,
      description: description,
      coordinates: { latitude: coords.lat, longitude: coords.lng },
      images: imageUrls
  };

  fetch("https://discord.com/api/webhooks/1301545716921008138/PrYGV3lxC99dLqE0WLP0YcfB6g_UauOqxC2pvnDUpwEDpYp3id1DjjNO1-AKWIsUxWnM", {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' }
  }).then(response => {
      if (response.ok) {
          alert("Marker submitted successfully!");
      } else {
          alert("Error submitting marker.");
      }
  });

  closeInfoModal();
};
