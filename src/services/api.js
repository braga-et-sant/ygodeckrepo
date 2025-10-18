// src/services/api.js

// Replace this with your actual API Gateway Invoke URL (e.g., https://abcdefg123.execute-api.us-east-1.amazonaws.com/prod/search)
const API_BASE_URL = 'https://5c0sbmte94.execute-api.eu-north-1.amazonaws.com';
const STAGE_NAME = 'prod'; // <-- CRUCIAL: Use your actual stage name

export async function fetchDecks({ q, archetype, card, page, limit = 25 }) {
    // 1. Build the query string dynamically
    const params = new URLSearchParams();
    if (q) params.append('q', q);
    if (archetype) params.append('archetype', archetype);
    if (card) params.append('card', card);
    params.append('page', page);
    params.append('limit', limit);

    const url = `${API_BASE_URL}/${STAGE_NAME}/search?${params.toString()}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data; // Returns the full API response: {count, page, limit, data}

    } catch (error) {
        console.error("Error fetching data:", error);
        // Re-throw or return a structured error
        return { error: error.message, data: [], count: 0, page: 1, limit: 25 };
    }
}
export async function fetchDeckDetails(recordId) {
    // Note the path change: /decks/{recordId}
    const STAGE_NAME = 'prod'; // Or whatever your stage name is

    // Ensure the API_BASE_URL constant is correct (e.g., without trailing slash)
    const BASE = 'https://5c0sbmte94.execute-api.eu-north-1.amazonaws.com';

   const url = `${API_BASE_URL}/${STAGE_NAME}/decks/${recordId}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json(); // Returns the structured deck_details object

    } catch (error) {
        console.error("Error fetching deck details:", error);
        return { error: error.message };
    }
}