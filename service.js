const LASTFM_API_KEY = '7426f5bb38a6dbdfecb4da36352fab14';
const LASTFM_API_URL = 'https://ws.audioscrobbler.com/2.0/';
const DEEZER_API_URL = 'https://api.deezer.com';

// Enhanced mood mappings with regional keywords, focusing on Indian genres
const moodMappings = {
    happy: {
        tags: ['happy', 'feelgood', 'upbeat'],
        genres: ['pop', 'dance', 'disco'],
        regional: {
            indian: ['bollywood', 'bhangra', 'happy bollywood', 'classical', 'devotional', 'folk', 'indian pop', 'fusion']
        }
    },
    sad: {
        tags: ['sad', 'melancholic', 'emotional'],
        genres: ['blues', 'acoustic', 'ambient'],
        regional: {
            indian: ['sad bollywood', 'ghazal', 'classical', 'devotional', 'sufi']
        }
    },
    energetic: {
        tags: ['energetic', 'workout', 'party'],
        genres: ['rock', 'electronic', 'dance'],
        regional: {
            indian: ['bhangra', 'dandiya', 'bollywood dance', 'classical fusion', 'folk']
        }
    },
    calm: {
        tags: ['calm', 'relaxing', 'peaceful'],
        genres: ['classical', 'ambient', 'chillout'],
        regional: {
            indian: ['indian classical', 'meditation', 'sufi', 'devotional', 'fusion']
        }
    }
};

async function fetchRecommendations(mood, genre, region) {
    const playlistContainer = document.getElementById('playlist');
    playlistContainer.innerHTML = '<div class="loading">Loading recommendations...</div>';

    try {
        const moodData = moodMappings[mood] || moodMappings.happy;
        let tracks = [];

        // Focus on Indian music when the region is Indian or even if region is not specified
        if (region === 'indian' || region === '') {
            // Always prioritize Indian genres for any mood
            const indianGenres = moodData.regional?.indian || [];
            for (let genre of indianGenres) {
                let indianTracks = await searchDeezerTracks(genre, genre);
                if (indianTracks.length === 0) {
                    indianTracks = await searchLastFmTracks(genre, genre);
                }
                tracks = [...tracks, ...indianTracks];
            }
            // Limit to 20 tracks
            tracks = tracks.slice(0, 20);
        }

        // If no tracks found, try to fall back to mood-based general search
        if (tracks.length === 0) {
            tracks = await searchLastFmTracks(moodData.tags[0], genre);
        }

        // Enhance tracks with additional info
        const enhancedTracks = await Promise.all(
            tracks.map(track => enrichTrackInfo(track))
        );

        displayRecommendations(enhancedTracks);

    } catch (error) {
        console.error('Error:', error);
        playlistContainer.innerHTML = 
            `<div class="loading">Error: ${error.message}. Please try again.</div>`;
    }
}

async function searchDeezerTracks(query, genre) {
    try {
        const genreParam = genre ? `+genre:"${genre}"` : '';
        const response = await fetch(
            `${DEEZER_API_URL}/search?q=${encodeURIComponent(query)}${genreParam}`
        );
        const data = await response.json();
        return (data.data || []).map(track => ({
            name: track.title,
            artist: { name: track.artist.name },
            image: [{ '#text': track.album.cover_medium }],
            duration: track.duration,
            url: track.link,
            listeners: track.rank
        }));
    } catch (error) {
        console.error('Error searching Deezer:', error);
        return [];
    }
}

async function searchLastFmTracks(tag, genre) {
    try {
        const genreParam = genre ? `+tag:${genre}` : '';
        const response = await fetch(
            `${LASTFM_API_URL}?method=tag.gettoptracks&tag=${encodeURIComponent(tag)}${genreParam}&api_key=${LASTFM_API_KEY}&format=json&limit=50`
        );
        const data = await response.json();
        return data.tracks?.track || [];
    } catch (error) {
        console.error('Error searching Last.fm:', error);
        return [];
    }
}

async function enrichTrackInfo(track) {
    try {
        // Try to get additional track info from Last.fm
        const trackInfo = await fetchTrackInfo(track.name, track.artist.name);
        return { ...track, ...trackInfo };
    } catch (error) {
        console.error('Error enriching track:', error);
        return track;
    }
}

async function fetchTrackInfo(trackName, artistName) {
    try {
        const response = await fetch(
            `${LASTFM_API_URL}?method=track.getInfo&api_key=${LASTFM_API_KEY}&format=json&track=${encodeURIComponent(trackName)}&artist=${encodeURIComponent(artistName)}`
        );
        const data = await response.json();
        return data.track || {};
    } catch (error) {
        console.error('Error fetching track info:', error);
        return {};
    }
}

function displayRecommendations(tracks) {
    const playlistContainer = document.getElementById('playlist');
    playlistContainer.innerHTML = '';

    tracks.forEach(track => {
        const imageUrl = track.image?.[2]?.['#text'] || 
                        'https://via.placeholder.com/174x174?text=No+Image';

        const trackElement = document.createElement('div');
        trackElement.classList.add('track');
        
        trackElement.innerHTML = `
            <div class="track-info">
                <img src="${imageUrl}" alt="${track.name}" class="track-image">
                <div class="track-details">
                    <h4>${track.name}</h4>
                    <p>${track.artist.name}</p>
                    ${track.listeners ? `<small>${Number(track.listeners).toLocaleString()} listeners</small>` : ''}
                </div>
            </div>
            <div class="track-controls">
                <a href="${track.url}" target="_blank" class="track-link">
                    <i class="fa-solid fa-play"></i> Listen
                </a>
                ${track.duration ? `<span class="duration">${formatDuration(track.duration)}</span>` : ''}
            </div>
        `;
        
        playlistContainer.appendChild(trackElement);
    });
}

function formatDuration(duration) {
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

window.fetchRecommendations = fetchRecommendations;
window.searchTracks = searchTracks;
