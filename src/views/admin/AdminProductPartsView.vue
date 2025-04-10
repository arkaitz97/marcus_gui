<template>
    <div class="admin-product-parts-view p-4 md:p-6">
        <div v-if="isLoadingProduct" class="text-center py-6">
            <p class="text-gray-600">Loading product details...</p>
            <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto mt-3"></div>
        </div>
        <div v-else-if="productError"
            class="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong class="font-bold">Error!</strong>
            <span class="block sm:inline"> {{ productError }}</span>
            <p><router-link :to="{ name: 'AdminProductList' }" class="text-red-700 underline font-medium">Return to
                    Products List</router-link></p>
        </div>
        <div v-else-if="product">
            <div class="flex justify-between items-center mb-4">
                <h1 class="text-2xl font-bold text-gray-800">
                    Manage Parts for: <span class="text-blue-600">{{ product.name }}</span> (ID: {{ productId }})
                </h1>
                <router-link :to="{ name: 'AdminProductList' }" class="text-sm text-blue-600 hover:underline">
                    &larr; Back to Products
                </router-link>
            </div>
            <form @submit.prevent="addPart" class="mb-6 p-4 bg-white rounded-lg shadow flex items-end space-x-3">
                <div class="flex-grow">
                    <label for="newPartName" class="block text-sm font-medium text-gray-700">New Part Name</label>
                    <input type="text" id="newPartName" v-model="newPartName" placeholder="e.g., Frame, Wheels, Saddle"
                        required
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        :disabled="isSubmittingPart" />
                </div>
                <button type="submit"
                    class="inline-flex items-center px-4 py-2 bg-green-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-green-700 active:bg-green-900 focus:outline-none focus:border-green-900 focus:ring ring-green-300 disabled:opacity-50 disabled:cursor-not-allowed transition ease-in-out duration-150"
                    :disabled="isSubmittingPart || !newPartName.trim()">
                    <Plus class="w-4 h-4 mr-1 -ml-1" />
                    <span v-if="isSubmittingPart">Adding...</span>
                    <span v-else>Add Part</span>
                </button>
            </form>
            <p v-if="submitStatus" class="mb-4 text-sm" :class="submitError ? 'text-red-600' : 'text-green-600'">
                {{ submitStatus }}
            </p>
            <h2 class="text-xl font-semibold mb-3 text-gray-700">Existing Parts</h2>
            <div v-if="isLoadingParts" class="text-center py-6">
                <p class="text-gray-600">Loading parts...</p>
                <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto mt-3"></div>
            </div>
            <div v-else-if="partsError"
                class="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <strong class="font-bold">Error!</strong>
                <span class="block sm:inline"> {{ partsError }}</span>
            </div>
            <div v-else-if="parts.length > 0" class="bg-white shadow overflow-hidden sm:rounded-lg">
                <ul role="list" class="divide-y divide-gray-200">
                    <li v-for="part in parts" :key="part.id"
                        class="px-4 py-3 sm:px-6 flex justify-between items-center hover:bg-gray-50">
                        <span class="text-sm font-medium text-gray-900">{{ part.name }} (ID: {{ part.id }})</span>
                        <div class="space-x-2">
                            <router-link
                                :to="{ name: 'AdminPartOptions', params: { productId: productId, partId: part.id } }"
                                class="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                title="Manage Options">
                                <Settings class="w-4 h-4 mr-1" /> Options
                            </router-link>
                            <button @click="deletePart(part.id)"
                                class="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                                :disabled="isDeleting[part.id]" title="Delete Part">
                                <Trash2 class="w-4 h-4 mr-1" />
                                <span v-if="isDeleting[part.id]">Deleting...</span>
                                <span v-else>Delete</span>
                            </button>
                        </div>
                    </li>
                </ul>
            </div>
            <div v-else class="text-center py-10 border-2 border-dashed border-gray-300 rounded-lg">
                <p class="text-lg text-gray-600">No parts found for this product.</p>
                <p class="mt-2 text-sm text-gray-500">Use the form above to add the first part.</p>
            </div>
        </div>
    </div>
