// // spotify-service.js

// // Spotify API credentials
// const clientId = 'b956ea6c83e44683a1d265b98324d39b';
// const clientSecret = 'a6b69523804d474b9383b861d5779c09';

// // Get access token with proper encoding
// async function getAccessToken() {
//     try {
//         // Create encoded credentials - this is the key fix for the 404 error
//         const encodedCredentials = btoa(`${clientId}:${clientSecret}`);
        
//         const response = await fetch('https://accounts.spotify.com/api/token', {
//             method: 'POST',
//             headers: {
//                 'Authorization': `Basic ${encodedCredentials}`,
//                 'Content-Type': 'application/x-www-form-urlencoded'
//             },
//             body: 'grant_type=client_credentials'
//         });

//         const data = await response.json();
//         if (data.error) {
//             throw new Error(data.error_description || 'Failed to get access token');
//         }
//         return data.access_token;
//     } catch (error) {
//         console.error('Error getting access token:', error);
//         throw error;
//     }
// }

// // Get recommendations with fixed endpoint URLs
// async function fetchRecommendations(mood, genre, region) {
//     const playlistContainer = document.getElementById('playlist');
//     playlistContainer.innerHTML = '<div class="loading">Loading recommendations...</div>';

//     try {
//         // Get fresh access token
//         const accessToken = await getAccessToken();
        
//         // Define mood parameters
//         const moodParams = {
//             limit: 10,
//             market: 'US' // Default market
//         };

//         // Add mood-specific parameters
//         switch (mood) {
//             case 'happy':
//                 moodParams.target_valence = 0.8;
//                 moodParams.target_energy = 0.8;
//                 moodParams.min_popularity = 50;
//                 break;
//             case 'sad':
//                 moodParams.target_valence = 0.2;
//                 moodParams.target_energy = 0.3;
//                 moodParams.min_popularity = 50;
//                 break;
//             case 'energetic':
//                 moodParams.target_energy = 0.9;
//                 moodParams.target_tempo = 130;
//                 moodParams.min_popularity = 50;
//                 break;
//             case 'calm':
//                 moodParams.target_energy = 0.3;
//                 moodParams.target_instrumentalness = 0.5;
//                 moodParams.min_popularity = 50;
//                 break;
//         }

//         // Add genre parameter
//         if (genre && genre !== '') {
//             moodParams.seed_genres = genre;
//         } else {
//             // Default genres based on mood
//             const moodGenres = {
//                 happy: 'pop',
//                 sad: 'acoustic',
//                 energetic: 'dance',
//                 calm: 'classical'
//             };
//             moodParams.seed_genres = moodGenres[mood] || 'pop';
//         }

//         // Add region-specific market if selected
//         if (region) {
//             moodParams.market = region === 'american' ? 'US' : 
//                                region === 'indian' ? 'IN' : 
//                                region === 'korean' ? 'KR' : 
//                                region === 'spanish' ? 'ES' : 'US';
//         }

//         // Build URL with parameters
//         const params = new URLSearchParams(moodParams);
//         const requestUrl = `https://api.spotify.com/v1/recommendations?${params.toString()}`;

//         // Make request with proper authorization
//         const response = await fetch(requestUrl, {
//             headers: {
//                 'Authorization': `Bearer ${accessToken}`
//             }
//         });

//         if (!response.ok) {
//             throw new Error(`API request failed with status ${response.status}`);
//         }

//         const data = await response.json();
        
//         if (!data.tracks || data.tracks.length === 0) {
//             playlistContainer.innerHTML = '<div class="loading">No tracks found. Try different filters.</div>';
//             return;
//         }

//         // Display the tracks
//         displayRecommendations(data.tracks);

//     } catch (error) {
//         console.error('Error fetching recommendations:', error);
//         playlistContainer.innerHTML = `<div class="loading">Error: ${error.message}. Please try again.</div>`;
//     }
// }

// // Display recommendations
// function displayRecommendations(tracks) {
//     const playlistContainer = document.getElementById('playlist');
//     playlistContainer.innerHTML = '';

//     tracks.forEach(track => {
//         const trackElement = document.createElement('div');
//         trackElement.classList.add('track');
        
//         const imageUrl = track.album.images[0]?.url || '/placeholder-image.jpg';
        
