import { defineStore } from 'pinia';
// Import the API service we created
import apiService from '../services/apiService';

// Define the product store
export const useProductStore = defineStore('products', {
  // State: Define the data properties for the store
  state: () => ({
    products: [], // Array to hold the list of products
    currentProduct: null, // Holds details of the currently viewed product, including parts/options
    isLoading: false, // Flag for loading states (can be split into isLoadingList, isLoadingDetail etc. if needed)
    error: null, // To store any errors during API calls
  }),

  // Getters: Computed properties based on state
  getters: {
    productCount: (state) => state.products.length,
    getProductById: (state) => (id) => {
      const productId = parseInt(id, 10);
      // Check both the list and the currentProduct (if loaded directly)
      return state.products.find(product => product.id === productId) ||
             (state.currentProduct?.id === productId ? state.currentProduct : null);
    },
  },

  // Actions: Methods to perform asynchronous operations or mutate state
  actions: {
    // --- Action to fetch all products ---
    async fetchProducts() {
      // Prevent fetching if already loading
      if (this.isLoading) return;

      this.isLoading = true;
      this.error = null;
      this.products = []; // Clear previous products while loading
      console.log('Action: fetchProducts called (using API)');
      try {
        const response = await apiService.fetchProducts();
        // Assuming API returns an array of products directly in response.data
        this.products = response.data || [];
      } catch (err) {
        this.error = 'Failed to fetch products.';
        console.error('fetchProducts error:', err.response?.data || err.message);
        this.products = []; // Ensure products is empty on error
      } finally {
        this.isLoading = false;
      }
    },

    // --- Action to fetch details for a single product, including its parts and their options ---
    async fetchProductDetails(productId) {
       // Prevent fetching if already loading
      if (this.isLoading) return;

      this.isLoading = true;
      this.error = null;
      this.currentProduct = null; // Reset current product
      console.log(`Action: fetchProductDetails called for ID: ${productId} (using API)`);

      try {
        // 1. Fetch main product details
        const productResponse = await apiService.fetchProductDetails(productId);
        if (!productResponse.data) {
            throw new Error(`Product with ID ${productId} not found.`);
        }
        const productData = productResponse.data;
        productData.parts = []; // Initialize parts array

        // 2. Fetch parts for this product
        const partsResponse = await apiService.fetchParts(productId);
        const partsData = partsResponse.data || [];

        // 3. Fetch options for each part (concurrently using Promise.all)
        const optionFetchPromises = partsData.map(async (part) => {
            try {
                const optionsResponse = await apiService.fetchPartOptions(productId, part.id);
                // Assign fetched options to the part object
                part.part_options = optionsResponse.data || [];
                return part; // Return the part with its options
            } catch (optionsErr) {
                 console.error(`Failed to fetch options for part ${part.id}:`, optionsErr.response?.data || optionsErr.message);
                 part.part_options = []; // Assign empty array on error for this part
                 // Optionally, decide if failure to load options for one part should fail the whole process
                 // For now, we'll continue but the part will have no options shown
                 return part;
            }
        });

        // Wait for all option fetches to complete
        const partsWithOptions = await Promise.all(optionFetchPromises);

        // Assign the parts (now including their options) to the product data
        productData.parts = partsWithOptions;

        // Set the complete product data in the store state
        this.currentProduct = productData;

      } catch (err) {
        this.error = `Failed to fetch product details for ID ${productId}.`;
        console.error('fetchProductDetails error:', err.response?.data || err.message);
        this.currentProduct = null; // Ensure currentProduct is null on error
      } finally {
        this.isLoading = false;
      }
    },

    // --- Admin Actions (Placeholder - can be moved to an adminStore later) ---
    // Example: Action to add a product (implementation would call apiService.createProduct)
    // async addProduct(newProductData) { ... }

    // Example: Action to update a product (implementation would call apiService.updateProduct)
    // async updateProduct(productId, updatedProductData) { ... }

    // Example: Action to delete a product (implementation would call apiService.deleteProduct)
    // async deleteProduct(productId) { ... }
  },
});