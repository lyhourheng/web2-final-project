const TMDB_API_KEY = 'YOUR_TMDB_API_KEY_HERE'; // Replace with your TMDb API key
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

// Check if API key is configured
function checkAPIKey() {
    if (!TMDB_API_KEY || TMDB_API_KEY === 'YOUR_TMDB_API_KEY_HERE') {
        const message = 'Please add your TMDb API key to script.js. Get a free key at https://www.themoviedb.org/settings/api';
        console.error(message);
        showError(message);
        return false;
    }
    return true;
}

// Mood to Genre Mapping
const moodGenreMap = {
    happy: [35, 10751, 16], 
    sad: [18, 10749],
    excited: [28, 12, 878],
    romantic: [10749, 35],
    adventurous: [12, 14, 878],
    mysterious: [9648, 53, 80]
};


let currentMood = null;
let currentMovies = [];
let watchlist = [];

// Initialize watchlist with error handling
try {
    const storedWatchlist = localStorage.getItem('watchlist');
    if (storedWatchlist) {
        watchlist = JSON.parse(storedWatchlist);
        // Validate watchlist structure
        if (!Array.isArray(watchlist)) {
            console.warn('Invalid watchlist format, resetting...');
            watchlist = [];
            localStorage.removeItem('watchlist');
        }
    }
} catch (error) {
    console.error('Error loading watchlist:', error);
    watchlist = [];
    localStorage.removeItem('watchlist');
}

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
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const clearSearchBtn = document.getElementById('clearSearchBtn');

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
    if (surpriseBtn) {
        surpriseBtn.addEventListener('click', getRandomMovie);
    }
    
    // Search functionality
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
    
    if (searchBtn) {
        searchBtn.addEventListener('click', performSearch);
    }
    
    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', clearSearch);
    }
    
    // Filters
    if (yearFilter) {
        yearFilter.addEventListener('change', applyFilters);
    }
    if (ratingFilter) {
        ratingFilter.addEventListener('change', applyFilters);
    }
    
    // View toggle
    if (moviesView) {
        moviesView.addEventListener('click', () => switchView('movies'));
    }
    if (watchlistView) {
        watchlistView.addEventListener('click', () => switchView('watchlist'));
    }
    
    // Modal close
    if (movieModal) {
        movieModal.addEventListener('click', (e) => {
            if (e.target === movieModal || e.target.classList.contains('modal-close')) {
                closeModal();
            }
        });
    }
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
    if (!checkAPIKey()) {
        hideLoading();
        return;
    }
    
    showLoading();
    hideError();
    
    try {
        const genres = moodGenreMap[mood];
        const genreString = genres.join(',');
        
        const response = await fetch(
            `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${genreString}&sort_by=popularity.desc&vote_count.gte=100&page=1`
        );
        
        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Invalid API key. Please check your TMDb API key.');
            } else if (response.status === 404) {
                throw new Error('API endpoint not found. Please check your internet connection.');
            } else {
                throw new Error(`Failed to fetch movies (Status: ${response.status})`);
            }
        }
        
        const data = await response.json();
        
        if (!data.results || data.results.length === 0) {
            throw new Error('No movies found for this mood. Try a different selection.');
        }
        
        currentMovies = data.results;
        applyFilters();
        
    } catch (error) {
        console.error('Error fetching movies:', error);
        showError(error.message || 'Failed to load movies. Please check your API key and try again.');
    } finally {
        hideLoading();
    }
}



async function getRandomMovie() {
    if (!checkAPIKey()) {
        return;
    }
    
    showLoading();
    hideError();
    
    try {
        const randomPage = Math.floor(Math.random() * 10) + 1;
        const response = await fetch(
            `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&page=${randomPage}`
        );
        
        if (!response.ok) {
            throw new Error(`Failed to fetch random movie (Status: ${response.status})`);
        }
        
        const data = await response.json();
        
        if (!data.results || data.results.length === 0) {
            throw new Error('No movies available for random selection.');
        }
        
        const randomMovie = data.results[Math.floor(Math.random() * data.results.length)];
        await showMovieDetails(randomMovie.id);
        
    } catch (error) {
        console.error('Error fetching random movie:', error);
        showError(error.message || 'Failed to get random movie. Please try again.');
    } finally {
        hideLoading();
    }
}

