// src/pages/admin/AdminLayout.jsx
import React from 'react';
// Import Routes and Route for defining nested routes
import { Routes, Route } from 'react-router-dom';
// Import layout components
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminContainer from '@/components/admin/AdminContainer';

// Import all Admin Page components for routing
import AdminProductListPage from './AdminProductListPage';
import AdminProductFormPage from './AdminProductFormPage';
import AdminPartListPage from './AdminPartListPage';
import AdminPartFormPage from './AdminPartFormPage';
import AdminOptionListPage from './AdminOptionListPage';
import AdminOptionFormPage from './AdminOptionFormPage';
import AdminRestrictionListPage from './AdminRestrictionListPage';
import AdminRestrictionFormPage from './AdminRestrictionFormPage';
import AdminPriceRuleListPage from './AdminPriceRuleListPage';
import AdminPriceRuleFormPage from './AdminPriceRuleFormPage';
import AdminOrderListPage from './AdminOrderListPage';
import AdminOrderDetailPage from './AdminOrderDetailPage';
// import AdminDashboardPage from './AdminDashboardPage'; // If exists

// This component structure defines the Admin UI layout and handles nested routing
const AdminLayout = () => {

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-muted/40 dark:bg-background">
            {/* Sidebar uses NavLink internally now */}
            <AdminSidebar />

            {/* Content area where routed admin pages will render */}
            <AdminContainer>
                {/* Define the routes available within the /admin path */}
                <Routes>
                    {/* Index Route: Default component for "/admin" */}
                    <Route index element={<AdminProductListPage />} />

                    {/* Optional: Dashboard Route */}
                    {/* <Route path="dashboard" element={<AdminDashboardPage />} /> */}

                    {/* Product Routes */}
                    <Route path="products" element={<AdminProductListPage />} />
                    <Route path="products/new" element={<AdminProductFormPage mode="create" />} />
                    <Route path="products/:productId/edit" element={<AdminProductFormPage mode="edit" />} />

                    {/* Part Routes */}
                    <Route path="products/:productId/parts" element={<AdminPartListPage />} />
                    <Route path="products/:productId/parts/new" element={<AdminPartFormPage mode="create" />} />
                    <Route path="products/:productId/parts/:partId/edit" element={<AdminPartFormPage mode="edit" />} />

                    {/* Option Routes */}
                     <Route path="products/:productId/parts/:partId/options" element={<AdminOptionListPage />} />
                     <Route path="products/:productId/parts/:partId/options/new" element={<AdminOptionFormPage mode="create" />} />
                     <Route path="products/:productId/parts/:partId/options/:optionId/edit" element={<AdminOptionFormPage mode="edit" />} />

                     {/* Restriction Routes */}
                    <Route path="restrictions" element={<AdminRestrictionListPage />} />
                    <Route path="restrictions/new" element={<AdminRestrictionFormPage />} />

                     {/* Price Rule Routes */}
                    <Route path="pricerules" element={<AdminPriceRuleListPage />} />
                    <Route path="pricerules/new" element={<AdminPriceRuleFormPage />} />

                    {/* Order Routes */}
                    <Route path="orders" element={<AdminOrderListPage />} />
                    <Route path="orders/:orderId" element={<AdminOrderDetailPage />} />

                     {/* Fallback for unknown /admin routes */}
                     <Route path="*" element={<div className='text-center p-10'> <h1 className='text-xl font-semibold'>Admin Section - Page Not Found</h1> <p className='text-muted-foreground'>The requested admin page does not exist.</p> </div>} />
                </Routes>
            </AdminContainer>
        </div>
    );
};

export default AdminLayout;