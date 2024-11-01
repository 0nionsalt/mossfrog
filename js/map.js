// Initialize the map
const map = L.map('map').setView([51.505, -0.09], 13); // Set initial coordinates and zoom level

// Add OpenStreetMap tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
}).addTo(map);

// Array to store markers
const markers = [];

// Function to handle map clicks
map.on('click', function(e) {
    openModal(e.latlng); // Open the modal on map click with coordinates
});

// Function to open the modal
function openModal(latlng) {
    const modal = document.getElementById('info-modal');
    modal.style.display = 'block';

    const submitButton = document.getElementById('submit-info');
    submitButton.onclick = function() {
        const description = document.getElementById('info-input').value;
        const url = document.getElementById('url-input').value;
        const imagePreviews = [
            document.getElementById('image-preview-1').innerHTML,
            document.getElementById('image-preview-2').innerHTML,
            document.getElementById('image-preview-3').innerHTML,
        ];

        if (description) {
            // Create a marker with the description as the popup
            const marker = L.marker(latlng).addTo(map);
            marker.bindPopup(description).openPopup(); // Use the description here

            // Store the marker information if needed
            markers.push({ latlng, description, url, imagePreviews });

            // Close the modal after submission
            modal.style.display = 'none';
            clearModal(); // Clear the modal fields
        } else {
            alert('Please enter a description.');
        }
    };

    // Close modal when user clicks on <span> (x)
    const span = document.getElementsByClassName("close-button")[0];
    span.onclick = function() {
        modal.style.display = "none";
        clearModal(); // Clear the modal fields
    };
}

// Function to clear modal inputs
function clearModal() {
    document.getElementById('info-input').value = '';
    document.getElementById('url-input').value = '';
    document.getElementById('image-upload-1').value = '';
    document.getElementById('image-upload-2').value = '';
    document.getElementById('image-upload-3').value = '';
    document.getElementById('image-preview-1').innerHTML = '';
    document.getElementById('image-preview-2').innerHTML = '';
    document.getElementById('image-preview-3').innerHTML = '';
}

// Function to preview images
function previewImage(input, previewId) {
    const previewContainer = document.getElementById(previewId);
    previewContainer.innerHTML = ''; // Clear previous previews

    for (const file of input.files) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.createElement('img');
            img.src = e.target.result;
            previewContainer.appendChild(img);
        }
        reader.readAsDataURL(file);
    }
}