function applyFilters() {
    try {
        if (!currentMovies || currentMovies.length === 0) {
            displayMovies([]);
            return;
        }
        
        let filteredMovies = [...currentMovies];
        
        // Year filter with validation
        const yearValue = yearFilter?.value;
        if (yearValue) {
            filteredMovies = filteredMovies.filter(movie => {
                if (!movie.release_date) return false;
                
                try {
                    const year = new Date(movie.release_date).getFullYear();
                    
                    if (yearValue.includes('-')) {
                        const [startYear, endYear] = yearValue.split('-').map(Number);
                        if (isNaN(startYear) || isNaN(endYear)) return true;
                        return year >= startYear && year <= endYear;
                    } else {
                        const targetYear = parseInt(yearValue);
                        if (isNaN(targetYear)) return true;
                        return year === targetYear;
                    }
                } catch (error) {
                    console.warn('Error parsing movie date:', error);
                    return true;
                }
            });
        }
        
        // Rating filter with validation
        const ratingValue = parseFloat(ratingFilter?.value || '0');
        if (!isNaN(ratingValue) && ratingValue > 0) {
            filteredMovies = filteredMovies.filter(movie => {
                const rating = parseFloat(movie.vote_average);
                return !isNaN(rating) && rating >= ratingValue;
            });
        }
        
        displayMovies(filteredMovies);
    } catch (error) {
        console.error('Error applying filters:', error);
        showError('Error filtering movies. Please try again.');
    }
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
    
    // Add animation class
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    
    const posterUrl = movie.poster_path 
        ? `${TMDB_IMAGE_BASE}/w500${movie.poster_path}` 
        : 'https://via.placeholder.com/500x750/1a1a1a/666666?text=No+Poster';
    
    const year = movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A';
    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
    
    const isInWatchlist = watchlist.some(item => item.id === movie.id);
    
    card.innerHTML = `
        <img src="${posterUrl}" alt="${movie.title}" class="movie-poster" loading="lazy" onerror="this.src='https://via.placeholder.com/500x750/1a1a1a/666666?text=No+Image'">
        <div class="movie-info">
            <h3 class="movie-title">${escapeHtml(movie.title)}</h3>
            <div class="movie-meta">
                <span class="movie-year">${year}</span>
                <span class="movie-rating">⭐ ${rating}</span>
            </div>
            <div class="movie-actions">
                <button class="action-btn watchlist-btn ${isInWatchlist ? 'active' : ''}" data-movie-id="${movie.id}" aria-label="${isInWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}">
                    ${isInWatchlist ? '✓ In Watchlist' : '+ Watchlist'}
                </button>
            </div>
        </div>
    `;
    
    // Animate card entrance
    setTimeout(() => {
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
    }, 50);
    
    // Click to view details
    card.addEventListener('click', (e) => {
        if (!e.target.classList.contains('action-btn')) {
            showMovieDetails(movie.id);
        }
    });
    
    // Watchlist button with improved feedback
    const watchlistBtn = card.querySelector('.watchlist-btn');
    watchlistBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleWatchlist(movie);
        
        // Visual feedback
        watchlistBtn.style.transform = 'scale(0.95)';
        setTimeout(() => {
            watchlistBtn.style.transform = 'scale(1)';
        }, 150);
    });
    
    return card;
}

// Helper function to escape HTML and prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