//         trackElement.innerHTML = `
//             <div class="track-info">
//                 <img src="${imageUrl}" alt="${track.name}" class="track-image">
//                 <div class="track-details">
//                     <h4>${track.name}</h4>
//                     <p>${track.artists.map(artist => artist.name).join(', ')}</p>
//                 </div>
//             </div>
//             <div class="track-controls">
//                 <a href="${track.external_urls.spotify}" target="_blank" class="track-link">
//                     <i class="fa-brands fa-spotify"></i> Listen
//                 </a>
//             </div>
//         `;
        
//         playlistContainer.appendChild(trackElement);
//     });
// }

// // Initialize functions
// window.fetchRecommendations = fetchRecommendations;

// // Test connection on load
// document.addEventListener('DOMContentLoaded', async () => {
//     try {
//         const token = await getAccessToken();
//         console.log('Successfully connected to Spotify API');
//     } catch (error) {
//         console.error('Failed to connect to Spotify API:', error);
//     }
// });






// spotify-service.js

const clientId = 'b956ea6c83e44683a1d265b98324d39b'; // Replace with your Spotify Client ID
const clientSecret = 'a6b69523804d474b9383b861d5779c09'; // Replace with your Spotify Client Secret
const redirectUri = 'http://localhost:8888/callback'; // This must match what you've set in your Spotify Developer Dashboard
const scopes = 'user-library-read playlist-modify-public playlist-modify-private';

// Variables to store tokens
let accessToken = '';
let refreshToken = '';

// Function to redirect the user to Spotify's authentication page
function getSpotifyAuthUrl() {
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(
        redirectUri
    )}&scope=${encodeURIComponent(scopes)}`;
    window.location.href = authUrl; // Redirect to Spotify's login page
}

// Function to handle the Spotify redirect and exchange the code for an access token
async function handleSpotifyRedirect() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
        try {
            const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
                },
                body: new URLSearchParams({
                    grant_type: 'authorization_code',
                    code: code,
                    redirect_uri: redirectUri,
                }),
            });

            if (!tokenResponse.ok) {
                throw new Error('Failed to get tokens from Spotify.');
            }

            const tokenData = await tokenResponse.json();
            accessToken = tokenData.access_token;
            refreshToken = tokenData.refresh_token;

            alert('Successfully authenticated with Spotify!');
            console.log('Access Token:', accessToken);

            // Clear the query string
            window.history.replaceState({}, document.title, redirectUri);
        } catch (error) {
            console.error('Error exchanging code for tokens:', error);
        }
    }
}

// Function to fetch recommendations from Spotify
async function fetchSpotifyRecommendations(mood) {
    if (!accessToken) {
        alert('Please authenticate with Spotify first.');
        return;
    }

    const moodParams = {
        seed_genres: mood, // Mood as a genre seed
        limit: 10, // Number of recommendations
        market: 'US', // Change this to 'IN' for Indian tracks
    };

    const params = new URLSearchParams(moodParams);
    const apiUrl = `https://api.spotify.com/v1/recommendations?${params.toString()}`;

    try {
        const response = await fetch(apiUrl, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Error fetching recommendations: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Recommendations:', data.tracks);
        displayRecommendations(data.tracks);
    } catch (error) {
        console.error('Error fetching Spotify recommendations:', error);
    }
}

// Function to display recommendations on the page
function displayRecommendations(tracks) {
    const playlistContainer = document.getElementById('playlist');
    playlistContainer.innerHTML = '';

    tracks.forEach((track) => {
        const trackElement = document.createElement('div');
        trackElement.classList.add('track');

        trackElement.innerHTML = `
            <div>
                <img src="${track.album.images[0]?.url}" alt="${track.name}" />
                <h3>${track.name}</h3>
                <p>${track.artists.map((artist) => artist.name).join(', ')}</p>
                <a href="${track.external_urls.spotify}" target="_blank">Listen on Spotify</a>
            </div>
        `;

        playlistContainer.appendChild(trackElement);
    });
}

// Attach event listeners
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.search.includes('code')) {
        handleSpotifyRedirect(); // Handle redirect if code is present in the URL
    }

    // Add click event to the "Authenticate with Spotify" button
    const authButton = document.getElementById('authButton');
    if (authButton) {
        authButton.addEventListener('click', getSpotifyAuthUrl);
    }
});

// Example of fetching recommendations when a button is clicked
document.querySelector('.mood-btn.happy').addEventListener('click', () => {
    fetchSpotifyRecommendations('pop');
});

document.querySelector('.mood-btn.sad').addEventListener('click', () => {
    fetchSpotifyRecommendations('acoustic');
});
