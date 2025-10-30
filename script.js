// API Configuration
const TMDB_API_KEY = 'YOUR_TMDB_API_KEY_HERE'; // Replace with your TMDb API key
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';
const OMDB_API_KEY = 'YOUR_OMDB_API_KEY_HERE'; // Optional: Replace with your OMDb API key

// Mood to Genre Mapping
const moodGenreMap = {
    happy: [35, 10751, 16], // Comedy, Family, Animation
    sad: [18, 10749], // Drama, Romance
    excited: [28, 12, 878], // Action, Adventure, Sci-Fi
    romantic: [10749, 35], // Romance, Comedy
    adventurous: [12, 14, 878], // Adventure, Fantasy, Sci-Fi
    mysterious: [9648, 53, 80] // Mystery, Thriller, Crime
};

// State Management
let currentMood = null;
let currentMovies = [];
let watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];

// DOM Elements
const moodButtons = document.querySelectorAll('.mood-btn');
const surpriseBtn = document.getElementById('surpriseBtn');
const moviesGrid = document.getElementById('moviesGrid');
const watchlistGrid = document.getElementById('watchlistGrid');
const loading = document.getElementById('loading');
const errorMessage = document.getElementById('errorMessage');
const yearFilter = document.getElementById('yearFilter');
const ratingFilter = document.getElementById('ratingFilter');
const moviesView = document.getElementById('moviesView');
const watchlistView = document.getElementById('watchlistView');
const moviesSection = document.getElementById('moviesSection');
const watchlistSection = document.getElementById('watchlistSection');
const movieModal = document.getElementById('movieModal');
const watchlistCount = document.getElementById('watchlistCount');
const emptyWatchlist = document.getElementById('emptyWatchlist');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
    updateWatchlistCount();
    
    // Check for mood parameter in URL
    const urlParams = new URLSearchParams(window.location.search);
    const moodParam = urlParams.get('mood');
    if (moodParam && moodGenreMap[moodParam]) {
        selectMood(moodParam);
    }
});

function initializeApp() {
    // Mobile menu toggle
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }
}

function setupEventListeners() {
    // Mood selection
    moodButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const mood = btn.dataset.mood;
            selectMood(mood);
        });
    });
    
    // Surprise me button
    surpriseBtn.addEventListener('click', getRandomMovie);
    
    // Filters
    yearFilter.addEventListener('change', applyFilters);
    ratingFilter.addEventListener('change', applyFilters);
    
    // View toggle
    moviesView.addEventListener('click', () => switchView('movies'));
    watchlistView.addEventListener('click', () => switchView('watchlist'));
    
    // Modal close
    movieModal.addEventListener('click', (e) => {
        if (e.target === movieModal || e.target.classList.contains('modal-close')) {
            closeModal();
        }
    });
}

async function selectMood(mood) {
    currentMood = mood;
    
    // Update UI
    moodButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mood === mood);
    });
    
    // Fetch movies
    await fetchMoviesByMood(mood);
}

async function fetchMoviesByMood(mood) {
    showLoading();
    hideError();
    
    try {
        const genres = moodGenreMap[mood];
        const genreString = genres.join(',');
        
        const response = await fetch(
            `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${genreString}&sort_by=popularity.desc&vote_count.gte=100`
        );
        
        if (!response.ok) {
            throw new Error('Failed to fetch movies from TMDb');
        }
        
        const data = await response.json();
        currentMovies = data.results;
        
        applyFilters();
        
    } catch (error) {
        console.error('[v0] Error fetching movies:', error);
        showError('Failed to load movies. Please check your API key and try again.');
        
        // Try OMDb as backup
        if (OMDB_API_KEY && OMDB_API_KEY !== 'YOUR_OMDB_API_KEY_HERE') {
            await fetchFromOMDb(mood);
        }
    } finally {
        hideLoading();
    }
}

