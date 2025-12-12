/**
 * Emoji Catalog Explorer - Main JavaScript
 * CS3870 Secure Web Development - Fall 2025
 * 
 * This script handles:
 * - Fetching JSON data asynchronously
 * - Rendering emoji cards dynamically
 * - Search, filter, and sort functionalities
 * - Loading animation with setTimeout
 */

// Global variables to store emoji data
let allEmojis = [];
let filteredEmojis = [];

// GitHub raw URL for the JSON file (replace with your actual GitHub raw URL)
// Example: https://raw.githubusercontent.com/yourusername/yourrepo/main/emojis.json
const GITHUB_JSON_URL = 'emojis.json'; // Using local file for development; replace with GitHub URL

// DOM Elements
const emojiContainer = document.getElementById('emoji-container');
const searchInput = document.getElementById('search-input');
const categorySelect = document.getElementById('category-select');
const sortSelect = document.getElementById('sort-select');
const loadingOverlay = document.getElementById('loading-overlay');
const resultsCount = document.getElementById('results-count');
const clearFiltersBtn = document.getElementById('clear-filters');

/**
 * Show loading overlay
 */
const showLoading = () => {
    loadingOverlay.style.display = 'flex';
};

/**
 * Hide loading overlay
 */
const hideLoading = () => {
    loadingOverlay.style.display = 'none';
};

/**
 * Fetch emoji data from JSON file using async/await
 * Includes error handling for network issues
 */
const fetchEmojiData = async () => {
    try {
        showLoading();
        
        const response = await fetch(GITHUB_JSON_URL);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Simulate network delay for loading animation demonstration
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        return data;
    } catch (error) {
        console.error('Error fetching emoji data:', error);
        displayError('Failed to load emoji data. Please check the JSON file URL and try again.');
        return [];
    } finally {
        hideLoading();
    }
};

/**
 * Display error message to user
 * @param {string} message - Error message to display
 */
const displayError = (message) => {
    emojiContainer.innerHTML = `
        <div class="col-12">
            <div class="alert alert-danger" role="alert">
                <strong>Error:</strong> ${message}
            </div>
        </div>
    `;
};

/**
 * Create a single emoji card HTML
 * @param {Object} emoji - Emoji object with id, name, category, unicode, description
 * @returns {string} HTML string for the card
 */
const createEmojiCard = (emoji) => {
    return `
        <div class="col-sm-6 col-md-4 col-lg-3 mb-4">
            <div class="card emoji-card h-100 shadow-sm">
                <div class="emoji-display">
                    ${emoji.unicode}
                </div>
                <div class="card-body">
                    <span class="category-badge category-${emoji.category}">${emoji.category}</span>
                    <h5 class="card-title">${emoji.name}</h5>
                    <p class="card-text">${emoji.description}</p>
                </div>
            </div>
        </div>
    `;
};

/**
 * Render emoji cards to the container
 * @param {Array} emojis - Array of emoji objects to render
 */
const renderEmojis = (emojis) => {
    if (emojis.length === 0) {
        emojiContainer.innerHTML = `
            <div class="col-12 no-results">
                <div class="no-results-emoji">🔍</div>
                <h4>No emojis found</h4>
                <p>Try adjusting your search or filter criteria.</p>
            </div>
        `;
        resultsCount.textContent = 'Showing 0 emojis';
        return;
    }
    
    // Use map to create HTML for all cards, then join into single string
    const cardsHTML = emojis.map(emoji => createEmojiCard(emoji)).join('');
    emojiContainer.innerHTML = cardsHTML;
    
    // Update results count
    resultsCount.textContent = `Showing ${emojis.length} emoji${emojis.length !== 1 ? 's' : ''}`;
};

/**
 * Get unique categories from emoji data
 * @param {Array} emojis - Array of emoji objects
 * @returns {Array} Sorted array of unique category names
 */
const getUniqueCategories = (emojis) => {
    const categories = emojis.map(emoji => emoji.category);
    return [...new Set(categories)].sort();
};

/**
 * Populate category dropdown with options
 * @param {Array} categories - Array of category names
 */
