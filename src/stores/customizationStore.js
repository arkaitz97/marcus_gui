import { defineStore } from 'pinia';
import apiService from '../services/apiService';
export const useCustomizationStore = defineStore('customization', {
  state: () => ({
    selectedOptions: {}, 
    isValidSelection: true, 
    validationErrors: [], 
    calculatedPrice: null, 
    isCalculatingPrice: false, 
    isValidating: false, 
    customerDetails: { 
        name: '',
        email: '',
    },
  }),
  getters: {
    selectedOptionIds: (state) => Object.values(state.selectedOptions).filter(id => id !== null && id !== undefined),
  },
  actions: {
    selectOption(partId, optionId) {
      console.log(`Action: selectOption called - Part: ${partId}, Option: ${optionId}`);
      this.selectedOptions = {
          ...this.selectedOptions, 
          [partId]: optionId
      };
      this.validateCurrentSelection();
      this.calculateCurrentPrice();
    },
    resetCustomization() {
      console.log('Action: resetCustomization called');
      this.selectedOptions = {};
      this.isValidSelection = true;
      this.validationErrors = [];
      this.calculatedPrice = null; 
      this.isCalculatingPrice = false;
      this.isValidating = false;
    },
    async validateCurrentSelection() {
      const idsToValidate = this.selectedOptionIds;
      if (idsToValidate.length === 0) {
          this.isValidSelection = true;
          this.validationErrors = [];
          this.isValidating = false; 
          return;
      }
      this.isValidating = true;
      this.validationErrors = []; 
      console.log('Action: validateCurrentSelection called (using API)', idsToValidate);
      try {
        const response = await apiService.validateSelection(idsToValidate);
        this.isValidSelection = response.data.valid;
        this.validationErrors = response.data.errors || [];
      } catch (err) {
        console.error('Validation API call failed:', err.response?.data || err.message);
        this.isValidSelection = false; 
        this.validationErrors = ['Failed to validate selection. Please try again.'];
      } finally {
        this.isValidating = false;
      }
    },
    async calculateCurrentPrice() {
      const idsToPrice = this.selectedOptionIds;
      if (idsToPrice.length === 0) {
          this.calculatedPrice = '0.00'; 
          this.isCalculatingPrice = false; 
          return;
      }
      this.isCalculatingPrice = true;
      console.log('Action: calculateCurrentPrice called (using API)', idsToPrice);
      try {
        const response = await apiService.calculatePrice(idsToPrice);
        this.calculatedPrice = response.data.total_price;
      } catch (err) {
        console.error('Price calculation API call failed:', err.response?.data || err.message);
        this.calculatedPrice = 'Error'; 
      } finally {
        this.isCalculatingPrice = false;
      }
    },
    updateCustomerDetail(field, value) {
        if (field in this.customerDetails) {
            this.customerDetails[field] = value;
        }
    },
    async placeOrder() {
        const optionsToOrder = this.selectedOptionIds;
        if (!this.isValidSelection || optionsToOrder.length === 0) {
            console.error('Cannot place order: Invalid or empty selection.');
            return null; 
        }
        console.log('Action: placeOrder called (using API)', {
            customer: this.customerDetails,
            options: optionsToOrder,
        });
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
            return response.data; 
        } catch (err) {
            console.error('Failed to place order:', err.response?.data || err.message);
            return null; 
        }
    }
  },
});