</template>
<script setup>
import { ref, onMounted, reactive, watch } from 'vue'; 
import { RouterLink, useRoute, onBeforeRouteLeave } from 'vue-router'; 
import apiService from '../../services/apiService';
import { Plus, Trash2, Settings } from 'lucide-vue-next';
const props = defineProps({
    productId: {
        type: [String, Number],
        required: true,
    }
});
const route = useRoute(); 
const product = ref(null);
const parts = ref([]);
const newPartName = ref('');
const isLoadingProduct = ref(false);
const isLoadingParts = ref(false);
const isSubmittingPart = ref(false);
const isDeleting = reactive({}); 
const productError = ref(null);
const partsError = ref(null);
const submitStatus = ref('');
const submitError = ref(false);
const hasUnsavedChanges = ref(false); 
onMounted(async () => {
    isLoadingProduct.value = true;
    isLoadingParts.value = true;
    productError.value = null;
    partsError.value = null;
    submitStatus.value = ''; 
    try {
        const productResponse = await apiService.fetchProductDetails(props.productId);
        if (!productResponse.data) throw new Error(`Product ${props.productId} not found.`);
        product.value = productResponse.data;
    } catch (err) {
        console.error('Failed to fetch product details:', err.response?.data || err.message);
        productError.value = `Failed to load product details (ID: ${props.productId}).`;
    } finally {
        isLoadingProduct.value = false;
    }
    if (product.value) {
        try {
            const partsResponse = await apiService.fetchParts(props.productId);
            parts.value = partsResponse.data || [];
        } catch (err) {
            console.error('Failed to fetch parts:', err.response?.data || err.message);
            partsError.value = `Failed to load parts for product ID: ${props.productId}.`;
        } finally {
            isLoadingParts.value = false;
        }
    } else {
        isLoadingParts.value = false;
    }
});
async function addPart() {
    if (!newPartName.value.trim()) return;
    isSubmittingPart.value = true;
    submitStatus.value = 'Adding part...';
    submitError.value = false;
    const payload = { part: { name: newPartName.value.trim() } };
    try {
        const response = await apiService.createPart(props.productId, payload);
        if (response.data) {
            parts.value.push(response.data); 
            submitStatus.value = 'Part added successfully!';
            newPartName.value = ''; 
            hasUnsavedChanges.value = false; 
            setTimeout(() => { submitStatus.value = ''; }, 3000);
        } else {
            throw new Error("API did not return created part data.");
        }
    } catch (err) {
        console.error('Failed to add part:', err.response?.data || err.message);
        submitStatus.value = 'Failed to add part. Please try again.';
        if (err.response?.data?.errors) {
            submitStatus.value += ` Details: ${JSON.stringify(err.response.data.errors)}`;
        }
        submitError.value = true;
    } finally {
        isSubmittingPart.value = false;
    }
}
async function deletePart(partId) {
    if (!confirm(`Are you sure you want to delete part ID ${partId}? This may also delete associated options and affect existing configurations/orders.`)) {
        return;
    }
    isDeleting[partId] = true; 
    submitStatus.value = `Deleting part ${partId}...`; 
    submitError.value = false;
    try {
        await apiService.deletePart(props.productId, partId);
        parts.value = parts.value.filter(p => p.id !== partId);
        submitStatus.value = `Part ${partId} deleted successfully.`;
        setTimeout(() => { submitStatus.value = ''; }, 3000);
    } catch (err) {
        console.error(`Failed to delete part ${partId}:`, err.response?.data || err.message);
        submitStatus.value = `Failed to delete part ${partId}. It might be referenced elsewhere.`;
        submitError.value = true;
    } finally {
        delete isDeleting[partId];
    }
}
watch(newPartName, (newValue) => {
    hasUnsavedChanges.value = newValue.trim().length > 0;
});
onBeforeRouteLeave((to, from) => {
    if (hasUnsavedChanges.value && !isSubmittingPart.value) {
        const answer = window.confirm('You have entered text for a new part but not saved it. Are you sure you want to leave?');
        if (!answer) return false; 
    }
    return true;
});
</script>
<style scoped>
</style>