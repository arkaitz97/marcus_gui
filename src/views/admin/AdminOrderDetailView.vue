<template>
    <div class="admin-order-detail-view p-4 md:p-6">
        <router-link :to="{ name: 'AdminOrderList' }" class="text-blue-600 hover:underline mb-4 inline-block text-sm">
            &larr; Back to Orders List
        </router-link>
        <h1 class="text-2xl font-bold mb-4 text-gray-800">Order Details</h1>
        <div v-if="isLoading" class="text-center py-10">
            <p class="text-gray-600">Loading order details...</p>
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mt-4"></div>
        </div>
        <div v-else-if="error" class="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
            role="alert">
            <strong class="font-bold">Error!</strong>
            <span class="block sm:inline"> {{ error }}</span>
            <p><router-link :to="{ name: 'AdminOrderList' }" class="text-red-700 underline font-medium">Return to Orders
                    List</router-link></p>
        </div>
        <div v-else-if="order" class="space-y-6">
            <div class="bg-white shadow rounded-lg p-6">
                <h2 class="text-xl font-semibold mb-4 border-b pb-2 text-gray-700">Order Summary</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div><strong class="text-gray-600">Order ID:</strong> #{{ order.id }}</div>
                    <div><strong class="text-gray-600">Order Date:</strong> {{ formatDate(order.created_at) }}</div>
                    <div><strong class="text-gray-600">Customer Name:</strong> {{ order.customer_name }}</div>
                    <div><strong class="text-gray-600">Customer Email:</strong> {{ order.customer_email }}</div>
                    <div><strong class="text-gray-600">Total Price:</strong> <span
                            class="font-semibold text-blue-700">{{ formatCurrency(order.total_price) }}</span></div>
                    <div><strong class="text-gray-600">Current Status:</strong>
                        <span
                            :class="['ml-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full', statusClass(order.status)]">
                            {{ order.status || 'N/A' }}
                        </span>
                    </div>
                </div>
            </div>
            <div class="bg-white shadow rounded-lg p-6">
                <h3 class="text-lg font-semibold mb-3 text-gray-700">Update Order Status</h3>
                <div class="flex items-center space-x-3">
                    <select v-model="selectedStatus"
                        class="block w-full max-w-xs rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        :disabled="isUpdatingStatus">
                        <option v-for="statusOption in availableStatuses" :key="statusOption" :value="statusOption">
                            {{ statusOption }}
                        </option>
                    </select>
                    <button @click="updateStatus"
                        class="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:border-indigo-900 focus:ring ring-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed transition ease-in-out duration-150"
                        :disabled="isUpdatingStatus || selectedStatus === order.status">
                        <Save class="w-4 h-4 mr-1 -ml-1" />
                        <span v-if="isUpdatingStatus">Saving...</span>
                        <span v-else>Save Status</span>
                    </button>
                </div>
                <p v-if="statusUpdateMessage" class="mt-3 text-sm"
                    :class="statusUpdateError ? 'text-red-600' : 'text-green-600'">
                    {{ statusUpdateMessage }}
                </p>
            </div>
            <div class="bg-white shadow rounded-lg p-6">
                <h3 class="text-lg font-semibold mb-3 text-gray-700">Selected Part Options</h3>
                <div v-if="order.order_line_items && order.order_line_items.length > 0">
                    <ul class="divide-y divide-gray-200">
                        <li v-for="lineItem in order.order_line_items" :key="lineItem.id"
                            class="py-3 flex justify-between items-center text-sm">
                            <div v-if="lineItem.part_option">
                                <span class="font-medium text-gray-800">{{ lineItem.part_option.name }}</span>
                                <span class="text-gray-500 ml-2">(ID: #{{ lineItem.part_option.id }})</span>
                            </div>
                            <div v-else>
                                <span class="font-medium text-gray-500 italic">Option details missing (ID: #{{
                                    lineItem.part_option_id }})</span>
                            </div>
                            <span class="font-semibold text-gray-700">{{ formatCurrency(lineItem.part_option?.price)
                            }}</span>
                        </li>
                    </ul>
                </div>
                <div v-else>
                    <p class="text-sm text-gray-500 italic">No specific options recorded for this order (or data
                        unavailable in API response).</p>
                </div>
            </div>
        </div>
        <div v-else-if="!isLoading && !error">
            <p class="text-center text-gray-500">Order data could not be displayed.</p>
        </div>
    </div>
