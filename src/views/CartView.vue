<template>
    <div class="cart-view p-4 md:p-6">
        <h1 class="text-3xl font-bold mb-6 text-gray-800">Shopping Cart</h1>

        <div v-if="cartItemCount === 0" class="text-center py-10 border-2 border-dashed border-gray-300 rounded-lg">
            <ShoppingCart class="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p class="text-lg text-gray-600 mb-2">Your cart is empty.</p>
            <router-link :to="{ name: 'ProductList' }" class="text-blue-600 hover:underline font-medium">
                Continue Shopping
            </router-link>
        </div>

        <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">

            <div class="lg:col-span-2 space-y-4">
                <h2 class="text-xl font-semibold text-gray-700 sr-only">Cart Items</h2>
                <div v-for="item in items" :key="item.id"
                    class="cart-item flex items-start p-4 bg-white rounded-lg shadow">
                    <img :src="`https://placehold.co/150x100/e2e8f0/cbd5e0?text=${item.productName}`"
                        :alt="item.productName" class="w-24 h-auto object-cover rounded mr-4"
                        onerror="this.src='https://placehold.co/150x100/e0e0e0/a0a0a0?text=Image'; this.onerror=null;">
                    <div class="flex-grow">
                        <h3 class="text-lg font-medium text-gray-800">{{ item.productName }}</h3>
                        <p class="text-xs text-gray-500 mt-1">
                            Configuration IDs: {{ item.selectedOptionIds.join(', ') }}
                            <em class="text-gray-400">(Details enhancement needed)</em>
                        </p>
                    </div>
                    <div class="text-right ml-4 flex flex-col items-end">
                        <p class="text-lg font-semibold text-gray-900 mb-2">{{ formatCurrency(item.price) }}</p>
                        <button @click="handleRemoveItem(item.id)"
                            class="text-red-500 hover:text-red-700 text-xs font-medium inline-flex items-center"
                            title="Remove Item">
                            <Trash2 class="w-3 h-3 mr-1" /> Remove
                        </button>
                    </div>
                </div>
            </div>

            <div class="lg:col-span-1">
                <div class="sticky top-24 bg-white p-6 rounded-lg shadow space-y-4">
                    <h2 class="text-xl font-semibold text-gray-700 border-b pb-2">Order Summary</h2>
                    <div class="flex justify-between text-lg font-medium">
                        <span>Subtotal ({{ cartItemCount }} items):</span>
                        <span>{{ formatCurrency(cartTotalPrice) }}</span>
                    </div>
                    <div class="border-t pt-4 flex justify-between text-xl font-bold text-gray-900">
                        <span>Total:</span>
                        <span>{{ formatCurrency(cartTotalPrice) }}</span>
                    </div>

                    <div class="pt-4 border-t">
                        <h3 class="text-lg font-semibold mb-3 text-gray-700">Customer Information</h3>
                        <div class="space-y-3">
                            <div>
                                <label for="customerName" class="block text-sm font-medium text-gray-700">Full
                                    Name</label>
                                <input type="text" id="customerName" v-model="customerName" required
                                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    :disabled="isPlacingOrder" />
                            </div>
                            <div>
                                <label for="customerEmail" class="block text-sm font-medium text-gray-700">Email
                                    Address</label>
                                <input type="email" id="customerEmail" v-model="customerEmail" required
                                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    :disabled="isPlacingOrder" />
                            </div>
                        </div>
                    </div>

                    <button @click="handlePlaceOrder"
                        class="w-full mt-4 py-3 px-4 rounded-md font-semibold text-white transition-colors duration-200 flex items-center justify-center"
                        :class="isPlacingOrder ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'"
                        :disabled="isPlacingOrder || cartItemCount === 0 || !customerName.trim() || !customerEmail.trim()">
                        <span v-if="isPlacingOrder">Placing Orders...</span>
                        <span v-else>Place Order</span>
                    </button>

                    <p v-if="orderPlacementStatus" class="mt-4 text-sm text-center"
                        :class="orderPlacementError ? 'text-red-600' : 'text-green-600'">
                        {{ orderPlacementStatus }}
                    </p>
                    <ul v-if="orderPlacementResults.length > 0 && orderPlacementError"
                        class="mt-2 text-xs text-red-500 list-disc list-inside">
                        <li v-for="(result, index) in orderPlacementResults.filter(r => !r.success)" :key="index">
                            Item #{{ result.cartItemId.substring(9, 15) }} failed: {{ result.error }}
                        </li>
                    </ul>

                </div>
            </div>

        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { RouterLink } from 'vue-router';
import { useCartStore } from '../stores/cartStore';
import { storeToRefs } from 'pinia';
import { Trash2, ShoppingCart } from 'lucide-vue-next'; // Added ShoppingCart

// Get cart store instance
const cartStore = useCartStore();

// Get reactive refs from cart store
const { items, cartItemCount, cartTotalPrice } = storeToRefs(cartStore);

// Local state for customer details form
const customerName = ref('');
const customerEmail = ref('');

// Local state for order placement process
const isPlacingOrder = ref(false);
const orderPlacementStatus = ref('');
const orderPlacementError = ref(false);
const orderPlacementResults = ref([]); // To store detailed results from placeOrderFromCart

// Format currency utility (can be moved to a helper file later)
const formatCurrency = (value) => {
    const amount = parseFloat(value);
    if (isNaN(amount)) return '$0.00'; // Default or error display
    return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
};

// Method to remove item from cart
const handleRemoveItem = (itemId) => {
    console.log("Removing item:", itemId);
    cartStore.removeItemFromCart(itemId);
};

// Method to place order(s)
const handlePlaceOrder = async () => {
    // Basic validation
    if (!customerName.value.trim() || !customerEmail.value.trim()) {
        orderPlacementStatus.value = 'Please enter your name and email.';
        orderPlacementError.value = true;
        return;
    }

    isPlacingOrder.value = true;
    orderPlacementStatus.value = 'Processing your order(s)...';
    orderPlacementError.value = false;
    orderPlacementResults.value = [];

    const customerDetails = {
        name: customerName.value,
        email: customerEmail.value
    };

    try {
        const result = await cartStore.placeOrderFromCart(customerDetails);
        orderPlacementResults.value = result.results || []; // Store detailed results

        if (result.success) {
            orderPlacementStatus.value = 'Order(s) placed successfully! Thank you.';
            orderPlacementError.value = false;
            // Clear customer details form on success?
            // customerName.value = '';
            // customerEmail.value = '';
            // Cart is cleared by the store action on full success
        } else {
            orderPlacementStatus.value = result.message || 'One or more items could not be ordered. Please review and try again.';
            orderPlacementError.value = true;
        }

    } catch (err) {
        // Catch unexpected errors from the action itself
        console.error("Error during handlePlaceOrder:", err);
        orderPlacementStatus.value = 'An unexpected error occurred while placing the order.';
        orderPlacementError.value = true;
    } finally {
        isPlacingOrder.value = false;
    }
};

</script>

<style scoped>
/* Add component-specific styles if needed */
</style>