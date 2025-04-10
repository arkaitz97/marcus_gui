<template>
    <div>
        <h1 class="text-2xl font-bold mb-4">{{ pageTitle }}</h1>
        <div v-if="isLoading" class="text-center py-6">
            <p class="text-gray-600">Loading product data...</p>
            <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto mt-3"></div>
        </div>
        <div v-else-if="loadError" class="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
            role="alert">
            <strong class="font-bold">Error!</strong>
            <span class="block sm:inline"> {{ loadError }}</span>
            <p><router-link :to="{ name: 'AdminProductList' }" class="text-red-700 underline font-medium">Return to
                    Products List</router-link></p>
        </div>
        <form v-else @submit.prevent="handleSubmit" class="space-y-4 bg-white p-6 rounded-lg shadow">
            <div>
                <label for="productName" class="block text-sm font-medium text-gray-700">Product Name</label>
                <input type="text" id="productName" v-model="product.name"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required :disabled="isSubmitting">
            </div>
            <div>
                <label for="productDescription" class="block text-sm font-medium text-gray-700">Description</label>
                <textarea id="productDescription" v-model="product.description" rows="4"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    :disabled="isSubmitting"></textarea>
            </div>
            <p v-if="submitStatus" class="mt-4 text-sm" :class="submitError ? 'text-red-600' : 'text-green-600'">
                {{ submitStatus }}
            </p>
            <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <router-link :to="{ name: 'AdminProductList' }"
                    class="inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    :class="{ 'opacity-50 cursor-not-allowed': isSubmitting }" :event="isSubmitting ? '' : 'click'">
                    Cancel
                </router-link>
                <button type="submit"
                    class="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    :disabled="isSubmitting">
                    <span v-if="isSubmitting">Saving...</span>
                    <span v-else>{{ isEditing ? 'Save Changes' : 'Create Product' }}</span>
                </button>
            </div>
        </form>
    </div>
</template>
<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, RouterLink, onBeforeRouteLeave } from 'vue-router';
import apiService from '../../services/apiService';
const props = defineProps({
    id: { 
        type: [String, Number],
        required: false,
        default: null,
    },
});
const router = useRouter();
const product = ref({
    name: '',
    description: ''
});
const isLoading = ref(false); 
const isSubmitting = ref(false); 
const loadError = ref(null); 
const submitStatus = ref(''); 
const submitError = ref(false); 
const initialData = ref(''); 
const isEditing = computed(() => !!props.id);
const productId = computed(() => props.id);
const pageTitle = computed(() => isEditing.value ? `Edit Product (ID: ${productId.value})` : 'Create New Product');
onMounted(() => {
    if (isEditing.value) {
        loadProductData();
    } else {
        product.value = { name: '', description: '' };
        initialData.value = JSON.stringify(product.value); 
    }
});
async function loadProductData() {
    isLoading.value = true;
    loadError.value = null; 
    submitStatus.value = ''; 
    try {
        const response = await apiService.fetchProductDetails(productId.value);
        if (response.data) {
            product.value = {
                name: response.data.name || '',
                description: response.data.description || '',
            };
            initialData.value = JSON.stringify(product.value); 
        } else {
            throw new Error(`Product data not found for ID: ${productId.value}`);
        }
    } catch (err) {
        console.error('Failed to load product data:', err.response?.data || err.message);
        loadError.value = 'Failed to load product data. Please try again or go back.';
    } finally {
        isLoading.value = false;
    }
}
async function handleSubmit() {
    isSubmitting.value = true;
    submitStatus.value = ''; 
    submitError.value = false;
    const payload = { product: { ...product.value } };
    try {
        let response;
        if (isEditing.value) {
            submitStatus.value = 'Updating product...';
            response = await apiService.updateProduct(productId.value, payload);
            submitStatus.value = 'Product updated successfully!';
            initialData.value = JSON.stringify(product.value); 
        } else {
            submitStatus.value = 'Creating product...';
            response = await apiService.createProduct(payload);
            submitStatus.value = 'Product created successfully!';
            const newProductId = response.data?.id; 
            if (newProductId) {
                router.replace({ name: 'AdminProductEdit', params: { id: newProductId } });
            } else {
                console.warn("API did not return new product ID after creation.");
                router.push({ name: 'AdminProductList' });
            }
        }
        console.log('API Response:', response);
        setTimeout(() => { if (!submitError.value) submitStatus.value = ''; }, 3000);
    } catch (err) {
        const action = isEditing.value ? 'updating' : 'creating';
        console.error(`Error ${action} product:`, err.response?.data || err.message);
        submitStatus.value = `Error ${action} product. Please check the details and try again.`;
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
onBeforeRouteLeave((to, from) => {
    if (!isSubmitting.value) {
        const currentData = JSON.stringify(product.value);
        if (currentData !== initialData.value) {
            const answer = window.confirm('You have unsaved changes! Are you sure you want to leave?');
            if (!answer) return false; 
        }
    }
    return true;
});
</script>
<style scoped>
</style>