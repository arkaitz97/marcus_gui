// src/services/api.js
const API_BASE_URL = '/api/v1'; // Adjust if your API is hosted elsewhere

export const apiService = {
    async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                ...options.headers,
            },
            ...options,
        };

        try {
            const response = await fetch(url, config);
            if (!response.ok) {
                let errorData;
                try {
                    errorData = await response.json();
                } catch (e) {
                    errorData = { message: response.statusText };
                }
                console.error(`API Error (${response.status}): ${url}`, errorData);
                throw new Error(errorData.message || `Request failed with status ${response.status}`);
            }
            // Handle cases where the response might be empty (e.g., DELETE 204)
            if (response.status === 204 || response.headers.get('content-length') === '0') {
                return null; // Or return { success: true } if preferred
            }
            return await response.json();
        } catch (error) {
            console.error(`Network or API call error: ${url}`, error);
            throw error; // Re-throw to be caught by calling function
        }
    },

    // Products
    getProducts: () => apiService.request('/products'),
    getProduct: (id) => apiService.request(`/products/${id}`),
    createProduct: (data) => apiService.request('/products', { method: 'POST', body: JSON.stringify({ product: data }) }),
    updateProduct: (id, data) => apiService.request(`/products/${id}`, { method: 'PATCH', body: JSON.stringify({ product: data }) }),
    deleteProduct: (id) => apiService.request(`/products/${id}`, { method: 'DELETE' }),

    // Parts
    getParts: (productId) => apiService.request(`/products/${productId}/parts`),
    // getPart: (productId, partId) => apiService.request(`/products/${productId}/parts/${partId}`), // Assuming this exists for edit forms
    createPart: (productId, data) => apiService.request(`/products/${productId}/parts`, { method: 'POST', body: JSON.stringify({ part: data }) }),
    updatePart: (productId, partId, data) => apiService.request(`/products/${productId}/parts/${partId}`, { method: 'PATCH', body: JSON.stringify({ part: data }) }),
    deletePart: (productId, partId) => apiService.request(`/products/${productId}/parts/${partId}`, { method: 'DELETE' }),

    // Part Options
    getPartOptions: (productId, partId) => apiService.request(`/products/${productId}/parts/${partId}/part_options`),
    // getPartOption: (productId, partId, optionId) => apiService.request(`/products/${productId}/parts/${partId}/part_options/${optionId}`), // Assuming this exists for edit forms
    getAllPartOptions: async () => { // Helper to get all options for admin forms
      const products = await apiService.getProducts();
      let allOptions = [];
      for (const product of products) {
          // Optimized: Fetch parts first, then options for those parts in parallel if possible
          const parts = await apiService.getParts(product.id);
          const optionPromises = parts.map(part =>
              apiService.getPartOptions(product.id, part.id)
                  .then(options => options.map(opt => ({ ...opt, part_name: part.name, product_name: product.name })))
          );
          const optionsForProduct = (await Promise.all(optionPromises)).flat();
          allOptions = allOptions.concat(optionsForProduct);

          // --- Alternative if getProduct includes everything (less efficient if many products) ---
          // const productDetails = await apiService.getProduct(product.id);
          // if (productDetails && productDetails.parts) {
          //    for (const part of productDetails.parts) {
          //       if (part.part_options) {
          //         allOptions = allOptions.concat(part.part_options.map(opt => ({...opt, part_name: part.name, product_name: product.name})));
          //       } else {
          //           const options = await apiService.getPartOptions(product.id, part.id);
          //           allOptions = allOptions.concat(options.map(opt => ({...opt, part_name: part.name, product_name: product.name})));
          //       }
          //    }
          // }
      }
      return allOptions;
    },
    createPartOption: (productId, partId, data) => apiService.request(`/products/${productId}/parts/${partId}/part_options`, { method: 'POST', body: JSON.stringify({ part_option: data }) }),
    updatePartOption: (productId, partId, optionId, data) => apiService.request(`/products/${productId}/parts/${partId}/part_options/${optionId}`, { method: 'PATCH', body: JSON.stringify({ part_option: data }) }),
    deletePartOption: (productId, partId, optionId) => apiService.request(`/products/${productId}/parts/${partId}/part_options/${optionId}`, { method: 'DELETE' }),

    // Part Restrictions
    getPartRestrictions: () => apiService.request('/part_restrictions'),
    createPartRestriction: (data) => apiService.request('/part_restrictions', { method: 'POST', body: JSON.stringify({ part_restriction: data }) }),
    deletePartRestriction: (id) => apiService.request(`/part_restrictions/${id}`, { method: 'DELETE' }),

    // Price Rules
    getPriceRules: () => apiService.request('/price_rules'),
    createPriceRule: (data) => apiService.request('/price_rules', { method: 'POST', body: JSON.stringify({ price_rule: data }) }),
    deletePriceRule: (id) => apiService.request(`/price_rules/${id}`, { method: 'DELETE' }),

    // Orders
    getOrders: () => apiService.request('/orders'),
    getOrder: (id) => apiService.request(`/orders/${id}`),
    createOrder: (data) => apiService.request('/orders', { method: 'POST', body: JSON.stringify({ order: data }) }),
    updateOrder: (id, data) => apiService.request(`/orders/${id}`, { method: 'PATCH', body: JSON.stringify({ order: data }) }),
    deleteOrder: (id) => apiService.request(`/orders/${id}`, { method: 'DELETE' }), // Or maybe just update status to 'Cancelled'

    // Dynamic Configuration
    validateSelection: (selectedOptionIds) => apiService.request('/product_configuration/validate_selection', { method: 'POST', body: JSON.stringify({ selected_part_option_ids: selectedOptionIds }) }),
    calculatePrice: (selectedOptionIds) => apiService.request('/product_configuration/calculate_price', { method: 'POST', body: JSON.stringify({ selected_part_option_ids: selectedOptionIds }) }),
};