import { defineStore } from 'pinia';
import apiService from '../services/apiService';
export const useProductStore = defineStore('products', {
  state: () => ({
    products: [], 
    currentProduct: null, 
    isLoading: false, 
    error: null, 
  }),
  getters: {
    productCount: (state) => state.products.length,
    getProductById: (state) => (id) => {
      const productId = parseInt(id, 10);
      return state.products.find(product => product.id === productId) ||
             (state.currentProduct?.id === productId ? state.currentProduct : null);
    },
  },
  actions: {
    async fetchProducts() {
      if (this.isLoading) return;
      this.isLoading = true;
      this.error = null;
      this.products = []; 
      console.log('Action: fetchProducts called (using API)');
      try {
        const response = await apiService.fetchProducts();
        this.products = response.data || [];
      } catch (err) {
        this.error = 'Failed to fetch products.';
        console.error('fetchProducts error:', err.response?.data || err.message);
        this.products = []; 
      } finally {
        this.isLoading = false;
      }
    },
    async fetchProductDetails(productId) {
      if (this.isLoading) return;
      this.isLoading = true;
      this.error = null;
      this.currentProduct = null; 
      console.log(`Action: fetchProductDetails called for ID: ${productId} (using API)`);
      try {
        const productResponse = await apiService.fetchProductDetails(productId);
        if (!productResponse.data) {
            throw new Error(`Product with ID ${productId} not found.`);
        }
        const productData = productResponse.data;
        productData.parts = []; 
        const partsResponse = await apiService.fetchParts(productId);
        const partsData = partsResponse.data || [];
        const optionFetchPromises = partsData.map(async (part) => {
            try {
                const optionsResponse = await apiService.fetchPartOptions(productId, part.id);
                part.part_options = optionsResponse.data || [];
                return part; 
            } catch (optionsErr) {
                 console.error(`Failed to fetch options for part ${part.id}:`, optionsErr.response?.data || optionsErr.message);
                 part.part_options = []; 
                 return part;
            }
        });
        const partsWithOptions = await Promise.all(optionFetchPromises);
        productData.parts = partsWithOptions;
        this.currentProduct = productData;
      } catch (err) {
        this.error = `Failed to fetch product details for ID ${productId}.`;
        console.error('fetchProductDetails error:', err.response?.data || err.message);
        this.currentProduct = null; 
      } finally {
        this.isLoading = false;
      }
    },
  },
});