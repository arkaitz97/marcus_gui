import { createRouter, createWebHistory } from 'vue-router';

// Import view components using lazy loading
const ProductListView = () => import('../views/ProductListView.vue');
const ProductDetailView = () => import('../views/ProductDetailView.vue');
const CartView = () => import('../views/CartView.vue'); // <-- Import CartView
const AdminLayout = () => import('../views/admin/AdminLayout.vue');
const AdminDashboard = () => import('../views/admin/AdminDashboard.vue');
const AdminProductList = () => import('../views/admin/AdminProductList.vue');
const AdminProductForm = () => import('../views/admin/AdminProductForm.vue');
const AdminProductPartsView = () => import('../views/admin/AdminProductPartsView.vue');
const AdminPartOptionsView = () => import('../views/admin/AdminPartOptionsView.vue');
const AdminRestrictionListView = () => import('../views/admin/AdminRestrictionListView.vue');
const AdminPriceRuleListView = () => import('../views/admin/AdminPriceRuleListView.vue');
const AdminOrderListView = () => import('../views/admin/AdminOrderListView.vue');
const AdminOrderDetailView = () => import('../views/admin/AdminOrderDetailView.vue');

const routes = [
  // --- Customer Facing Routes ---
  { path: '/', name: 'ProductList', component: ProductListView },
  { path: '/products/:id', name: 'ProductDetail', component: ProductDetailView, props: true },
  // --- New Cart Route ---
  {
    path: '/cart',
    name: 'CartView',
    component: CartView,
  },
  // --- End New Cart Route ---

  // Admin Routes
  {
    path: '/admin',
    component: AdminLayout,
    children: [
      { path: '', name: 'AdminDashboard', component: AdminDashboard },
      // Product Management
      { path: 'products', name: 'AdminProductList', component: AdminProductList },
      { path: 'products/new', name: 'AdminProductCreate', component: AdminProductForm },
      { path: 'products/:id/edit', name: 'AdminProductEdit', component: AdminProductForm, props: true },
      // Part Management
      { path: 'products/:productId/parts', name: 'AdminProductParts', component: AdminProductPartsView, props: true },
      // Part Option Management
      { path: 'products/:productId/parts/:partId/options', name: 'AdminPartOptions', component: AdminPartOptionsView, props: true },
      // Rule Management
      { path: 'restrictions', name: 'AdminRestrictionList', component: AdminRestrictionListView },
      { path: 'pricerules', name: 'AdminPriceRuleList', component: AdminPriceRuleListView },
      // Order Management
      { path: 'orders', name: 'AdminOrderList', component: AdminOrderListView },
      { path: 'orders/:id', name: 'AdminOrderDetail', component: AdminOrderDetailView, props: true },
    ],
  },
  // Optional: Add a 404 Not Found route
];

// Create the router instance
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) { return savedPosition; } else { return { top: 0 }; }
  },
});

export default router;