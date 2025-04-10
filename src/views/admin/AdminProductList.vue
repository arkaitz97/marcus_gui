<template>
    <div class="admin-product-list p-4">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold text-gray-800">Product Management</h1>
            <router-link :to="{ name: 'AdminProductCreate' }"
                class="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 active:bg-blue-900 focus:outline-none focus:border-blue-900 focus:ring ring-blue-300 disabled:opacity-25 transition ease-in-out duration-150">
                <Plus class="w-4 h-4 mr-2" />
                Create New Product
            </router-link>
        </div>
        <div v-if="isLoading" class="text-center py-6">
            <p class="text-gray-600">Loading products...</p>
            <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto mt-3"></div>
        </div>
        <div v-else-if="error"
            class="text-center py-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
            role="alert">
            <strong class="font-bold">Error!</strong>
            <span class="block sm:inline"> {{ error }}</span>
        </div>
        <div v-else-if="products.length > 0" class="bg-white shadow overflow-hidden sm:rounded-lg">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th scope="col"
                            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID
                        </th>
                        <th scope="col"
                            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name
                        </th>
                        <th scope="col"
                            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Description</th>
                        <th scope="col"
                            class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="product in products" :key="product.id">
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ product.id }}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{{ product.name }}</td>
                        <td class="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" :title="product.description">{{
                            product.description }}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                            <router-link :to="{ name: 'AdminProductParts', params: { productId: product.id } }"
                                class="text-green-600 hover:text-green-900 inline-flex items-center"
                                title="Manage Parts">
                                <ListTree class="w-4 h-4" />
                            </router-link>
                            <router-link :to="{ name: 'AdminProductEdit', params: { id: product.id } }"
                                class="text-indigo-600 hover:text-indigo-900 inline-flex items-center"
                                title="Edit Product">
                                <Edit class="w-4 h-4" />
                            </router-link>
                            <button @click="handleDelete(product.id)"
                                class="text-red-600 hover:text-red-900 inline-flex items-center" title="Delete Product">
                                <Trash2 class="w-4 h-4" />
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div v-else class="text-center py-10 border-2 border-dashed border-gray-300 rounded-lg">
            <p class="text-lg text-gray-600">No products found.</p>
            <p class="mt-2 text-sm text-gray-500">Click the button above to create the first product.</p>
        </div>
    </div>
</template>
<script setup>
import { ref, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import apiService from '../../services/apiService';
import { Plus, Edit, Trash2, ListTree } from 'lucide-vue-next';
const products = ref([]);
const isLoading = ref(false);
const error = ref(null);
onMounted(async () => {
    isLoading.value = true;
    error.value = null;
    try {
        const response = await apiService.fetchProducts();
        products.value = response.data || [];
    } catch (err) {
        console.error('Failed to fetch products:', err);
        error.value = 'Failed to load products. Please try again later.';
    } finally {
        isLoading.value = false;
    }
});
const handleDelete = async (productId) => {
    if (!confirm(`Are you sure you want to delete product ID ${productId}? This action cannot be undone.`)) {
        return;
    }
    console.log(`Attempting to delete product ID: ${productId}`);
    try {
        await apiService.deleteProduct(productId);
        products.value = products.value.filter(p => p.id !== productId);
    } catch (err) {
        console.error(`Failed to delete product ${productId}:`, err);
        error.value = `Failed to delete product ${productId}. It might be associated with other data.`;
    }
};
</script>
<style scoped>
.max-w-xs {
    max-width: 20rem;
}
</style>