// script.js

document.addEventListener('DOMContentLoaded', function() {
    // Initialize mood buttons
    document.querySelectorAll('.mood-btn').forEach(button => {
        button.addEventListener('click', function() {
            // Remove selected class from all buttons
            document.querySelectorAll('.mood-btn').forEach(btn => {
                btn.classList.remove('selected');
            });
            
            // Add selected class to clicked button
            this.classList.add('selected');
            
            // Get current selections
            const mood = this.getAttribute('data-mood');
            const genre = document.getElementById('genre').value;
            const region = document.getElementById('region').value;
            
            // Fetch recommendations
            fetchRecommendations(mood, genre, region);
        });
    });

    // Handle genre changes
    document.getElementById('genre').addEventListener('change', function() {
        const selectedMood = document.querySelector('.mood-btn.selected');
        if (selectedMood) {
            fetchRecommendations(
                selectedMood.getAttribute('data-mood'),
                this.value,
                document.getElementById('region').value
            );
        }
    });

    // Handle region changes
    document.getElementById('region').addEventListener('change', function() {
        const selectedMood = document.querySelector('.mood-btn.selected');
        if (selectedMood) {
            fetchRecommendations(
                selectedMood.getAttribute('data-mood'),
                document.getElementById('genre').value,
                this.value
            );
        }
    });

    // Optional: Select default mood on page load
    const defaultMood = document.querySelector('.mood-btn[data-mood="happy"]');
    if (defaultMood) {
        defaultMood.click();
    }
});

// Function to save playlist (placeholder for now)
function saveCurrentPlaylist() {
    alert('This feature will be implemented soon!');
}