</template>
<script setup>
import { ref, onMounted, watch } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import apiService from '../../services/apiService';
import { Save } from 'lucide-vue-next';
const props = defineProps({
    id: { 
        type: [String, Number],
        required: true,
    }
});
const route = useRoute();
const order = ref(null);
const isLoading = ref(false);
const error = ref(null);
const availableStatuses = ['Pending', 'Processing', 'Shipped', 'Completed', 'Cancelled', 'Refunded']; 
const selectedStatus = ref('');
const isUpdatingStatus = ref(false);
const statusUpdateMessage = ref('');
const statusUpdateError = ref(false);
const formatCurrency = (value) => {
    const amount = parseFloat(value);
    if (isNaN(amount)) return '$ N/A'; 
    return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
};
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
    } catch (e) { return 'Invalid Date'; }
};
const statusClass = (status) => {
    status = status?.toLowerCase() || '';
    if (status === 'pending') return 'bg-yellow-100 text-yellow-800';
    if (status === 'processing') return 'bg-blue-100 text-blue-800';
    if (status === 'completed' || status === 'shipped') return 'bg-green-100 text-green-800';
    if (status === 'cancelled' || status === 'refunded') return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
};
onMounted(async () => {
    isLoading.value = true;
    error.value = null;
    statusUpdateMessage.value = ''; 
    try {
        const response = await apiService.fetchOrderDetails(props.id);
        if (response.data) {
            order.value = response.data;
            selectedStatus.value = order.value.status || ''; 
        } else {
            throw new Error(`Order with ID ${props.id} not found or data is missing.`);
        }
    } catch (err) {
        console.error('Failed to fetch order details:', err.response?.data || err.message);
        error.value = `Failed to load order details (ID: ${props.id}). Please check the ID or try again.`;
        order.value = null; 
    } finally {
        isLoading.value = false;
    }
});
watch(() => order.value?.status, (newStatus) => {
    if (newStatus && newStatus !== selectedStatus.value) {
        selectedStatus.value = newStatus;
    }
});
async function updateStatus() {
    if (!selectedStatus.value || selectedStatus.value === order.value.status) {
        statusUpdateMessage.value = 'Please select a new status to save.';
        statusUpdateError.value = true;
        setTimeout(() => { statusUpdateMessage.value = ''; statusUpdateError.value = false; }, 3000);
        return;
    }
    isUpdatingStatus.value = true;
    statusUpdateMessage.value = 'Updating status...';
    statusUpdateError.value = false;
    const payload = { order: { status: selectedStatus.value } };
    try {
        const response = await apiService.updateOrder(props.id, payload);
        if (response.data) {
            order.value.status = response.data.status; 
            selectedStatus.value = order.value.status; 
            statusUpdateMessage.value = 'Order status updated successfully!';
            setTimeout(() => { statusUpdateMessage.value = ''; }, 3000);
        } else {
            order.value.status = selectedStatus.value; 
            statusUpdateMessage.value = 'Order status updated successfully!';
            setTimeout(() => { statusUpdateMessage.value = ''; }, 3000);
            console.warn("API did not return updated order data, updated status locally.");
        }
    } catch (err) {
        console.error('Failed to update order status:', err.response?.data || err.message);
        statusUpdateMessage.value = 'Failed to update status.';
        if (err.response?.data?.errors) {
            statusUpdateMessage.value += ` Details: ${JSON.stringify(err.response.data.errors)}`;
        }
        statusUpdateError.value = true;
    } finally {
        isUpdatingStatus.value = false;
    }
}
</script>
<style scoped>
</style>