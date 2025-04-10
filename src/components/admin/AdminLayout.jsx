import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom'; // Import Outlet
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminContainer from '@/components/admin/AdminContainer';

// Import all Admin Page components that will be routed here
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
// Import AdminDashboardPage if you create it

// Remove navigateTo, currentPage, pageContext props
const AdminLayout = () => {

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-muted/40 dark:bg-background">
            {/* Sidebar now uses NavLink internally for navigation */}
            <AdminSidebar />
            <AdminContainer>
                {/* Define nested admin routes */}
                <Routes>
                    {/* Default admin route */}
                    <Route index element={<AdminProductListPage />} />
                    {/* Product Routes */}
                    <Route path="products" element={<AdminProductListPage />} />
                    <Route path="products/new" element={<AdminProductFormPage mode="create" />} />
                    <Route path="products/:productId/edit" element={<AdminProductFormPage mode="edit" />} />
                    {/* Part Routes (nested under products) */}
                    <Route path="products/:productId/parts" element={<AdminPartListPage />} />
                    <Route path="products/:productId/parts/new" element={<AdminPartFormPage mode="create" />} />
                    <Route path="products/:productId/parts/:partId/edit" element={<AdminPartFormPage mode="edit" />} />
                    {/* Option Routes (nested under parts) */}
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

                     {/* Optional: Dashboard Route */}
                     {/* <Route path="dashboard" element={<AdminDashboardPage />} /> */}

                     {/* Fallback for unknown admin routes */}
                     <Route path="*" element={<div>Admin Section - Page Not Found</div>} />

                     {/* The Outlet component renders the matched child route component defined above */}
                     {/* NOTE: Outlet is implicitly used when defining nested <Route> structures like this */}
                     {/* Explicit <Outlet /> might be needed if wrapping content */}
                </Routes>
                 {/* If you have wrapping content *around* the routed components, use Outlet: */}
                 {/* <h1>Admin Area</h1> <Outlet /> */}
            </AdminContainer>
        </div>
    );
};

export default AdminLayout;