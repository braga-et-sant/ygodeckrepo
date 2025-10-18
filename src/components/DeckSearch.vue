<script setup>
import { ref, watch, computed } from 'vue';
import { fetchDecks, fetchDeckDetails } from '@/services/api'; // NEW: Added fetchDeckDetails

// --- State Variables (Main Search) ---
const searchResults = ref([]);
const totalCount = ref(0);
const currentPage = ref(1);
const limit = ref(25);
const isLoading = ref(false);
const error = ref(null);

// Form Inputs (using ref for reactivity - what the user is typing)
const currentQuery = ref('');
const currentArchetype = ref('');
const currentCard = ref('');

// Trigger Variables (The values used for the actual API call)
const searchTriggerQuery = ref('');
const searchTriggerArchetype = ref('');
const searchTriggerCard = ref('');

// --- State Variables (Detail View) ---
const selectedDeckId = ref(null);
const deckDetails = ref(null);
const isDetailLoading = ref(false);

function calculateTotalCopies(cardList) {
    if (!cardList || cardList.length === 0) {
        return 0;
    }
    // Use the reduce method to sum the 'copies' property of each object in the array
    return cardList.reduce((sum, card) => sum + card.copies, 0);
}


// --- Computed Properties for UI ---
const totalPages = computed(() => {
    return Math.ceil(totalCount.value / limit.value);
});

// --- Search Handler: Updates the trigger variables and resets page to 1 ---
function handleSearch() {
    // 1. Commit the values from the input fields to the trigger fields
    searchTriggerQuery.value = currentQuery.value;
    searchTriggerArchetype.value = currentArchetype.value;
    searchTriggerCard.value = currentCard.value;

    // 2. Reset to page 1 and trigger the search
    currentPage.value = 1;
    performSearch();
}

// --- Core API Fetch Function ---
async function performSearch() {
    isLoading.value = true;
    error.value = null;
    closeDetails(); // Close any open detail view when a new search runs

    const filters = {
        // Use the "Trigger" variables for the actual API call
        q: searchTriggerQuery.value,
        archetype: searchTriggerArchetype.value,
        card: searchTriggerCard.value,
        page: currentPage.value,
        limit: limit.value,
    };

    try {
        const result = await fetchDecks(filters);

        if (result.error) {
            throw new Error(result.error);
        }

        searchResults.value = result.data;
        totalCount.value = result.count;
        currentPage.value = result.page;

    } catch (err) {
        error.value = err.message || 'An unknown error occurred during search.';
        searchResults.value = [];
        totalCount.value = 0;
    } finally {
        isLoading.value = false;
    }
}

// --- Pagination Functions ---
function goToPage(page) {
    if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page;
        performSearch();
    }
}

// --- Detail View Methods ---
async function viewDetails(recordId) {
    selectedDeckId.value = recordId;
    isDetailLoading.value = true;
    deckDetails.value = null;

    // Scroll to the top of the modal/page on open
    window.scrollTo(0, 0);

    try {
        const details = await fetchDeckDetails(recordId);
        // The backend returns keys in lowercase: maindeck, extradeck, sidedeck
        deckDetails.value = details;
    } catch (e) {
        console.error("Failed to load deck details", e);
    } finally {
        isDetailLoading.value = false;
    }
}

function closeDetails() {
    selectedDeckId.value = null;
    deckDetails.value = null;
}

// Initial load (Trigger the search immediately when component mounts)
handleSearch();
</script>