async function showMovieDetails(movieId) {
    if (!checkAPIKey()) {
        return;
    }
    
    showLoading();
    
    try {
        const response = await fetch(
            `${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&append_to_response=videos,credits`
        );
        
        if (!response.ok) {
            throw new Error(`Failed to fetch movie details (Status: ${response.status})`);
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
        console.error('Error fetching movie details:', error);
        showError(error.message || 'Failed to load movie details. Please try again.');
    } finally {
        hideLoading();
    }
}

function toggleWatchlist(movie) {
    try {
        if (!movie || !movie.id) {
            throw new Error('Invalid movie data');
        }
        
        const index = watchlist.findIndex(item => item.id === movie.id);
        
        if (index > -1) {
            watchlist.splice(index, 1);
            showNotification(`${movie.title} removed from watchlist`);
        } else {
            // Limit watchlist size
            if (watchlist.length >= 50) {
                showError('Watchlist is full. Please remove some movies before adding more.');
                return;
            }
            watchlist.push(movie);
            showNotification(`${movie.title} added to watchlist`);
        }
        
        // Save to localStorage with error handling
        try {
            localStorage.setItem('watchlist', JSON.stringify(watchlist));
        } catch (storageError) {
            console.error('LocalStorage error:', storageError);
            showError('Failed to save watchlist. Your storage might be full.');
            return;
        }
        
        updateWatchlistCount();
        
        // Update UI
        if (watchlistSection.classList.contains('hidden')) {
            applyFilters();
        } else {
            displayWatchlist();
        }
    } catch (error) {
        console.error('Error toggling watchlist:', error);
        showError('Failed to update watchlist. Please try again.');
    }
}

// Show temporary notification
function showNotification(message) {
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
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
    if (errorMessage) {
        errorMessage.classList.add('hidden');
    }
}

// Search functionality
function handleSearch() {
    const query = searchInput?.value.trim();
    if (query && query.length > 0) {
        clearSearchBtn?.classList.remove('hidden');
    } else {
        clearSearchBtn?.classList.add('hidden');
    }
}

async function performSearch() {
    const query = searchInput?.value.trim();
    
    if (!query || query.length < 2) {
        showError('Please enter at least 2 characters to search.');
        return;
    }
    
    if (!checkAPIKey()) {
        return;
    }
    
    showLoading();
    hideError();
    currentMood = null;
    
    // Deselect all mood buttons
    moodButtons.forEach(btn => btn.classList.remove('active'));
    
    try {
        const response = await fetch(
            `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=1`
        );
        
        if (!response.ok) {
            throw new Error(`Search failed (Status: ${response.status})`);
        }
        
        const data = await response.json();
        
        if (!data.results || data.results.length === 0) {
            showError(`No movies found for "${query}". Try a different search term.`);
            currentMovies = [];
            displayMovies([]);
        } else {
            currentMovies = data.results;
            applyFilters();
            showNotification(`Found ${data.results.length} movie${data.results.length !== 1 ? 's' : ''} for "${query}"`);
        }
        
    } catch (error) {
        console.error('Error searching movies:', error);
        showError(error.message || 'Failed to search movies. Please try again.');
    } finally {
        hideLoading();
    }
}

function clearSearch() {
    if (searchInput) {
        searchInput.value = '';
    }
    clearSearchBtn?.classList.add('hidden');
    currentMovies = [];
    displayMovies([]);
    hideError();
}

// Enhanced keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // ESC to close modal
    if (e.key === 'Escape' && !movieModal.classList.contains('hidden')) {
        closeModal();
    }
    
    // Ctrl/Cmd + K to focus on mood selection
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const firstMoodBtn = document.querySelector('.mood-btn');
        if (firstMoodBtn) firstMoodBtn.focus();
    }
    
    // Number keys 1-6 to select moods quickly
    if (e.key >= '1' && e.key <= '6' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const target = e.target;
        // Don't trigger if typing in input
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
        
        const moodBtns = document.querySelectorAll('.mood-btn');
        const index = parseInt(e.key) - 1;
        if (moodBtns[index]) {
            moodBtns[index].click();
        }
    }
    
    // R key for random movie (Surprise Me)
    if (e.key === 'r' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const target = e.target;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
        
        const surpriseBtn = document.getElementById('surpriseBtn');
        if (surpriseBtn) surpriseBtn.click();
    }
});

// Add tooltip for keyboard shortcuts
function addKeyboardHints() {
    const moodButtons = document.querySelectorAll('.mood-btn');
    moodButtons.forEach((btn, index) => {
        btn.setAttribute('title', `Press ${index + 1} to select`);
    });
    
    const surpriseBtn = document.getElementById('surpriseBtn');
    if (surpriseBtn) {
        surpriseBtn.setAttribute('title', 'Press R for random movie');
    }
}

// Call this on initialization
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addKeyboardHints);
} else {
    addKeyboardHints();
}