# MoodFlix - Movie Recommender Based on Your Mood

A web application that helps you discover movies that match your current emotional state. Built with vanilla JavaScript, HTML, and CSS, featuring mood-based recommendations powered by The Movie Database (TMDb) API.

## 🎯 Core Functionalities Implemented

### ✅ API Integration
- **TMDb API Integration**: Fetches movie data from The Movie Database API
- **Dynamic Data Loading**: Real-time movie discovery based on mood selection
- **Search Functionality**: Search movies by title using TMDb search endpoint
- **Error Handling**: Comprehensive error handling for API failures
- **API Key Validation**: Automatic validation and user-friendly error messages

### ✅ Form with Validation
- **Contact Form**: Full-featured contact form on the About page
- **Real-time Validation**: 
  - Email format validation (RFC-compliant regex)
  - Name validation (2-50 characters, letters only)
  - Required field validation
  - Message length validation (10-1000 characters)
  - Terms and conditions checkbox
- **Visual Feedback**: Error messages and success notifications
- **Input Sanitization**: XSS prevention with HTML escaping
- **LocalStorage**: Form submissions saved to browser storage

### ✅ DOM Manipulation
- **Dynamic Movie Cards**: Programmatically created movie elements
- **Modal System**: Dynamic modal content generation for movie details
- **Filter Application**: Real-time DOM updates based on filter selections
- **Animated Transitions**: Smooth card entrance animations
- **Watchlist Management**: Dynamic add/remove from watchlist with UI updates
- **Search Results**: Dynamic display of search results
- **Notification System**: Toast notifications for user actions

### ✅ Event Handling
- **Click Events**: Mood selection, movie cards, watchlist buttons
- **Form Events**: Input validation, form submission
- **Keyboard Shortcuts**:
  - `Esc`: Close modal
  - `1-6`: Quick mood selection
  - `R`: Random movie (Surprise Me)
  - `Ctrl/Cmd + K`: Focus mood selection
  - `Enter`: Submit search
- **Input Events**: Real-time search, form validation
- **Change Events**: Filter updates, view switching
- **Custom Events**: Modal open/close, watchlist updates

### ✅ Error Handling
- **Try-Catch Blocks**: All async operations wrapped in error handlers
- **API Error Handling**: Specific error messages for different HTTP status codes
- **LocalStorage Errors**: Graceful handling of storage quota exceeded
- **Invalid Data Handling**: Validation and fallbacks for corrupt data
- **Network Errors**: User-friendly messages for connection issues
- **Input Validation**: Comprehensive validation before processing
- **Fallback Mechanisms**: Default values and error recovery

## 🚀 Features

### Mood-Based Discovery
- 6 distinct mood categories (Happy, Sad, Excited, Romantic, Adventurous, Mysterious)
- Genre mapping for each mood
- One-click mood selection

### Advanced Search
- Search movies by title
- Real-time search feedback
- Clear search functionality

### Smart Filters
- Filter by year (with decade ranges)
- Filter by minimum rating
- Combine multiple filters

### Watchlist
- Add/remove movies to personal watchlist
- Persistent storage (survives page refresh)
- Watchlist counter
- Size limit (50 movies)

### Movie Details
- High-quality movie posters and backdrops
- Ratings, release dates, runtime
- Cast information
- Movie trailers (YouTube embedded)
- Plot summaries

### User Experience
- Responsive design (mobile, tablet, desktop)
- Loading indicators
- Error messages
- Success notifications
- Keyboard shortcuts
- Smooth animations
- Accessible (ARIA labels)

## 📋 Setup Instructions

### 1. Get a TMDb API Key

