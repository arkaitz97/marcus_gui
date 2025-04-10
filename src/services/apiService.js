import axios from 'axios';

// Define the base URL for the API.
// Adjust this if your API is hosted elsewhere.
// Using '/api/v1' assumes a proxy setup or that the frontend and backend are served from the same origin.
const API_BASE_URL = 'http://localhost:3001/api/v1';

// Create an Axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
  // You can add other default settings here, like timeout
  // timeout: 10000, // e.g., 10 seconds
});

// Optional: Add interceptors for request or response handling (e.g., error logging)
apiClient.interceptors.response.use(
  response => response, // Simply return the successful response
  error => {
    // Log errors or handle them globally
    console.error('API call error:', error.response?.data || error.message || error);
    // You could potentially redirect on 401 Unauthorized, etc.
    return Promise.reject(error); // Important: Reject the promise to propagate the error
  }
);

// Define API functions, grouped by resource type
export default {

  // === Products ===
  /**
   * Fetches a list of all products.
   * GET /products
   */
  fetchProducts() {
    console.log('apiService: Fetching products...');
    return apiClient.get('/products');
  },
  /**
   * Fetches details for a single product by its ID.
   * GET /products/:id
   * @param {string|number} productId - The ID of the product.
   */
  fetchProductDetails(productId) {
    console.log(`apiService: Fetching product details for ID: ${productId}...`);
    return apiClient.get(`/products/${productId}`);
  },
  /**
   * Creates a new product.
   * POST /products
   * @param {object} productData - The product data, e.g., { product: { name, description } }.
   */
  createProduct(productData) {
    console.log('apiService: Creating product...', productData);
    return apiClient.post('/products', productData);
  },
  /**
   * Updates an existing product.
   * PUT /products/:id (or PATCH)
   * @param {string|number} productId - The ID of the product to update.
   * @param {object} productData - The updated product data, e.g., { product: { name?, description? } }.
   */
  updateProduct(productId, productData) {
    console.log(`apiService: Updating product ID: ${productId}...`, productData);
    return apiClient.put(`/products/${productId}`, productData); // Or PATCH if partial updates allowed
  },
  /**
   * Deletes a product by its ID.
   * DELETE /products/:id
   * @param {string|number} productId - The ID of the product to delete.
   */
  deleteProduct(productId) {
    console.log(`apiService: Deleting product ID: ${productId}...`);
    return apiClient.delete(`/products/${productId}`);
  },

  // === Parts (nested under products) ===
  /**
   * Fetches a list of parts for a specific product.
   * GET /products/:productId/parts
   * @param {string|number} productId - The ID of the parent product.
   */
  fetchParts(productId) {
    console.log(`apiService: Fetching parts for product ID: ${productId}...`);
    return apiClient.get(`/products/${productId}/parts`);
  },
  /**
   * Fetches details for a specific part.
   * GET /products/:productId/parts/:partId
   * @param {string|number} productId - The ID of the parent product.
   * @param {string|number} partId - The ID of the part.
   */
  fetchPartDetails(productId, partId) {
    console.log(`apiService: Fetching part details for product ID: ${productId}, part ID: ${partId}...`);
    return apiClient.get(`/products/${productId}/parts/${partId}`);
  },
  /**
   * Creates a new part for a specific product.
   * POST /products/:productId/parts
   * @param {string|number} productId - The ID of the parent product.
   * @param {object} partData - The part data, e.g., { part: { name } }.
   */
  createPart(productId, partData) {
    console.log(`apiService: Creating part for product ID: ${productId}...`, partData);
    return apiClient.post(`/products/${productId}/parts`, partData);
  },
  /**
   * Updates an existing part.
   * PUT /products/:productId/parts/:partId (or PATCH)
   * @param {string|number} productId - The ID of the parent product.
   * @param {string|number} partId - The ID of the part to update.
   * @param {object} partData - The updated part data, e.g., { part: { name? } }.
   */
  updatePart(productId, partId, partData) {
    console.log(`apiService: Updating part ID: ${partId} for product ID: ${productId}...`, partData);
    return apiClient.put(`/products/${productId}/parts/${partId}`, partData); // Or PATCH
  },
  /**
   * Deletes a part by its ID.
   * DELETE /products/:productId/parts/:partId
   * @param {string|number} productId - The ID of the parent product.
   * @param {string|number} partId - The ID of the part to delete.
   */
  deletePart(productId, partId) {
    console.log(`apiService: Deleting part ID: ${partId} for product ID: ${productId}...`);
    return apiClient.delete(`/products/${productId}/parts/${partId}`);
  },

  // === Part Options (nested under parts) ===
  /**
   * Fetches a list of options for a specific part.
   * GET /products/:productId/parts/:partId/part_options
   * @param {string|number} productId - The ID of the parent product.
   * @param {string|number} partId - The ID of the parent part.
   */
  fetchPartOptions(productId, partId) {
    console.log(`apiService: Fetching options for product ID: ${productId}, part ID: ${partId}...`);
    return apiClient.get(`/products/${productId}/parts/${partId}/part_options`);
  },
  /**
   * Creates a new part option for a specific part.
   * POST /products/:productId/parts/:partId/part_options
   * @param {string|number} productId - The ID of the parent product.
   * @param {string|number} partId - The ID of the parent part.
   * @param {object} optionData - The option data, e.g., { part_option: { name, price, in_stock? } }.
   */
  createPartOption(productId, partId, optionData) {
    console.log(`apiService: Creating option for part ID: ${partId}...`, optionData);
    return apiClient.post(`/products/${productId}/parts/${partId}/part_options`, optionData);
  },
  /**
   * Updates an existing part option.
   * PUT /products/:productId/parts/:partId/part_options/:optionId (or PATCH)
   * @param {string|number} productId - The ID of the parent product.
   * @param {string|number} partId - The ID of the parent part.
   * @param {string|number} optionId - The ID of the option to update.
   * @param {object} optionData - The updated option data, e.g., { part_option: { name?, price?, in_stock? } }.
   */
  updatePartOption(productId, partId, optionId, optionData) {
     console.log(`apiService: Updating option ID: ${optionId}...`, optionData);
    return apiClient.put(`/products/${productId}/parts/${partId}/part_options/${optionId}`, optionData); // Or PATCH
  },
  /**
   * Deletes a part option by its ID.
   * DELETE /products/:productId/parts/:partId/part_options/:optionId
   * @param {string|number} productId - The ID of the parent product.
   * @param {string|number} partId - The ID of the parent part.
   * @param {string|number} optionId - The ID of the option to delete.
   */
  deletePartOption(productId, partId, optionId) {
    console.log(`apiService: Deleting option ID: ${optionId}...`);
    return apiClient.delete(`/products/${productId}/parts/${partId}/part_options/${optionId}`);
  },
  // Note: fetchPartOptionDetails(productId, partId, optionId) was considered but is not in the provided API spec.

  // === Part Restrictions ===
  /**
   * Fetches a list of all part restrictions.
   * GET /part_restrictions
   */
  fetchRestrictions() {
    console.log('apiService: Fetching restrictions...');
    return apiClient.get('/part_restrictions');
  },
  /**
   * Creates a new part restriction.
   * POST /part_restrictions
   * @param {object} restrictionData - The restriction data, e.g., { part_restriction: { part_option_id, restricted_part_option_id } }.
   */
  createRestriction(restrictionData) {
    console.log('apiService: Creating restriction...', restrictionData);
    return apiClient.post('/part_restrictions', restrictionData);
  },
  /**
   * Deletes a part restriction by its ID.
   * DELETE /part_restrictions/:id
   * @param {string|number} restrictionId - The ID of the restriction to delete.
   */
  deleteRestriction(restrictionId) {
    console.log(`apiService: Deleting restriction ID: ${restrictionId}...`);
    return apiClient.delete(`/part_restrictions/${restrictionId}`);
  },
  // Add fetchRestrictionDetails(restrictionId) if needed (GET /part_restrictions/:id)

  // === Price Rules ===
  /**
   * Fetches a list of all price rules.
   * GET /price_rules
   */
  fetchPriceRules() {
    console.log('apiService: Fetching price rules...');
    return apiClient.get('/price_rules');
  },
  /**
   * Creates a new price rule.
   * POST /price_rules
   * @param {object} ruleData - The price rule data, e.g., { price_rule: { part_option_a_id, part_option_b_id, price_premium } }.
   */
  createPriceRule(ruleData) {
    console.log('apiService: Creating price rule...', ruleData);
    return apiClient.post('/price_rules', ruleData);
  },
  /**
   * Deletes a price rule by its ID.
   * DELETE /price_rules/:id
   * @param {string|number} ruleId - The ID of the price rule to delete.
   */
  deletePriceRule(ruleId) {
    console.log(`apiService: Deleting price rule ID: ${ruleId}...`);
    return apiClient.delete(`/price_rules/${ruleId}`);
  },
  // Add fetchPriceRuleDetails(ruleId) if needed (GET /price_rules/:id)

  // === Orders ===
  /**
   * Fetches a list of all orders.
   * GET /orders
   */
  fetchOrders() {
    console.log('apiService: Fetching orders...');
    return apiClient.get('/orders');
  },
  /**
   * Fetches details for a single order by its ID.
   * GET /orders/:id
   * @param {string|number} orderId - The ID of the order.
   */
  fetchOrderDetails(orderId) {
    console.log(`apiService: Fetching order details for ID: ${orderId}...`);
    return apiClient.get(`/orders/${orderId}`);
  },
  /**
   * Creates a new order.
   * POST /orders
   * @param {object} orderData - The order data, e.g., { order: { customer_name, customer_email, selected_part_option_ids: [...] } }.
   */
  createOrder(orderData) {
    console.log('apiService: Creating order...', orderData);
    return apiClient.post('/orders', orderData);
  },
  /**
   * Updates an existing order (e.g., its status).
   * PUT /orders/:id (or PATCH)
   * @param {string|number} orderId - The ID of the order to update.
   * @param {object} orderData - The updated order data, e.g., { order: { status } }.
   */
  updateOrder(orderId, orderData) {
    console.log(`apiService: Updating order ID: ${orderId}...`, orderData);
    return apiClient.put(`/orders/${orderId}`, orderData); // Or PATCH
  },
  /**
   * Deletes/cancels an order by its ID.
   * DELETE /orders/:id
   * @param {string|number} orderId - The ID of the order to delete.
   */
  deleteOrder(orderId) {
    console.log(`apiService: Deleting order ID: ${orderId}...`);
    return apiClient.delete(`/orders/${orderId}`);
  },

  // === Dynamic Configuration Endpoints ===
  /**
   * Validates a combination of selected part options.
   * POST /product_configuration/validate_selection
   * @param {array<number>} selectedOptionIds - An array of selected part option IDs.
   */
  validateSelection(selectedOptionIds) {
    console.log('apiService: Validating selection...', selectedOptionIds);
    return apiClient.post('/product_configuration/validate_selection', { selected_part_option_ids: selectedOptionIds });
  },
  /**
   * Calculates the total price for a combination of selected part options.
   * POST /product_configuration/calculate_price
   * @param {array<number>} selectedOptionIds - An array of selected part option IDs.
   */
  calculatePrice(selectedOptionIds) {
    console.log('apiService: Calculating price...', selectedOptionIds);
    return apiClient.post('/product_configuration/calculate_price', { selected_part_option_ids: selectedOptionIds });
  },
};