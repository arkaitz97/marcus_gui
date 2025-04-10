<template>
    <div class="admin-pricerule-list-view p-4">
        <h1 class="text-2xl font-bold mb-6 text-gray-800">Manage Price Rules</h1>
        <p class="text-sm text-gray-600 mb-4">Define price premiums applied when specific pairs of options are selected
            together.</p>

        <form @submit.prevent="addPriceRule"
            class="mb-6 p-4 bg-white rounded-lg shadow grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
                <label for="optionA" class="block text-sm font-medium text-gray-700">If Option ID selected:</label>
                <input type="number" min="1" id="optionA" v-model.number="newPriceRule.part_option_a_id"
                    placeholder="Enter Part Option ID" required
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    :disabled="isSubmitting" />
            </div>
            <div>
                <label for="optionB" class="block text-sm font-medium text-gray-700">And Option ID selected:</label>
                <input type="number" min="1" id="optionB" v-model.number="newPriceRule.part_option_b_id"
                    placeholder="Enter Part Option ID" required
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    :disabled="isSubmitting" />
            </div>
            <div>
                <label for="premium" class="block text-sm font-medium text-gray-700">Add Price Premium ($):</label>
                <input type="number" step="0.01" min="0" id="premium" v-model.number="newPriceRule.price_premium"
                    placeholder="e.g., 25.50" required
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    :disabled="isSubmitting" />
            </div>
            <div class="flex items-end">
                <button type="submit"
                    class="w-full inline-flex justify-center items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 active:bg-blue-900 focus:outline-none focus:border-blue-900 focus:ring ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition ease-in-out duration-150"
                    :disabled="isSubmitting || !newPriceRule.part_option_a_id || !newPriceRule.part_option_b_id || newPriceRule.price_premium === null || newPriceRule.price_premium < 0 || newPriceRule.part_option_a_id === newPriceRule.part_option_b_id">
                    <DollarSign class="w-4 h-4 mr-1 -ml-1" />
                    <span v-if="isSubmitting">Adding...</span>
                    <span v-else>Add Price Rule</span>
                </button>
            </div>
        </form>
        <p v-if="submitStatus" class="mb-4 text-sm" :class="submitError ? 'text-red-600' : 'text-green-600'">
            {{ submitStatus }}
        </p>

        <h2 class="text-xl font-semibold mb-3 text-gray-700">Existing Price Rules</h2>
        <div v-if="isLoading" class="text-center py-6">
            <p class="text-gray-600">Loading price rules...</p>
            <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto mt-3"></div>
        </div>
        <div v-else-if="error" class="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
            role="alert">
            <strong class="font-bold">Error!</strong>
            <span class="block sm:inline"> {{ error }}</span>
        </div>
        <div v-else-if="priceRules.length > 0" class="bg-white shadow overflow-hidden sm:rounded-lg">
            <ul role="list" class="divide-y divide-gray-200">
                <li v-for="rule in priceRules" :key="rule.id"
                    class="px-4 py-3 sm:px-6 flex justify-between items-center hover:bg-gray-50">
                    <div class="text-sm">
                        <span class="font-medium text-gray-700">Rule ID: {{ rule.id }}</span><br>
                        If Option <strong class="text-indigo-600">#{{ rule.part_option_a_id }}</strong> and Option
                        <strong class="text-indigo-600">#{{ rule.part_option_b_id }}</strong> are selected,
                        add <strong class="text-green-600">${{ formatPrice(rule.price_premium) }}</strong> premium.
                        <br><em class="text-xs text-gray-500">(Note: Fetching option names requires enhancement)</em>
                    </div>
                    <div class="space-x-2">
                        <button @click="deletePriceRule(rule.id)"
                            class="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                            :disabled="isDeleting[rule.id]" title="Delete Price Rule">
                            <Trash2 class="w-4 h-4 mr-1" />
                            <span v-if="isDeleting[rule.id]">Deleting...</span>
                            <span v-else>Delete</span>
                        </button>
                    </div>
                </li>
            </ul>
        </div>
        <div v-else class="text-center py-10 border-2 border-dashed border-gray-300 rounded-lg">
            <p class="text-lg text-gray-600">No price rules found.</p>
            <p class="mt-2 text-sm text-gray-500">Use the form above to add price rules between pairs of part options.
            </p>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