<template>
    <div class="deck-search-container">
        <h1>YGO Deck Search Engine</h1>

        <!-- Detail Modal/Drawer (Shows up when a deck is clicked) -->
        <div v-if="selectedDeckId" class="deck-detail-overlay">
            <div class="modal-content">
                <button @click="closeDetails" class="close-button">X</button>
                <h2>Deck Details</h2>

                <div v-if="isDetailLoading">Loading card list...</div>
                <div v-else-if="deckDetails">

                    <div class="deck-sections">
                        <section>
                            <!-- FIX APPLIED HERE -->
                            <h3>Main Deck ({{ calculateTotalCopies(deckDetails.maindeck) }})</h3>
                            <ul>
                                <li v-for="card in deckDetails.maindeck" :key="card.name">{{ card.copies }}x {{ card.name }}</li>
                            </ul>
                        </section>

                        <section>
                            <!-- FIX APPLIED HERE -->
                            <h3>Extra Deck ({{ calculateTotalCopies(deckDetails.extradeck) }})</h3>
                            <ul>
                                <li v-for="card in deckDetails.extradeck" :key="card.name">{{ card.copies }}x {{ card.name }}</li>
                            </ul>
                        </section>

                        <section>
                            <!-- FIX APPLIED HERE -->
                            <h3>Side Deck ({{ calculateTotalCopies(deckDetails.sidedeck) }})</h3>
                            <ul>
                                <li v-for="card in deckDetails.sidedeck" :key="card.name">{{ card.copies }}x {{ card.name }}</li>
                            </ul>
                        </section>
                    </div>

                </div>
                <div v-else>Could not load details for this deck.</div>
            </div>
        </div>

        <!-- Search & Filter Controls: Bind to 'current' variables -->
        <div class="filters">
            <input v-model="currentQuery" placeholder="Tournament, Deck Name, or Duelist" @keyup.enter="handleSearch" :disabled="isLoading" />
            <input v-model="currentArchetype" placeholder="Filter by Archetype" @keyup.enter="handleSearch" :disabled="isLoading" />
            <input v-model="currentCard" placeholder="Card Name present in deck" @keyup.enter="handleSearch" :disabled="isLoading" />

            <!-- Search Button -->
            <button @click="handleSearch" :disabled="isLoading">Search</button>
        </div>

        <!-- Loading / Error Feedback -->
        <div v-if="isLoading" class="status loading">Loading results...</div>
        <div v-else-if="error" class="status error">Error: {{ error }}</div>

        <!-- Search Results Area -->
        <div v-else-if="searchResults.length">
            <!-- FIX 3: Display total count/pages -->
            <p>Found {{ totalCount }} decks in total. Showing page {{ currentPage }} of {{ totalPages }}.</p>

            <!-- Clickable Deck List -->
            <div class="deck-list-wrapper">
                <div
                    v-for="deck in searchResults"
                    :key="deck.record_id"
                    class="deck-item clickable"
                    @click="viewDetails(deck.record_id)"
                >
                    <strong>{{ deck.tournament }}</strong> ({{ deck.archetype }}) - Duelist: {{ deck.duelist }}
                </div>
            </div>

            <!-- Pagination Controls -->
            <div class="pagination">
                <button @click="goToPage(currentPage - 1)" :disabled="currentPage === 1 || isLoading">Previous</button>
                <span>Page {{ currentPage }}</span>
                <button @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages || isLoading">Next</button>
            </div>
        </div>

        <!-- No Results State -->
        <div v-else class="status no-results">
            No decks found matching your criteria.
        </div>
    </div>
</template>

<style>
/* Basic styling for readability */
.deck-search-container { max-width: 1200px; margin: 0 auto; padding: 20px; }
.filters input { padding: 10px; margin: 5px; border: 1px solid #ccc; width: 25%; }
.deck-list-wrapper { margin-top: 20px; border: 1px solid #eee; }
.deck-item {
    padding: 15px;
    border-bottom: 1px solid #eee;
    cursor: pointer;
    transition: background-color 0.2s;
}
.deck-item:hover { background-color: #f9f9f9; }
.deck-item:last-child { border-bottom: none; }

.pagination { margin-top: 20px; text-align: center; }
.pagination button { padding: 10px 20px; margin: 0 10px; cursor: pointer; }

/* Detail View Modal Styles */
.deck-detail-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}
.modal-content {
    background: white;
    padding: 40px;
    border-radius: 8px;
    max-width: 90%;
    max-height: 90%;
    overflow-y: auto;
    position: relative;
}
.close-button {
    position: absolute;
    top: 10px;
    right: 10px;
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
}
.deck-sections { display: flex; justify-content: space-between; gap: 40px; margin-top: 20px;}
.deck-sections section { flex: 1; border: 1px solid #ddd; padding: 15px; border-radius: 5px;}
.deck-sections ul { list-style: none; padding: 0; }
.deck-sections li { margin-bottom: 5px; font-family: monospace; }

/* Other Status Styles */
.status.loading { color: blue; }
.status.error { color: red; font-weight: bold; }
</style>