<template>
  <div id="app-layout" class="flex flex-col min-h-screen bg-gray-50">

    <header class="bg-white shadow-md sticky top-0 z-10">
      <nav class="container mx-auto px-4 py-3 flex justify-between items-center">
        <router-link :to="{ name: 'ProductList' }"
          class="text-2xl font-bold text-gray-800 hover:text-blue-600 transition-colors">
          <Bike class="inline-block w-8 h-8 mr-2 text-blue-600" /> Marcus's Bike Shop
        </router-link>

        <div class="flex items-center space-x-4">
          <router-link :to="{ name: 'ProductList' }"
            class="text-gray-600 hover:text-blue-600 transition-colors px-3 py-2 rounded-md text-sm font-medium flex items-center"
            active-class="text-blue-600 bg-blue-50">
            <Home class="inline-block w-4 h-4 mr-1" /> Shop
          </router-link>
          <router-link :to="{ name: 'CartView' }"
            class="relative text-gray-600 hover:text-blue-600 transition-colors px-3 py-2 rounded-md text-sm font-medium flex items-center"
            active-class="text-blue-600 bg-blue-50">
            <ShoppingCart class="inline-block w-5 h-5" /> <span v-if="cartItemCount > 0"
              class="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
              {{ cartItemCount }}
            </span>
          </router-link>
          <router-link :to="{ name: 'AdminDashboard' }"
            class="text-gray-600 hover:text-blue-600 transition-colors px-3 py-2 rounded-md text-sm font-medium flex items-center"
            active-class="text-blue-600 bg-blue-50">
            <Wrench class="inline-block w-4 h-4 mr-1" /> Admin
          </router-link>
        </div>
      </nav>
    </header>

    <main class="flex-grow container mx-auto px-4 py-6">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <footer class="bg-gray-200 text-center text-sm text-gray-600 py-4 mt-8">
      © {{ new Date().getFullYear() }} Marcus's Bike Shop. All rights reserved.
    </footer>

  </div>
</template>

<script setup>
import { RouterLink, RouterView } from 'vue-router';
// Import Lucide icons
import { Bike, Home, Wrench, ShoppingCart } from 'lucide-vue-next'; // Added ShoppingCart
// Import cart store and helpers
import { useCartStore } from './stores/cartStore';
import { storeToRefs } from 'pinia';

// Get cart store instance
const cartStore = useCartStore();
// Get reactive ref to cart item count
const { cartItemCount } = storeToRefs(cartStore);

// No additional script logic needed for this basic layout yet
</script>

<style>
/* Basic fade transition for route changes */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Ensure container centers content */
.container {
  max-width: 1280px;
  /* Example max width */
}
</style>