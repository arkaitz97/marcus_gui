<template>
    <div class="admin-order-list-view p-4">
        <h1 class="text-2xl font-bold mb-6 text-gray-800">Manage Orders</h1>
        <div v-if="isLoading" class="text-center py-10">
            <p class="text-gray-600">Loading orders...</p>
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mt-4"></div>
        </div>
        <div v-else-if="error" class="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
            role="alert">
            <strong class="font-bold">Error!</strong>
            <span class="block sm:inline"> {{ error }}</span>
        </div>
        <div v-else-if="orders.length > 0" class="bg-white shadow overflow-x-auto sm:rounded-lg">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th scope="col"
                            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order
                            ID</th>
                        <th scope="col"
                            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Customer</th>
                        <th scope="col"
                            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email
                        </th>
                        <th scope="col"
                            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status</th>
                        <th scope="col"
                            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total
                            Price</th>
                        <th scope="col"
                            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order
                            Date</th>
                        <th scope="col"
                            class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="order in orders" :key="order.id" class="hover:bg-gray-50">
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{{ order.id }}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{{ order.customer_name }}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ order.customer_email }}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm">
                            <span
                                :class="['px-2 inline-flex text-xs leading-5 font-semibold rounded-full', statusClass(order.status)]">
                                {{ order.status || 'N/A' }}
                            </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{{
                            formatCurrency(order.total_price) }}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatDate(order.created_at) }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <router-link :to="{ name: 'AdminOrderDetail', params: { id: order.id } }"
                                class="text-indigo-600 hover:text-indigo-900 inline-flex items-center"
                                title="View Details">
                                <Eye class="w-4 h-4 mr-1" /> View
                            </router-link>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div v-else class="text-center py-10 border-2 border-dashed border-gray-300 rounded-lg">
            <p class="text-lg text-gray-600">No orders found.</p>
        </div>
    </div>
</template>
<script setup>
import { ref, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import apiService from '../../services/apiService';
import { Eye } from 'lucide-vue-next';
const orders = ref([]);
const isLoading = ref(false);
const error = ref(null);
const formatCurrency = (value) => {
    const amount = parseFloat(value);
    if (isNaN(amount)) {
        return 'N/A';
    }
    return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' }); 
};
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }); 
    } catch (e) {
        return 'Invalid Date';
    }
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
    try {
        const response = await apiService.fetchOrders();
        orders.value = response.data || [];
        orders.value.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } catch (err) {
        console.error('Failed to fetch orders:', err.response?.data || err.message);
        error.value = 'Failed to load orders. Please try again later.';
        orders.value = []; 
    } finally {
        isLoading.value = false;
    }
});
</script>
<style scoped>
</style>