// Import the apiService
import apiService from '../../services/apiService';
import { DollarSign, Trash2 } from 'lucide-vue-next';

const priceRules = ref([]);
const isLoading = ref(false);
const error = ref(null);
const isSubmitting = ref(false);
const submitStatus = ref('');
const submitError = ref(false);
const isDeleting = reactive({});

const newPriceRule = reactive({
    part_option_a_id: null,
    part_option_b_id: null,
    price_premium: null,
});

// Format price utility
const formatPrice = (price) => {
    const num = parseFloat(price);
    return isNaN(num) ? '0.00' : num.toFixed(2);
};

// --- Fetch price rules on mount ---
onMounted(async () => {
    isLoading.value = true;
    error.value = null;
    submitStatus.value = ''; // Clear previous status
    try {
        // Use API Service
        const response = await apiService.fetchPriceRules();
        priceRules.value = response.data || []; // Assuming API returns array in response.data
    } catch (err) {
        console.error('Failed to fetch price rules:', err.response?.data || err.message);
        error.value = 'Failed to load price rules. Please try again later.';
    } finally {
        isLoading.value = false;
    }
});

// --- Add a new price rule ---
async function addPriceRule() {
    // Basic Validation
    if (!newPriceRule.part_option_a_id || !newPriceRule.part_option_b_id || newPriceRule.price_premium === null || newPriceRule.price_premium < 0) {
        submitStatus.value = 'Please enter two valid Part Option IDs and a non-negative Price Premium.';
        submitError.value = true;
        return;
    }
    if (newPriceRule.part_option_a_id === newPriceRule.part_option_b_id) {
        submitStatus.value = 'Part Option IDs must be different.';
        submitError.value = true;
        return;
    }

    isSubmitting.value = true;
    submitStatus.value = 'Adding price rule...';
    submitError.value = false;
    // Construct payload expected by API
    const payload = {
        price_rule: {
            ...newPriceRule,
            // Ensure price_premium is a number or string as expected by API
            price_premium: parseFloat(newPriceRule.price_premium) // Sending as number
        }
    };

    try {
        // Use API Service
        const response = await apiService.createPriceRule(payload);
        // Assuming API returns the created rule object in response.data
        if (response.data) {
            priceRules.value.push(response.data); // Add to local list
            submitStatus.value = 'Price rule added successfully!';
            // Reset form
            newPriceRule.part_option_a_id = null;
            newPriceRule.part_option_b_id = null;
            newPriceRule.price_premium = null;
            // Clear success message after delay
            setTimeout(() => { submitStatus.value = ''; }, 3000);
        } else {
            throw new Error("API did not return created price rule data.");
        }
    } catch (err) {
        console.error('Failed to add price rule:', err.response?.data || err.message);
        submitStatus.value = 'Failed to add price rule.';
        if (err.response?.data?.errors) {
            // Format potential validation errors from API
            const errorDetails = Object.entries(err.response.data.errors)
                .map(([field, messages]) => `${field} ${messages.join(', ')}`)
                .join('; ');
            submitStatus.value += ` Details: ${errorDetails}`;
        }
        submitError.value = true;
    } finally {
        isSubmitting.value = false;
    }
}

// --- Delete a price rule ---
async function deletePriceRule(ruleId) {
    if (!confirm(`Are you sure you want to delete price rule ID ${ruleId}?`)) {
        return;
    }
    isDeleting[ruleId] = true; // Set loading state for this specific item
    submitStatus.value = `Deleting price rule ${ruleId}...`; // Provide feedback
    submitError.value = false;
    try {
        // Use API Service
        await apiService.deletePriceRule(ruleId);
        // Remove the rule from the local list for immediate UI update
        priceRules.value = priceRules.value.filter(r => r.id !== ruleId);
        submitStatus.value = `Price rule ${ruleId} deleted successfully.`;
        // Clear success message after delay
        setTimeout(() => { submitStatus.value = ''; }, 3000);
    } catch (err) {
        console.error(`Failed to delete price rule ${ruleId}:`, err.response?.data || err.message);
        submitStatus.value = `Failed to delete price rule ${ruleId}.`;
        submitError.value = true;
    } finally {
        // Remove loading state for this item
        delete isDeleting[ruleId];
    }
}

</script>