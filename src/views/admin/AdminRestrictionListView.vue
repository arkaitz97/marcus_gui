<template>
    <div class="admin-restriction-list-view p-4">
        <h1 class="text-2xl font-bold mb-6 text-gray-800">Manage Part Restrictions</h1>
        <p class="text-sm text-gray-600 mb-4">Define rules where selecting one option prevents selecting another
            specific option.</p>
        <form @submit.prevent="addRestriction"
            class="mb-6 p-4 bg-white rounded-lg shadow grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
                <label for="optionA" class="block text-sm font-medium text-gray-700">If Option ID is selected:</label>
                <input type="number" min="1" id="optionA" v-model.number="newRestriction.part_option_id"
                    placeholder="Enter Part Option ID" required
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    :disabled="isSubmitting" />
            </div>
            <div>
                <label for="optionB" class="block text-sm font-medium text-gray-700">Then Option ID cannot be
                    selected:</label>
                <input type="number" min="1" id="optionB" v-model.number="newRestriction.restricted_part_option_id"
                    placeholder="Enter Part Option ID" required
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    :disabled="isSubmitting" />
            </div>
            <div class="flex items-end">
                <button type="submit"
                    class="w-full inline-flex justify-center items-center px-4 py-2 bg-red-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-red-700 active:bg-red-900 focus:outline-none focus:border-red-900 focus:ring ring-red-300 disabled:opacity-50 disabled:cursor-not-allowed transition ease-in-out duration-150"
                    :disabled="isSubmitting || !newRestriction.part_option_id || !newRestriction.restricted_part_option_id || newRestriction.part_option_id === newRestriction.restricted_part_option_id">
                    <Ban class="w-4 h-4 mr-1 -ml-1" />
                    <span v-if="isSubmitting">Adding...</span>
                    <span v-else>Add Restriction</span>
                </button>
            </div>
        </form>
        <p v-if="submitStatus" class="mb-4 text-sm" :class="submitError ? 'text-red-600' : 'text-green-600'">
            {{ submitStatus }}
        </p>
        <h2 class="text-xl font-semibold mb-3 text-gray-700">Existing Restrictions</h2>
        <div v-if="isLoading" class="text-center py-6">
            <p class="text-gray-600">Loading restrictions...</p>
            <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto mt-3"></div>
        </div>
        <div v-else-if="error" class="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
            role="alert">
            <strong class="font-bold">Error!</strong>
            <span class="block sm:inline"> {{ error }}</span>
        </div>
        <div v-else-if="restrictions.length > 0" class="bg-white shadow overflow-hidden sm:rounded-lg">
            <ul role="list" class="divide-y divide-gray-200">
                <li v-for="restriction in restrictions" :key="restriction.id"
                    class="px-4 py-3 sm:px-6 flex justify-between items-center hover:bg-gray-50">
                    <div class="text-sm">
                        <span class="font-medium text-gray-700">Rule ID: {{ restriction.id }}</span><br>
                        If Option <strong class="text-indigo-600">#{{ restriction.part_option_id }}</strong> is
                        selected,
                        then Option <strong class="text-red-600">#{{ restriction.restricted_part_option_id }}</strong>
                        cannot be selected.
                        <br><em class="text-xs text-gray-500">(Note: Fetching option names requires enhancement)</em>
                    </div>
                    <div class="space-x-2">
                        <button @click="deleteRestriction(restriction.id)"
                            class="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                            :disabled="isDeleting[restriction.id]" title="Delete Restriction">
                            <Trash2 class="w-4 h-4 mr-1" />
                            <span v-if="isDeleting[restriction.id]">Deleting...</span>
                            <span v-else>Delete</span>
                        </button>
                    </div>
                </li>
            </ul>
        </div>
        <div v-else class="text-center py-10 border-2 border-dashed border-gray-300 rounded-lg">
            <p class="text-lg text-gray-600">No part restrictions found.</p>
            <p class="mt-2 text-sm text-gray-500">Use the form above to add restrictions between part options.</p>
        </div>
    </div>
</template>
<script setup>
import { ref, reactive, onMounted } from 'vue';
import apiService from '../../services/apiService';
import { Ban, Trash2 } from 'lucide-vue-next';
const restrictions = ref([]);
const isLoading = ref(false);
const error = ref(null);
const isSubmitting = ref(false);
const submitStatus = ref('');
const submitError = ref(false);
const isDeleting = reactive({});
const newRestriction = reactive({
    part_option_id: null,
    restricted_part_option_id: null,
});
onMounted(async () => {
    isLoading.value = true;
    error.value = null;
    submitStatus.value = ''; 
    try {
        const response = await apiService.fetchRestrictions();
        restrictions.value = response.data || []; 
    } catch (err) {
        console.error('Failed to fetch restrictions:', err.response?.data || err.message);
        error.value = 'Failed to load restrictions. Please try again later.';
    } finally {
        isLoading.value = false;
    }
});
async function addRestriction() {
    if (!newRestriction.part_option_id || !newRestriction.restricted_part_option_id) {
        submitStatus.value = 'Please enter both Part Option IDs.';
        submitError.value = true;
        return;
    }
    if (newRestriction.part_option_id === newRestriction.restricted_part_option_id) {
        submitStatus.value = 'Part Option IDs must be different.';
        submitError.value = true;
        return;
    }
    isSubmitting.value = true;
    submitStatus.value = 'Adding restriction...';
    submitError.value = false;
    const payload = { part_restriction: { ...newRestriction } };
    try {
        const response = await apiService.createRestriction(payload);
        if (response.data) {
            restrictions.value.push(response.data); 
            submitStatus.value = 'Restriction added successfully!';
            newRestriction.part_option_id = null;
            newRestriction.restricted_part_option_id = null;
            setTimeout(() => { submitStatus.value = ''; }, 3000);
        } else {
            throw new Error("API did not return created restriction data.");
        }
    } catch (err) {
        console.error('Failed to add restriction:', err.response?.data || err.message);
        submitStatus.value = 'Failed to add restriction.';
        if (err.response?.data?.errors) {
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
async function deleteRestriction(restrictionId) {
    if (!confirm(`Are you sure you want to delete restriction ID ${restrictionId}?`)) {
        return;
    }
    isDeleting[restrictionId] = true; 
    submitStatus.value = `Deleting restriction ${restrictionId}...`; 
    submitError.value = false;
    try {
        await apiService.deleteRestriction(restrictionId);
        restrictions.value = restrictions.value.filter(r => r.id !== restrictionId);
        submitStatus.value = `Restriction ${restrictionId} deleted successfully.`;
        setTimeout(() => { submitStatus.value = ''; }, 3000);
    } catch (err) {
        console.error(`Failed to delete restriction ${restrictionId}:`, err.response?.data || err.message);
        submitStatus.value = `Failed to delete restriction ${restrictionId}.`;
        submitError.value = true;
    } finally {
        delete isDeleting[restrictionId];
    }
}
</script>