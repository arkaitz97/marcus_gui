// src/pages/customer/ProductListPage.jsx
import React, { useState, useEffect } from 'react';
import { apiService } from '@/services/api';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import ProductCard from '@/components/customer/ProductCard'; // Uses updated ProductCard with Link

// Removed navigateTo prop
const ProductListPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await apiService.getProducts();
                setProducts(data || []);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    // handleCustomize function is removed as Link is used in ProductCard

    if (loading) return <div className="flex justify-center items-center p-8 min-h-[400px]"><LoadingSpinner className="w-12 h-12"/></div>;
    if (error) return <div className="container mx-auto p-4"><ErrorMessage error={error} title="Failed to load products" /></div>;

    return (
        <div className="container mx-auto p-4 md:p-6">
            <h1 className="text-3xl font-bold mb-6 text-center">Choose Your Bike</h1>
            {products.length === 0 ? (
                 <div className="flex flex-col items-center justify-center min-h-[300px] text-gray-500">
                    <p>No bikes available at the moment.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {/* ProductCard now handles its own navigation via Link */}
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProductListPage;