<!-- src/components/AutocompleteInput.vue -->
<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
    modelValue: String, // The text input value (v-model)
    suggestions: Array, // The static list of possible suggestions
    placeholder: String,
    // Add event listeners passed from parent (e.g., @keyup.enter)
    // The AutocompleteInput is designed to pass all events up to the parent component
});

const emit = defineEmits(['update:modelValue', 'keyup.enter']);
const showSuggestions = ref(false);

// Filter the static list based on the user's input
const filteredSuggestions = computed(() => {
    if (!props.modelValue) return [];

    const input = props.modelValue.toLowerCase();

    // Sort the list to show matches that start with the input first
    const sorted = [...props.suggestions].sort((a, b) => {
        const aLower = a.toLowerCase();
        const bLower = b.toLowerCase();
        if (aLower.startsWith(input) && !bLower.startsWith(input)) return -1;
        if (!aLower.startsWith(input) && bLower.startsWith(input)) return 1;
        return aLower.localeCompare(bLower);
    });

    return sorted
        .filter(item => item.toLowerCase().includes(input))
        .slice(0, 8); // Limit to 8 suggestions for clarity
});

// Select a suggestion and close the list
function selectSuggestion(suggestion) {
    emit('update:modelValue', suggestion);
    showSuggestions.value = false;
}
</script>

<template>
    <div class="autocomplete-container">
        <!-- Input field: Uses v-bind and @input for v-model compatibility -->
        <input
            :value="modelValue"
            @input="$emit('update:modelValue', $event.target.value)"
            :placeholder="placeholder"
            @focus="showSuggestions = true"
            @blur="() => { setTimeout(() => showSuggestions = false, 150) }"
            @keyup.enter="$emit('keyup.enter')"
        />

        <!-- Suggestions List -->
        <ul v-if="showSuggestions && filteredSuggestions.length">
            <li
                v-for="suggestion in filteredSuggestions"
                :key="suggestion"
                @mousedown.prevent="selectSuggestion(suggestion)"
            >
                {{ suggestion }}
            </li>
        </ul>
    </div>
</template>

<style scoped>
.autocomplete-container {
    position: relative;
    display: inline-block;
    width: 25%;
    margin: 5px; /* Added margin here to match original input style */
}
.autocomplete-container input {
    padding: 10px;
    border: 1px solid #ccc;
    width: 100%;
    box-sizing: border-box; /* Includes padding and border in the element's total width and height */
}
.autocomplete-container ul {
    position: absolute;
    top: 100%; /* Position right below the input */
    left: 0;
    z-index: 10;
    list-style: none;
    padding: 0;
    margin: 0;
    border: 1px solid #ccc;
    border-top: none;
    background: white;
    width: 100%;
    max-height: 200px;
    overflow-y: auto;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
.autocomplete-container li {
    padding: 8px 10px;
    cursor: pointer;
}
.autocomplete-container li:hover {
    background-color: #f0f0f0;
}
</style>