const populateCategoryDropdown = (categories) => {
    // Clear existing options except the first one ("All Categories")
    categorySelect.innerHTML = '<option value="">All Categories</option>';
    
    // Add category options using forEach
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
    });
};

/**
 * Filter emojis based on search term
 * @param {Array} emojis - Array of emoji objects
 * @param {string} searchTerm - Search string
 * @returns {Array} Filtered array of emojis
 */
const filterBySearch = (emojis, searchTerm) => {
    if (!searchTerm) return emojis;
    
    const term = searchTerm.toLowerCase().trim();
    
    return emojis.filter(emoji => 
        emoji.name.toLowerCase().includes(term) ||
        emoji.description.toLowerCase().includes(term) ||
        emoji.category.toLowerCase().includes(term)
    );
};

/**
 * Filter emojis by category
 * @param {Array} emojis - Array of emoji objects
 * @param {string} category - Category to filter by
 * @returns {Array} Filtered array of emojis
 */
const filterByCategory = (emojis, category) => {
    if (!category) return emojis;
    return emojis.filter(emoji => emoji.category === category);
};

/**
 * Sort emojis by name
 * @param {Array} emojis - Array of emoji objects
 * @param {string} order - Sort order ('asc' for A→Z, 'desc' for Z→A)
 * @returns {Array} Sorted array of emojis
 */
const sortEmojis = (emojis, order) => {
    // Create a copy to avoid mutating original array
    const sorted = [...emojis];
    
    if (order === 'asc') {
        sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (order === 'desc') {
        sorted.sort((a, b) => b.name.localeCompare(a.name));
    }
    
    return sorted;
};

/**
 * Apply all filters and sorting, then render
 * Uses setTimeout to simulate processing delay for user feedback
 */
const applyFiltersAndSort = () => {
    // Show brief loading state
    emojiContainer.innerHTML = '<div class="col-12 text-center py-4"><div class="spinner-border text-primary" role="status"></div></div>';
    
    // Use setTimeout to allow UI to update
    setTimeout(() => {
        const searchTerm = searchInput.value;
        const selectedCategory = categorySelect.value;
        const sortOrder = sortSelect.value;
        
        // Apply filters using chained operations
        let result = filterBySearch(allEmojis, searchTerm);
        result = filterByCategory(result, selectedCategory);
        result = sortEmojis(result, sortOrder);
        
        filteredEmojis = result;
        renderEmojis(filteredEmojis);
    }, 300);
};

/**
 * Clear all filters and reset to initial state
 */
const clearAllFilters = () => {
    searchInput.value = '';
    categorySelect.value = '';
    sortSelect.value = '';
    
    filteredEmojis = [...allEmojis];
    renderEmojis(filteredEmojis);
};

/**
 * Initialize event listeners for search, filter, and sort controls
 */
const initializeEventListeners = () => {
    // Search input - using 'input' event for real-time search
    searchInput.addEventListener('input', (event) => {
        applyFiltersAndSort();
    });
    
    // Category dropdown - using 'change' event
    categorySelect.addEventListener('change', (event) => {
        applyFiltersAndSort();
    });
    
    // Sort dropdown - using 'change' event
    sortSelect.addEventListener('change', (event) => {
        applyFiltersAndSort();
    });
    
    // Clear filters button
    clearFiltersBtn.addEventListener('click', (event) => {
        event.preventDefault();
        clearAllFilters();
    });
    
    // Keyboard accessibility - Enter key on search
    searchInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            applyFiltersAndSort();
        }
    });
};

/**
 * Initialize the application
 * Main entry point - called when DOM is loaded
 */
const initializeApp = async () => {
    console.log('Initializing Emoji Catalog Explorer...');
    
    // Fetch emoji data
    allEmojis = await fetchEmojiData();
    
    if (allEmojis.length > 0) {
        // Store original data
        filteredEmojis = [...allEmojis];
        
        // Populate category dropdown
        const categories = getUniqueCategories(allEmojis);
        populateCategoryDropdown(categories);
        
        // Initial render
        renderEmojis(filteredEmojis);
        
        // Set up event listeners
        initializeEventListeners();
        
        console.log(`Loaded ${allEmojis.length} emojis successfully!`);
    }
};

// Start the application when DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializeApp);
