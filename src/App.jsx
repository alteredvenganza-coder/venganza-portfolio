// Updated LatestPremadeShowcase function
function LatestPremadeShowcase() {
    // ...existing code...
    fetch(`https://api.example.com/endpoint?fields=yourFields&limit=50`) // Updated here
        .then(response => response.json())
        .then(data => {
            const caption = data.caption.substring(0, 2200); // Updated here
            // ...existing code...
        });
}

// Updated useInstagramPremades function
function useInstagramPremades() {
    // ...existing code...
    fetch(`https://api.example.com/endpoint?fields=yourFields&limit=50`) // Updated here
        .then(response => response.json())
        .then(data => {
            const caption = data.caption.substring(0, 2200); // Updated here
            // ...existing code...
        });
}