async function fetchFromOMDb(mood) {
    try {
        // OMDb doesn't support genre search, so we'll search by keywords
        const keywords = {
            happy: 'comedy',
            sad: 'drama',
            excited: 'action',
            romantic: 'romance',
            adventurous: 'adventure',
            mysterious: 'mystery'
        };
        
        const response = await fetch(
            `https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&s=${keywords[mood]}&type=movie`
        );
        
        const data = await response.json();
        
        if (data.Response === 'True') {
            // Convert OMDb format to TMDb-like format
            currentMovies = data.Search.map(movie => ({
                id: movie.imdbID,
                title: movie.Title,
                poster_path: movie.Poster !== 'N/A' ? movie.Poster : null,
                release_date: movie.Year,
                vote_average: 0,
                isOMDb: true
            }));
            
            displayMovies(currentMovies);
        }
    } catch (error) {
        console.error('[v0] OMDb backup failed:', error);
    }
}

async function getRandomMovie() {
    showLoading();
    hideError();
    
    try {
        const randomPage = Math.floor(Math.random() * 10) + 1;
        const response = await fetch(
            `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&page=${randomPage}`
        );
        
        if (!response.ok) {
            throw new Error('Failed to fetch random movie');
        }
        
        const data = await response.json();
        const randomMovie = data.results[Math.floor(Math.random() * data.results.length)];
        
        await showMovieDetails(randomMovie.id);
        
    } catch (error) {
        console.error('[v0] Error fetching random movie:', error);
        showError('Failed to get random movie. Please try again.');
    } finally {
        hideLoading();
    }
}

function applyFilters() {
    let filteredMovies = [...currentMovies];
    
    // Year filter
    const yearValue = yearFilter.value;
    if (yearValue) {
        filteredMovies = filteredMovies.filter(movie => {
            const year = new Date(movie.release_date).getFullYear();
            
            if (yearValue.includes('-')) {
                const [startYear, endYear] = yearValue.split('-').map(Number);
                return year >= startYear && year <= endYear;
            } else {
                return year === parseInt(yearValue);
            }
        });
    }
    
    // Rating filter
    const ratingValue = parseFloat(ratingFilter.value);
    if (ratingValue > 0) {
        filteredMovies = filteredMovies.filter(movie => movie.vote_average >= ratingValue);
    }
    
    displayMovies(filteredMovies);
}

function displayMovies(movies) {
    moviesGrid.innerHTML = '';
    
    if (movies.length === 0) {
        moviesGrid.innerHTML = '<p class="empty-state">No movies found. Try a different mood or filters.</p>';
        return;
    }
    
    movies.forEach(movie => {
        const card = createMovieCard(movie);
        moviesGrid.appendChild(card);
    });
}

function createMovieCard(movie) {
    const card = document.createElement('div');
    card.className = 'movie-card';
    
    const posterUrl = movie.isOMDb 
        ? movie.poster_path 
        : movie.poster_path 
            ? `${TMDB_IMAGE_BASE}/w500${movie.poster_path}` 
            : '/placeholder.svg?height=300&width=200';
    
    const year = movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A';
    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
    
    const isInWatchlist = watchlist.some(item => item.id === movie.id);
    
    card.innerHTML = `
        <img src="${posterUrl}" alt="${movie.title}" class="movie-poster" loading="lazy">
        <div class="movie-info">
            <h3 class="movie-title">${movie.title}</h3>
            <div class="movie-meta">
                <span class="movie-year">${year}</span>
                <span class="movie-rating">⭐ ${rating}</span>
            </div>
            <div class="movie-actions">
                <button class="action-btn watchlist-btn ${isInWatchlist ? 'active' : ''}" data-movie-id="${movie.id}">
                    ${isInWatchlist ? '✓ In Watchlist' : '+ Watchlist'}
                </button>
            </div>
        </div>
    `;
    
    // Click to view details
    card.addEventListener('click', (e) => {
        if (!e.target.classList.contains('action-btn')) {
            showMovieDetails(movie.id);
        }
    });
    
    // Watchlist button
    const watchlistBtn = card.querySelector('.watchlist-btn');
    watchlistBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleWatchlist(movie);
    });
    
    return card;
}

