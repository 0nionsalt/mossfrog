// Initialize the map and set its view to a default location
var map = L.map('map').setView([51.505, -0.09], 13); // Change latitude and longitude as needed

// Load and display tile layers from OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
}).addTo(map);

// Function to add a pending marker on the map
function addPendingMarker(lat, lng, description, url, images) {
    // Use a different icon for pending markers
    var pendingIcon = L.icon({
        iconUrl: 'https://img.icons8.com/ios-filled/50/FF5733/marker.png', // Change to your desired pending marker icon
        iconSize: [25, 41], // Size of the icon
        iconAnchor: [12, 41], // Point of the icon which will correspond to marker's location
        popupAnchor: [1, -34], // Point from which the popup should open relative to the iconAnchor
    });

    var marker = L.marker([lat, lng], { icon: pendingIcon }).addTo(map);
    
    // Create a popup message including the description, URL, and image previews
    var popupContent = `<strong>${description}</strong><br>`;
    if (url) {
        popupContent += `<a href="${url}" target="_blank">Read more</a><br>`;
    }
    popupContent += `<strong>Pending for Review</strong><br>`;
    images.forEach((img) => {
        if (img) {
            popupContent += `<img src="${img}" style="width:100%; max-width:150px;"/><br>`; // Show image preview
        }
    });
    marker.bindPopup(popupContent).openPopup(); // Popup with pending message
}

// Handle map click to create a marker
map.on('click', function(e) {
    var lat = e.latlng.lat;
    var lng = e.latlng.lng;

    // Open modal to get user information
    var infoModal = document.getElementById('info-modal');
    infoModal.style.display = "block";

    // Handle the submission of information
    document.getElementById('submit-info').onclick = function() {
        var description = document.getElementById('info-input').value.trim() || "Abandoned Building"; // Default description if none given
        var url = document.getElementById('url-input').value.trim(); // Get the URL input
        
        // Collect images
        var images = [];
        var imageUploadPromises = []; // To handle asynchronous file reading
        
        for (let i = 1; i <= 3; i++) {
            var fileInput = document.getElementById(`image-upload-${i}`);
            if (fileInput.files.length > 0) {
                let reader = new FileReader();
                imageUploadPromises.push(new Promise((resolve) => {
                    reader.onload = function(event) {
                        images.push(event.target.result);
                        resolve(); // Resolve the promise when the image is loaded
                    };
                    reader.readAsDataURL(fileInput.files[0]); // Read the image file as a data URL
                }));
            } else {
                images.push(null); // No image uploaded
            }
        }

        // Wait for all images to be loaded before adding the marker
        Promise.all(imageUploadPromises).then(() => {
            addPendingMarker(lat, lng, description, url, images); // Call function to add pending marker
            infoModal.style.display = "none"; // Close modal
        });
    };
});

// Close the modal when the close button is clicked
document.querySelector('.close-button').onclick = function() {
    document.getElementById('info-modal').style.display = "none";
};

// Close the modal if the user clicks anywhere outside of the modal
window.onclick = function(event) {
    var infoModal = document.getElementById('info-modal');
    if (event.target == infoModal) {
        infoModal.style.display = "none";
    }
};

// Function to preview the uploaded image
function previewImage(input, previewId) {
    const previewContainer = document.getElementById(previewId);
    previewContainer.innerHTML = ''; // Clear previous previews
    if (input.files) {
        Array.from(input.files).forEach(file => {
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.style.maxWidth = '100%'; // Set max width for preview
                img.style.marginTop = '5px';
                previewContainer.appendChild(img); // Append image to the preview container
            }
            reader.readAsDataURL(file);
        });
    }
}