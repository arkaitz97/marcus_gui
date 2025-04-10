// src/App.jsx
import React from 'react';
// Import routing components and Link
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Bike, Cog } from 'lucide-react';

// Import Page Components
import ProductListPage from './pages/customer/ProductListPage';
import ProductDetailPage from './pages/customer/ProductDetailPage';
import AdminLayout from './pages/admin/AdminLayout'; // Handles nested admin routes

function App() {
    // useLocation helps determine if we are in an admin path for layout adjustments
    const location = useLocation();
    const isAdminPage = location.pathname.startsWith('/admin');

    return (
        <div className="min-h-screen flex flex-col">
            {/* Render header only for non-admin pages */}
            {!isAdminPage && (
                <header className="bg-gray-800 text-white p-4 shadow-md sticky top-0 z-50">
                    <div className="container mx-auto flex justify-between items-center">
                        {/* Use Link for navigation to home */}
                        <Link to="/" className="text-xl md:text-2xl font-bold cursor-pointer flex items-center">
                             <Bike className="mr-2 h-5 w-5 md:h-6 md:w-6"/> Marcus's Bike Shop
                        </Link>
                        {/* Use Link for navigation to admin */}
                        <Link to="/admin">
                             <Button variant="outline" size="sm">
                                 <Cog className="mr-1 md:mr-2 h-4 w-4"/> Admin
                             </Button>
                        </Link>
                    </div>
                </header>
            )}

            {/* Define application routes */}
            {/* Use flex-grow on main only if header/footer might take space */}
            <main className={`${isAdminPage ? '' : 'flex-grow'}`}>
                <Routes>
                    {/* Customer Facing Routes */}
                    <Route path="/" element={<ProductListPage />} />
                    {/* Use URL parameter :productId */}
                    <Route path="/product/:productId" element={<ProductDetailPage />} />

                    {/* Admin Routes - All routes starting with /admin are handled by AdminLayout */}
                    <Route path="/admin/*" element={<AdminLayout />} />

                    {/* Fallback 404 Route for unmatched paths */}
                     <Route path="*" element={ <div className='container mx-auto p-10 text-center'> <h1 className='text-2xl font-bold'>404 - Page Not Found</h1> <Link to="/"><Button variant="link">Go Home</Button></Link> </div> } />
                </Routes>
            </main>
        </div>
    );
}

export default App;