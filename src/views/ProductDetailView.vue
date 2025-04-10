<template>
    <div class="product-detail-view p-4 md:p-6">
        <router-link :to="{ name: 'ProductList' }" class="text-blue-600 hover:underline mb-4 inline-block">
            &larr; Back to Products
        </router-link>
        <div v-if="productLoading" class="text-center py-10">
            <p class="text-lg text-gray-600">Loading product details...</p>
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mt-4"></div>
        </div>
        <div v-else-if="productError"
            class="text-center py-10 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
            role="alert">
            <strong class="font-bold">Error!</strong>
            <span class="block sm:inline"> {{ productError }}</span>
            <p><router-link :to="{ name: 'ProductList' }" class="text-red-700 underline font-medium">Return to Products
                    List</router-link></p>
        </div>
        <div v-else-if="product" class="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div class="md:col-span-1">
                <h1 class="text-3xl font-bold mb-2 text-gray-900">{{ product.name }}</h1>
                <p class="text-gray-600 mb-4">{{ product.description }}</p>
                <img :src="`https://placehold.co/600x400/e2e8f0/cbd5e0?text=${product.name}`"
                    :alt="`Image of ${product.name}`" class="w-full h-auto rounded-lg shadow-md object-cover mb-6"
                    onerror="this.src='https://placehold.co/600x400/e0e0e0/a0a0a0?text=Image+Not+Found'; this.onerror=null;">
                <div class="bg-gray-100 p-4 rounded-lg shadow-inner">
                    <h3 class="text-lg font-semibold mb-2 text-gray-700">Configuration Price:</h3>
                    <div class="text-3xl font-bold text-blue-700">
                        <span v-if="isCalculatingPrice">Calculating...</span>
                        <span v-else-if="calculatedPrice !== null && calculatedPrice !== 'Error'">${{ calculatedPrice
                        }}</span>
                        <span v-else-if="calculatedPrice === 'Error'" class="text-red-600 text-xl">Error calculating
                            price</span>
                        <span v-else class="text-gray-500">Select options...</span>
                    </div>
                    <div v-if="isValidating" class="mt-2 text-sm text-yellow-600">Validating...</div>
                    <div v-else-if="!isValidSelection && validationErrors.length > 0" class="mt-2 text-sm text-red-600">
                        <p v-for="(err, index) in validationErrors" :key="index">{{ err }}</p>
                    </div>
                    <div v-else-if="!isValidSelection && calculatedPrice !== null" class="mt-2 text-sm text-red-600">
                        Configuration is invalid.
                    </div>
                    <div v-else-if="isValidSelection && calculatedPrice !== null && calculatedPrice !== 'Error'"
                        class="mt-2 text-sm text-green-600">
                        Configuration is valid.
                    </div>
                </div>
            </div>
            <div class="md:col-span-2">
                <h2 class="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">Customize Your Bike</h2>
                <div v-if="!product.parts || product.parts.length === 0" class="text-gray-500">
                    No customization options available for this product yet.
                </div>
                <div v-else v-for="part in product.parts" :key="part.id"
                    class="mb-6 p-4 border rounded-lg bg-white shadow-sm">
                    <h3 class="text-lg font-medium mb-3 text-gray-700">{{ part.name }}</h3>
                    <div v-if="!part.part_options || part.part_options.length === 0"
                        class="text-sm text-gray-500 italic">
                        No options available for this part.
                    </div>
                    <div v-else class="space-y-2">
                        <label v-for="option in part.part_options" :key="option.id" :class="[
                            'flex items-center p-3 border rounded-md cursor-pointer transition-colors duration-150',
                            selectedOptions[part.id] === option.id ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-200' : 'bg-white border-gray-200 hover:bg-gray-50',
                            !option.in_stock ? 'opacity-50 cursor-not-allowed bg-gray-100' : ''
                        ]">
                            <input type="radio" :name="`part-${part.id}`" :value="option.id"
                                :checked="selectedOptions[part.id] === option.id"
                                @change="selectOption(part.id, option.id)" :disabled="!option.in_stock"
                                class="form-radio h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 mr-3">
                            <span class="flex-grow text-sm text-gray-800">{{ option.name }}</span>
                            <span v-if="!option.in_stock" class="text-xs text-red-500 font-semibold mr-2">(Out of
                                Stock)</span>
                            <span class="text-sm font-medium text-gray-600">${{ parseFloat(option.price || 0).toFixed(2)
                            }}</span>
                        </label>
                    </div>
                </div>
                <div class="mt-8 pt-6 border-t">
                    <h3 class="text-xl font-semibold mb-4">Ready to Add?</h3>
                    <button @click="handleAddToCart"
                        :disabled="!isValidSelection || isCalculatingPrice || isValidating || selectedOptionIds.length === 0 || calculatedPrice === null || calculatedPrice === 'Error' || !isConfigurationComplete"
                        :class="[
                            'w-full py-3 px-4 rounded-md font-semibold text-white transition-colors duration-200 flex items-center justify-center',
                            (!isValidSelection || isCalculatingPrice || isValidating || selectedOptionIds.length === 0 || calculatedPrice === null || calculatedPrice === 'Error' || !isConfigurationComplete)
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-green-600 hover:bg-green-700'
                        ]">
                        <ShoppingCart class="w-5 h-5 mr-2" /> Add to Cart
                    </button>
                    <p v-if="cartStatus" class="mt-4 text-center text-green-600">
                        {{ cartStatus }}
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter, RouterLink } from 'vue-router';
import { useProductStore } from '../stores/productStore';
import { useCustomizationStore } from '../stores/customizationStore';
import { useCartStore } from '../stores/cartStore';
import { storeToRefs } from 'pinia';
import { ShoppingCart } from 'lucide-vue-next';
const route = useRoute();
const router = useRouter();
const props = defineProps({
    id: {
        type: [String, Number],
        required: true,
    }
});
const productStore = useProductStore();
const customizationStore = useCustomizationStore();
const cartStore = useCartStore();
const {
    currentProduct: product,
    isLoading: productLoading,
    error: productError
} = storeToRefs(productStore);
const {
    selectedOptions,
    isValidSelection,
    validationErrors,
    calculatedPrice,
    isCalculatingPrice,
    isValidating,
    selectedOptionIds
} = storeToRefs(customizationStore);
const cartStatus = ref('');
const isConfigurationComplete = computed(() => {
    if (!product.value || !product.value.parts) return false;
    return product.value.parts.every(part =>
        selectedOptions.value[part.id] !== undefined &&
        selectedOptions.value[part.id] !== null
    );
});
const selectOption = (partId, optionId) => {
    customizationStore.selectOption(partId, optionId);
    cartStatus.value = '';
};
const handleAddToCart = () => {
    if (!isValidSelection.value || isCalculatingPrice.value || isValidating.value || selectedOptionIds.value.length === 0 || calculatedPrice.value === null || calculatedPrice.value === 'Error' || !isConfigurationComplete.value) {
        cartStatus.value = 'Cannot add to cart. Configuration invalid or incomplete.';
        setTimeout(() => { cartStatus.value = ''; }, 3000);
        return;
    }
    const configuredBike = {
        productId: props.id,
        productName: product.value?.name || 'Unknown Bike',
        selectedOptionIds: selectedOptionIds.value,
        price: calculatedPrice.value
    };
    cartStore.addItemToCart(configuredBike);
    cartStatus.value = `${configuredBike.productName} added to cart!`;
    setTimeout(() => { cartStatus.value = ''; }, 3000);
};
onMounted(async () => {
    console.log('ProductDetailView mounted for ID:', props.id);
    customizationStore.resetCustomization();
    cartStatus.value = '';
    await productStore.fetchProductDetails(props.id);
    if (selectedOptionIds.value.length > 0) {
        customizationStore.calculateCurrentPrice();
        customizationStore.validateCurrentSelection();
    } else {
        customizationStore.calculatedPrice = '0.00';
    }
});
</script>
<style scoped>
</style>