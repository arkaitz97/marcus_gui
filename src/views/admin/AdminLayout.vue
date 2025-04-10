<template>
    <div class="flex h-screen bg-gray-100">
        <aside class="w-64 bg-gray-800 text-white p-4 flex flex-col">
            <h2 class="text-xl font-semibold mb-6 text-center border-b border-gray-700 pb-4">Admin Menu</h2>
            <nav class="flex-grow space-y-2">
                <router-link :to="{ name: 'AdminDashboard' }"
                    class="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700 hover:text-white transition-colors"
                    active-class="bg-gray-900 text-white">
                    <LayoutDashboard class="w-5 h-5 mr-2" /> Dashboard
                </router-link>
                <router-link :to="{ name: 'AdminProductList' }"
                    class="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700 hover:text-white transition-colors"
                    active-class="bg-gray-900 text-white">
                    <Package class="w-5 h-5 mr-2" /> Products
                </router-link>
                <router-link :to="{ name: 'AdminRestrictionList' }"
                    class="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700 hover:text-white transition-colors"
                    active-class="bg-gray-900 text-white">
                    <Ban class="w-5 h-5 mr-2" /> Restrictions
                </router-link>
                <router-link :to="{ name: 'AdminPriceRuleList' }"
                    class="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700 hover:text-white transition-colors"
                    active-class="bg-gray-900 text-white">
                    <DollarSign class="w-5 h-5 mr-2" /> Price Rules
                </router-link>
                <router-link :to="{ name: 'AdminOrderList' }"
                    class="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700 hover:text-white transition-colors"
                    active-class="bg-gray-900 text-white">
                    <ShoppingCart class="w-5 h-5 mr-2" /> Orders
                </router-link>
            </nav>
            <div class="mt-auto border-t border-gray-700 pt-4">
                <router-link :to="{ name: 'ProductList' }"
                    class="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
                    <ArrowLeftCircle class="w-5 h-5 mr-2" /> Back to Shop
                </router-link>
            </div>
        </aside>
        <main class="flex-1 p-6 overflow-y-auto">
            <router-view></router-view>
        </main>
    </div>
</template>

<script setup>
import { RouterLink, RouterView } from 'vue-router';
// Import necessary icons
import { LayoutDashboard, Package, Ban, DollarSign, ShoppingCart, ArrowLeftCircle } from 'lucide-vue-next';

// Layout logic if needed
</script>

<style scoped>
/* Add specific styles for the layout if needed */
</style>