import { defineStore } from 'pinia';
import apiService from '../services/apiService'; 
const generateCartItemId = () => `cartItem_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [],
  }),
  getters: {
    getCartItems: (state) => state.items,
    cartItemCount: (state) => state.items.length,
    cartTotalPrice: (state) => {
      return state.items.reduce((total, item) => {
        const price = parseFloat(item.price);
        return total + (isNaN(price) ? 0 : price);
      }, 0);
    },
  },
  actions: {
    addItemToCart(configuredBike) {
      console.log('Action: addItemToCart called', configuredBike);
      if (!configuredBike || !configuredBike.productId || !configuredBike.selectedOptionIds || configuredBike.price === null || configuredBike.price === undefined) {
        console.error('addItemToCart: Invalid configuredBike data received.', configuredBike);
        return;
      }
      const newItem = {
        ...configuredBike,
        id: generateCartItemId(), 
      };
      this.items.push(newItem);
      console.log('Cart items after add:', this.items);
    },
    removeItemFromCart(cartItemId) {
      console.log('Action: removeItemFromCart called for ID:', cartItemId);
      const initialLength = this.items.length;
      this.items = this.items.filter(item => item.id !== cartItemId);
      if (this.items.length < initialLength) {
          console.log('Item removed. Cart items:', this.items);
      } else {
          console.warn(`Item with ID ${cartItemId} not found in cart.`);
      }
    },
    clearCart() {
      console.log('Action: clearCart called');
      this.items = [];
    },
    async placeOrderFromCart(customerDetails) {
        if (this.items.length === 0) {
            console.warn("placeOrderFromCart called with empty cart.");
            return { success: false, message: "Cart is empty."}; 
        }
         if (!customerDetails || !customerDetails.name || !customerDetails.email) {
            console.error("placeOrderFromCart: Missing customer details.");
            return { success: false, message: "Customer details are required."};
        }
        console.log('Action: placeOrderFromCart called for items:', this.items.length);
        const orderResults = [];
        const itemsToOrder = [...this.items]; 
        for (const item of itemsToOrder) {
            const orderData = {
                order: {
                    customer_name: customerDetails.name,
                    customer_email: customerDetails.email,
                    selected_part_option_ids: item.selectedOptionIds,
                }
            };
            try {
                console.log(`Placing order for cart item ${item.id} (Product ${item.productId})...`);
                const response = await apiService.createOrder(orderData);
                console.log(`Order successful for cart item ${item.id}:`, response.data);
                orderResults.push({ success: true, cartItemId: item.id, order: response.data });
            } catch (err) {
                const errorMessage = err.response?.data?.message || err.message || 'Unknown error creating order.';
                console.error(`Failed to place order for cart item ${item.id}:`, errorMessage);
                orderResults.push({ success: false, cartItemId: item.id, error: errorMessage });
            }
        }
        const allSucceeded = orderResults.every(result => result.success);
        if (allSucceeded) {
            console.log("All orders placed successfully. Clearing cart.");
            this.clearCart();
            return { success: true, results: orderResults };
        } else {
            console.warn("Some orders failed to place. Cart not cleared.");
             return { success: false, message: "One or more items could not be ordered.", results: orderResults };
        }
    },
  },
});