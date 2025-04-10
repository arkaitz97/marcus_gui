<template>
    <div class="product-list-view p-4">
        <h1 class="text-3xl font-bold mb-6 text-gray-800">Our Bikes</h1>
        <div v-if="isLoading" class="text-center py-10">
            <p class="text-lg text-gray-600">Loading products...</p>
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mt-4"></div>
        </div>
        <div v-else-if="error"
            class="text-center py-10 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
            role="alert">
            <strong class="font-bold">Error!</strong>
            <span class="block sm:inline"> {{ error }}</span>
        </div>
        <div v-else-if="products.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="product in products" :key="product.id"
                class="product-card bg-white rounded-lg shadow overflow-hidden transition-shadow duration-300 hover:shadow-xl flex flex-col">
                <img :src="`https://placehold.co/600x400/e2e8f0/cbd5e0?text=${product.name}`"
                    :alt="`Image of ${product.name}`" class="w-full h-48 object-cover"
                    onerror="this.src='https://placehold.co/600x400/e0e0e0/a0a0a0?text=Image+Not+Found'; this.onerror=null;">

                <div class="p-4 flex flex-col flex-grow">
                    <h2 class="text-xl font-semibold text-gray-800 mb-2">{{ product.name }}</h2>
                    <p class="text-gray-600 text-sm mb-4 flex-grow">{{ product.description }}</p>
                    <router-link :to="{ name: 'ProductDetail', params: { id: product.id } }"
                        class="mt-auto inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-center transition-colors duration-200 text-sm">
                        View Details & Customize
                    </router-link>
                </div>
            </div>
        </div>
        <div v-else class="text-center py-10">
            <p class="text-lg text-gray-600">No bikes available at the moment. Please check back later!</p>
        </div>
    </div>
</template>
<script setup>
import { onMounted } from 'vue';
import { useProductStore } from '../stores/productStore';
import { storeToRefs } from 'pinia';
import { RouterLink } from 'vue-router';
const productStore = useProductStore();
const { products, isLoading, error } = storeToRefs(productStore);
onMounted(() => {
    if (products.value.length === 0) {
        productStore.fetchProducts();
    }
});
</script>
<style scoped>
.product-card {
}
</style>