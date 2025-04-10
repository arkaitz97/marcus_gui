import { defineStore } from 'pinia';
// Import the API service
import apiService from '../services/apiService';
// We might import other stores later if needed (e.g., for base price)
// import { useProductStore } from './productStore';

// Define the customization store
export const useCustomizationStore = defineStore('customization', {
  // State: Holds the currently selected options for a bike being customized
  state: () => ({
    selectedOptions: {}, // Object { partId: optionId, ... }
    isValidSelection: true, // Assume valid initially or until checked
    validationErrors: [], // Array of error messages from API
    calculatedPrice: null, // String or Number, holds the dynamically calculated price
    isCalculatingPrice: false, // Loading flag for price calculation
    isValidating: false, // Loading flag for validation
    customerDetails: { // Basic customer info for ordering
        name: '',
        email: '',
    },
  }),

  // Getters: Computed properties based on state
  getters: {
    // Get selected options as an array of IDs (useful for API calls)
    selectedOptionIds: (state) => Object.values(state.selectedOptions).filter(id => id !== null && id !== undefined),
  },

  // Actions: Methods to update customization state and interact with API
  actions: {
    // Action called when a user selects a part option
    selectOption(partId, optionId) {
      console.log(`Action: selectOption called - Part: ${partId}, Option: ${optionId}`);
      this.selectedOptions = {
          ...this.selectedOptions, // Preserve other selections
          [partId]: optionId
      };
      // Trigger validation and price calculation asynchronously (don't wait here)
      this.validateCurrentSelection();
      this.calculateCurrentPrice();
    },

    // Action to reset the current customization
    resetCustomization() {
      console.log('Action: resetCustomization called');
      this.selectedOptions = {};
      this.isValidSelection = true;
      this.validationErrors = [];
      this.calculatedPrice = null; // Reset to null, maybe fetch base price later
      this.isCalculatingPrice = false;
      this.isValidating = false;
      // Clear customer details as well? Depends on desired UX.
      // this.customerDetails = { name: '', email: '' };
    },

    // --- Action to validate the current selection via API ---
    async validateCurrentSelection() {
      const idsToValidate = this.selectedOptionIds;
      if (idsToValidate.length === 0) {
          // If nothing is selected, consider it valid (or reset to initial valid state)
          this.isValidSelection = true;
          this.validationErrors = [];
          this.isValidating = false; // Ensure loading state is off
          return;
      }

      // Prevent concurrent validation calls if needed, or allow latest to proceed
      // if (this.isValidating) return;

      this.isValidating = true;
      this.validationErrors = []; // Clear previous errors
      console.log('Action: validateCurrentSelection called (using API)', idsToValidate);

      try {
        const response = await apiService.validateSelection(idsToValidate);
        // Assuming API returns { valid: boolean, errors: [...] } in response.data
        this.isValidSelection = response.data.valid;
        this.validationErrors = response.data.errors || [];
      } catch (err) {
        console.error('Validation API call failed:', err.response?.data || err.message);
        this.isValidSelection = false; // Assume invalid on API error
        this.validationErrors = ['Failed to validate selection. Please try again.'];
      } finally {
        this.isValidating = false;
      }
    },

    // --- Action to calculate the price via API ---
    async calculateCurrentPrice() {
      const idsToPrice = this.selectedOptionIds;
      // Get base price from product store if needed later
      // const productStore = useProductStore();
      // const basePrice = productStore.currentProduct?.base_price || 0;

      if (idsToPrice.length === 0) {
          // If nothing selected, show 0 or base price
          this.calculatedPrice = '0.00'; // Or basePrice.toFixed(2)
          this.isCalculatingPrice = false; // Ensure loading state is off
          return;
      }

      // Prevent concurrent calculation calls if needed
      // if (this.isCalculatingPrice) return;

      this.isCalculatingPrice = true;
      console.log('Action: calculateCurrentPrice called (using API)', idsToPrice);

      try {
        const response = await apiService.calculatePrice(idsToPrice);
        // Assuming API returns { total_price: "string" } in response.data
        this.calculatedPrice = response.data.total_price;
      } catch (err) {
        console.error('Price calculation API call failed:', err.response?.data || err.message);
        this.calculatedPrice = 'Error'; // Indicate error
      } finally {
        this.isCalculatingPrice = false;
      }
    },

    // Action to update customer details
    updateCustomerDetail(field, value) {
        if (field in this.customerDetails) {
            this.customerDetails[field] = value;
        }
    },

    // --- Action to place the order ---
    async placeOrder() {
        const optionsToOrder = this.selectedOptionIds;
        // Ensure selection is valid and not empty before proceeding
        if (!this.isValidSelection || optionsToOrder.length === 0) {
            console.error('Cannot place order: Invalid or empty selection.');
            // Optionally throw an error or return a specific failure object
            return null; // Indicate failure
        }
        console.log('Action: placeOrder called (using API)', {
            customer: this.customerDetails,
            options: optionsToOrder,
        });

        // Construct the payload expected by the API service
        const orderData = {
            order: {
                customer_name: this.customerDetails.name,
                customer_email: this.customerDetails.email,
                selected_part_option_ids: optionsToOrder,
            }
        };

        try {
            const response = await apiService.createOrder(orderData);
            console.log('Order placed successfully:', response.data);
            // Assuming API returns the created order object in response.data
            // Optionally reset customization after successful order
            // this.resetCustomization();
            return response.data; // Return the created order details
        } catch (err) {
            console.error('Failed to place order:', err.response?.data || err.message);
            // Optionally extract specific error messages from err.response.data.errors
            // TODO: Provide feedback to UI about failure
            return null; // Indicate failure
        }
        // Note: No finally block needed here unless managing a loading state for the order button
    }
  },
});