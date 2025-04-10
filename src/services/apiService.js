import axios from 'axios';
const API_BASE_URL = 'http://localhost:3001/api/v1';
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});
apiClient.interceptors.response.use(
  response => response, 
  error => {
    console.error('API call error:', error.response?.data || error.message || error);
    return Promise.reject(error); 
  }
);
export default {
  fetchProducts() {
    console.log('apiService: Fetching products...');
    return apiClient.get('/products');
  },
  fetchProductDetails(productId) {
    console.log(`apiService: Fetching product details for ID: ${productId}...`);
    return apiClient.get(`/products/${productId}`);
  },
  createProduct(productData) {
    console.log('apiService: Creating product...', productData);
    return apiClient.post('/products', productData);
  },
  updateProduct(productId, productData) {
    console.log(`apiService: Updating product ID: ${productId}...`, productData);
    return apiClient.put(`/products/${productId}`, productData); 
  },
  deleteProduct(productId) {
    console.log(`apiService: Deleting product ID: ${productId}...`);
    return apiClient.delete(`/products/${productId}`);
  },
  fetchParts(productId) {
    console.log(`apiService: Fetching parts for product ID: ${productId}...`);
    return apiClient.get(`/products/${productId}/parts`);
  },
  fetchPartDetails(productId, partId) {
    console.log(`apiService: Fetching part details for product ID: ${productId}, part ID: ${partId}...`);
    return apiClient.get(`/products/${productId}/parts/${partId}`);
  },
  createPart(productId, partData) {
    console.log(`apiService: Creating part for product ID: ${productId}...`, partData);
    return apiClient.post(`/products/${productId}/parts`, partData);
  },
  updatePart(productId, partId, partData) {
    console.log(`apiService: Updating part ID: ${partId} for product ID: ${productId}...`, partData);
    return apiClient.put(`/products/${productId}/parts/${partId}`, partData); 
  },
  deletePart(productId, partId) {
    console.log(`apiService: Deleting part ID: ${partId} for product ID: ${productId}...`);
    return apiClient.delete(`/products/${productId}/parts/${partId}`);
  },
  fetchPartOptions(productId, partId) {
    console.log(`apiService: Fetching options for product ID: ${productId}, part ID: ${partId}...`);
    return apiClient.get(`/products/${productId}/parts/${partId}/part_options`);
  },
  createPartOption(productId, partId, optionData) {
    console.log(`apiService: Creating option for part ID: ${partId}...`, optionData);
    return apiClient.post(`/products/${productId}/parts/${partId}/part_options`, optionData);
  },
  updatePartOption(productId, partId, optionId, optionData) {
     console.log(`apiService: Updating option ID: ${optionId}...`, optionData);
    return apiClient.put(`/products/${productId}/parts/${partId}/part_options/${optionId}`, optionData); 
  },
  deletePartOption(productId, partId, optionId) {
    console.log(`apiService: Deleting option ID: ${optionId}...`);
    return apiClient.delete(`/products/${productId}/parts/${partId}/part_options/${optionId}`);
  },
  fetchRestrictions() {
    console.log('apiService: Fetching restrictions...');
    return apiClient.get('/part_restrictions');
  },
  createRestriction(restrictionData) {
    console.log('apiService: Creating restriction...', restrictionData);
    return apiClient.post('/part_restrictions', restrictionData);
  },
  deleteRestriction(restrictionId) {
    console.log(`apiService: Deleting restriction ID: ${restrictionId}...`);
    return apiClient.delete(`/part_restrictions/${restrictionId}`);
  },
  fetchPriceRules() {
    console.log('apiService: Fetching price rules...');
    return apiClient.get('/price_rules');
  },
  createPriceRule(ruleData) {
    console.log('apiService: Creating price rule...', ruleData);
    return apiClient.post('/price_rules', ruleData);
  },
  deletePriceRule(ruleId) {
    console.log(`apiService: Deleting price rule ID: ${ruleId}...`);
    return apiClient.delete(`/price_rules/${ruleId}`);
  },
  fetchOrders() {
    console.log('apiService: Fetching orders...');
    return apiClient.get('/orders');
  },
  fetchOrderDetails(orderId) {
    console.log(`apiService: Fetching order details for ID: ${orderId}...`);
    return apiClient.get(`/orders/${orderId}`);
  },
  createOrder(orderData) {
    console.log('apiService: Creating order...', orderData);
    return apiClient.post('/orders', orderData);
  },
  updateOrder(orderId, orderData) {
    console.log(`apiService: Updating order ID: ${orderId}...`, orderData);
    return apiClient.put(`/orders/${orderId}`, orderData); 
  },
  deleteOrder(orderId) {
    console.log(`apiService: Deleting order ID: ${orderId}...`);
    return apiClient.delete(`/orders/${orderId}`);
  },
  validateSelection(selectedOptionIds) {
    console.log('apiService: Validating selection...', selectedOptionIds);
    return apiClient.post('/product_configuration/validate_selection', { selected_part_option_ids: selectedOptionIds });
  },
  calculatePrice(selectedOptionIds) {
    console.log('apiService: Calculating price...', selectedOptionIds);
    return apiClient.post('/product_configuration/calculate_price', { selected_part_option_ids: selectedOptionIds });
  },
};