1. Visit [The Movie Database](https://www.themoviedb.org/)
2. Create a free account
3. Go to Settings → API
4. Request an API key (choose "Developer" option)
5. Copy your API key

### 2. Configure the Application

1. Open `script.js`
2. Find line 3:
   ```javascript
   const TMDB_API_KEY = 'YOUR_TMDB_API_KEY_HERE';
   ```
3. Replace `'YOUR_TMDB_API_KEY_HERE'` with your actual API key:
   ```javascript
   const TMDB_API_KEY = 'your_actual_api_key_here';
   ```

### 3. Run the Application

**Option A: Using a Local Server (Recommended)**

Using Python:
```powershell
# Python 3
python -m http.server 8000
```

Using Node.js:
```powershell
npx http-server
```

Using VS Code:
- Install "Live Server" extension
- Right-click `index.html` → "Open with Live Server"

**Option B: Open Directly**
- Simply open `index.html` in your web browser
- Note: Some features might not work due to CORS restrictions

### 4. Access the Application

Open your browser and navigate to:
- `http://localhost:8000` (or the port your server is using)
- Or directly open the `index.html` file

## 📁 Project Structure

```
Final Project/
├── index.html              # Home page
├── recommender.html        # Movie discovery page
├── about.html              # About page with contact form
├── styles.css              # All styling
├── script.js               # Main application logic
├── home.js                 # Home page interactions
├── form-validation.js      # Contact form validation
└── README.md              # This file
```

## 🎮 How to Use

### Discover Movies by Mood
1. Go to "Find Movies" page
2. Click on a mood that matches how you're feeling
3. Browse through the recommended movies
4. Click on any movie for detailed information

### Search for Movies
1. Use the search bar on the "Find Movies" page
2. Type at least 2 characters
3. Press Enter or click the search button
4. Clear search with the X button

### Use Filters
1. Select a year or year range from the dropdown
2. Choose a minimum rating
3. Filters apply automatically

### Manage Watchlist
1. Click "+ Watchlist" on any movie card
2. View your watchlist by clicking "Watchlist" button
3. Remove movies by clicking "✓ In Watchlist"
4. Watchlist persists across sessions

### Try Random Movie
1. Click "🎲 Surprise Me!" button
2. Get a random popular movie suggestion
3. Or press `R` key for quick access

### Submit Feedback
1. Go to "About" page
2. Scroll to "Get in Touch" section
3. Fill out the contact form
4. Form validates in real-time
5. Submit to see success message

## ⌨️ Keyboard Shortcuts

- `1-6`: Select mood (Happy, Sad, Excited, etc.)
- `R`: Random movie (Surprise Me)
- `Esc`: Close modal
- `Ctrl/Cmd + K`: Focus on mood selection
- `Enter`: Submit search

## 🛠️ Technical Implementation

### API Integration
- **Endpoint Used**: TMDb Discover, Search, and Movie Details APIs
- **Authentication**: API key in query parameters
- **Error Handling**: HTTP status code checking, try-catch blocks
- **Data Validation**: Response validation before processing

### Form Validation
- **Client-side**: Real-time validation with regex patterns
- **Patterns Used**:
  - Email: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
  - Name: `/^[a-zA-Z\s]{2,50}$/`
- **Security**: XSS prevention with HTML escaping

### DOM Manipulation
- **Dynamic Creation**: `createElement()`, `innerHTML`, `appendChild()`
- **Event Delegation**: Efficient event handling on dynamic elements
- **State Management**: JavaScript objects for current state
- **LocalStorage**: Persistent data storage

### Event Handling
- **Event Listeners**: `addEventListener()` for all interactions
- **Event Delegation**: Parent element listening for child events
- **Keyboard Events**: `keydown`, `keypress` handlers
- **Form Events**: `submit`, `input`, `blur`, `change`

### Error Handling
- **Try-Catch**: All async operations protected
- **Validation**: Input validation before API calls
- **User Feedback**: Clear error messages
- **Graceful Degradation**: Fallbacks for missing data

## 🎨 Design Features

- **Dark Theme**: Netflix-inspired color scheme
- **Responsive Layout**: CSS Grid and Flexbox
- **Animations**: CSS transitions and transforms
- **Accessibility**: Semantic HTML, ARIA labels
- **Visual Feedback**: Hover states, active states, transitions

## 🔧 Browser Compatibility

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Opera (latest)

## 📊 Data Storage

- **LocalStorage Keys**:
  - `watchlist`: Array of saved movies
  - `contactSubmissions`: Array of form submissions

## 🐛 Troubleshooting

### Movies Not Loading
- Check if API key is correctly configured in `script.js`
- Verify internet connection
- Check browser console for error messages
- Ensure API key is valid on TMDb website

### LocalStorage Issues
- Check if browser allows localStorage
- Clear browser cache and try again
- Check storage quota (50MB limit in most browsers)

### Images Not Loading
- Check internet connection
- TMDb CDN might be temporarily unavailable
- Placeholder images will show automatically

## 📝 License

This is a student project for educational purposes. Movie data and images are provided by TMDb API.

## 🙏 Acknowledgments

- **TMDb**: For providing the comprehensive movie database API
- **Movie Data**: This product uses the TMDb API but is not endorsed or certified by TMDb

## 👨‍💻 Developer

Created as part of INFO 251 - Web Development II course at AUPP.

---

**Enjoy discovering your perfect movie match! 🎬🍿**