async function showMovieDetails(movieId) {
    showLoading();
    
    try {
        const response = await fetch(
            `${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&append_to_response=videos,credits`
        );
        
        if (!response.ok) {
            throw new Error('Failed to fetch movie details');
        }
        
        const movie = await response.json();
        
        const backdropUrl = movie.backdrop_path 
            ? `${TMDB_IMAGE_BASE}/original${movie.backdrop_path}` 
            : '/placeholder.svg?height=400&width=900';
        
        const posterUrl = movie.poster_path 
            ? `${TMDB_IMAGE_BASE}/w500${movie.poster_path}` 
            : '/placeholder.svg?height=300&width=200';
        
        const trailer = movie.videos?.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube');
        
        const cast = movie.credits?.cast?.slice(0, 5).map(actor => actor.name).join(', ') || 'N/A';
        
        const genres = movie.genres?.map(g => g.name).join(', ') || 'N/A';
        
        const isInWatchlist = watchlist.some(item => item.id === movie.id);
        
        const modalContent = `
            <div class="modal-header" style="background-image: url('${backdropUrl}')"></div>
            <div class="modal-body-content">
                <h2 class="modal-title">${movie.title}</h2>
                <div class="modal-meta">
                    <span>⭐ ${movie.vote_average?.toFixed(1)}/10</span>
                    <span>📅 ${new Date(movie.release_date).getFullYear()}</span>
                    <span>⏱️ ${movie.runtime} min</span>
                </div>
                
                ${trailer ? `
                    <div class="modal-section">
                        <h3>Trailer</h3>
                        <div class="trailer-container">
                            <iframe 
                                src="https://www.youtube.com/embed/${trailer.key}" 
                                frameborder="0" 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                allowfullscreen>
                            </iframe>
                        </div>
                    </div>
                ` : ''}
                
                <div class="modal-section">
                    <h3>Overview</h3>
                    <p class="modal-overview">${movie.overview || 'No overview available.'}</p>
                </div>
                
                <div class="modal-section">
                    <h3>Details</h3>
                    <p><strong>Genres:</strong> ${genres}</p>
                    <p><strong>Cast:</strong> ${cast}</p>
                </div>
                
                <button class="btn btn-primary watchlist-modal-btn" data-movie-id="${movie.id}">
                    ${isInWatchlist ? '✓ In Watchlist' : '+ Add to Watchlist'}
                </button>
            </div>
        `;
        
        document.getElementById('modalBody').innerHTML = modalContent;
        
        // Watchlist button in modal
        const watchlistModalBtn = document.querySelector('.watchlist-modal-btn');
        watchlistModalBtn.addEventListener('click', () => {
            toggleWatchlist(movie);
            watchlistModalBtn.textContent = watchlist.some(item => item.id === movie.id) 
                ? '✓ In Watchlist' 
                : '+ Add to Watchlist';
        });
        
        movieModal.classList.remove('hidden');
        
    } catch (error) {
        console.error('[v0] Error fetching movie details:', error);
        showError('Failed to load movie details. Please try again.');
    } finally {
        hideLoading();
    }
}

function toggleWatchlist(movie) {
    const index = watchlist.findIndex(item => item.id === movie.id);
    
    if (index > -1) {
        watchlist.splice(index, 1);
    } else {
        watchlist.push(movie);
    }
    
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
    updateWatchlistCount();
    
    // Update UI
    if (watchlistSection.classList.contains('hidden')) {
        applyFilters();
    } else {
        displayWatchlist();
    }
}

function displayWatchlist() {
    watchlistGrid.innerHTML = '';
    
    if (watchlist.length === 0) {
        emptyWatchlist.classList.remove('hidden');
        return;
    }
    
    emptyWatchlist.classList.add('hidden');
    
    watchlist.forEach(movie => {
        const card = createMovieCard(movie);
        watchlistGrid.appendChild(card);
    });
}

function updateWatchlistCount() {
    watchlistCount.textContent = watchlist.length;
}

function switchView(view) {
    if (view === 'movies') {
        moviesView.classList.add('active');
        watchlistView.classList.remove('active');
        moviesSection.classList.remove('hidden');
        watchlistSection.classList.add('hidden');
    } else {
        moviesView.classList.remove('active');
        watchlistView.classList.add('active');
        moviesSection.classList.add('hidden');
        watchlistSection.classList.remove('hidden');
        displayWatchlist();
    }
}

function closeModal() {
    movieModal.classList.add('hidden');
}

function showLoading() {
    loading.classList.remove('hidden');
}

function hideLoading() {
    loading.classList.add('hidden');
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
}

function hideError() {
    errorMessage.classList.add('hidden');
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !movieModal.classList.contains('hidden')) {
        closeModal();
    }
});