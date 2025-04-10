import { defineStore } from 'pinia';
import apiService from '../services/apiService'; // Import API service for placing orders

// Helper to generate unique IDs for cart items
const generateCartItemId = () => `cartItem_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

// Define the cart store
export const useCartStore = defineStore('cart', {
  // State: Holds the cart items
  state: () => ({
    /**
     * Array of items in the cart. Each item represents a uniquely configured bike.
     * Example item structure:
     * {
     * id: string, // Unique ID for this specific cart item instance
     * productId: number | string,
     * productName: string,
     * // selectedOptions: { partId: optionId, ... }, // Optional: Store the full selection object
     * selectedOptionIds: number[], // Array of selected option IDs needed for ordering
     * price: string | number // The calculated price for this specific configuration
     * }
     */
    items: [],
    // Potential future state: customer details for checkout
    // customerDetails: { name: '', email: '', address: '' },
  }),

  // Getters: Computed properties based on state
  getters: {
    /**
     * Returns the array of cart items.
     * @param {object} state - The store state.
     * @returns {Array}
     */
    getCartItems: (state) => state.items,

    /**
     * Calculates the total number of items (configured bikes) in the cart.
     * @param {object} state - The store state.
     * @returns {number}
     */
    cartItemCount: (state) => state.items.length,

    /**
     * Calculates the total price of all items in the cart.
     * Assumes item.price is stored correctly when added.
     * @param {object} state - The store state.
     * @returns {number} - The total price as a number.
     */
    cartTotalPrice: (state) => {
      return state.items.reduce((total, item) => {
        const price = parseFloat(item.price);
        return total + (isNaN(price) ? 0 : price);
      }, 0);
    },
  },

  // Actions: Methods to modify state and interact with API
  actions: {
    /**
     * Adds a configured bike to the shopping cart.
     * @param {object} configuredBike - An object containing details of the bike to add.
     * Expected structure: { productId, productName, selectedOptionIds, price }
     */
    addItemToCart(configuredBike) {
      console.log('Action: addItemToCart called', configuredBike);
      if (!configuredBike || !configuredBike.productId || !configuredBike.selectedOptionIds || configuredBike.price === null || configuredBike.price === undefined) {
        console.error('addItemToCart: Invalid configuredBike data received.', configuredBike);
        // Optionally provide user feedback here
        return;
      }

      const newItem = {
        ...configuredBike,
        id: generateCartItemId(), // Assign a unique ID for this cart entry
      };

      this.items.push(newItem);
      console.log('Cart items after add:', this.items);

      // TODO: Implement persistence (e.g., using localStorage)
      // this.saveCartToLocalStorage();
    },

    /**
     * Removes an item from the cart by its unique cart item ID.
     * @param {string} cartItemId - The unique ID of the cart item to remove.
     */
    removeItemFromCart(cartItemId) {
      console.log('Action: removeItemFromCart called for ID:', cartItemId);
      const initialLength = this.items.length;
      this.items = this.items.filter(item => item.id !== cartItemId);

      if (this.items.length < initialLength) {
          console.log('Item removed. Cart items:', this.items);
          // TODO: Update persisted cart
          // this.saveCartToLocalStorage();
      } else {
          console.warn(`Item with ID ${cartItemId} not found in cart.`);
      }
    },

    /**
     * Clears all items from the shopping cart.
     */
    clearCart() {
      console.log('Action: clearCart called');
      this.items = [];
      // TODO: Update persisted cart
      // this.saveCartToLocalStorage();
    },

    /**
     * Places orders for items currently in the cart.
     * NOTE: Creates a SEPARATE order for EACH item in the cart based on current API.
     * Assumes customer details are handled separately (e.g., collected at checkout).
     * @returns {Promise<Array<object>>} - A promise that resolves to an array of results,
     * each indicating success/failure for one item's order.
     * Example result: [{ success: true, order: {...} }, { success: false, error: '...' }]
     */
    async placeOrderFromCart(customerDetails) {
        if (this.items.length === 0) {
            console.warn("placeOrderFromCart called with empty cart.");
            return { success: false, message: "Cart is empty."}; // Or return empty array?
        }
         if (!customerDetails || !customerDetails.name || !customerDetails.email) {
            console.error("placeOrderFromCart: Missing customer details.");
            return { success: false, message: "Customer details are required."};
        }

        console.log('Action: placeOrderFromCart called for items:', this.items.length);
        const orderResults = [];
        const itemsToOrder = [...this.items]; // Create copy in case of modification during async ops

        // Disable further cart modifications during checkout? (Add state if needed)
        // this.isPlacingOrder = true;

        for (const item of itemsToOrder) {
            const orderData = {
                order: {
                    customer_name: customerDetails.name,
                    customer_email: customerDetails.email,
                    selected_part_option_ids: item.selectedOptionIds,
                    // Potentially add item.productId or other refs if API supports/needs it
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
                // Decide on overall strategy: stop on first error, or try all?
                // For now, we try all.
            }
        }

        // Process results - e.g., clear cart only if all orders succeeded?
        const allSucceeded = orderResults.every(result => result.success);
        if (allSucceeded) {
            console.log("All orders placed successfully. Clearing cart.");
            this.clearCart();
            return { success: true, results: orderResults };
        } else {
            console.warn("Some orders failed to place. Cart not cleared.");
            // Provide detailed feedback about which items failed
             return { success: false, message: "One or more items could not be ordered.", results: orderResults };
        }

        // this.isPlacingOrder = false;
    },

    // --- Persistence Actions (Example Placeholders) ---
    // saveCartToLocalStorage() {
    //   localStorage.setItem('bikeShopCart', JSON.stringify(this.items));
    // },
    // loadCartFromLocalStorage() {
    //   const savedCart = localStorage.getItem('bikeShopCart');
    //   if (savedCart) {
    //     try {
    //       this.items = JSON.parse(savedCart);
    //     } catch (e) {
    //       console.error("Failed to parse saved cart:", e);
    //       this.items = [];
    //       localStorage.removeItem('bikeShopCart');
    //     }
    //   }
    // }
  },
});