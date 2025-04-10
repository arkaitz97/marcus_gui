// src/pages/admin/AdminProductListPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
// Import Link for navigation
import { Link } from 'react-router-dom';
import { apiService } from '@/services/api';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from "sonner"; // Using Sonner
import { PlusCircle, Trash2, Wrench } from 'lucide-react';

// Removed navigateTo prop
const AdminProductListPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
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
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleDelete = async (productId) => {
        if (!window.confirm("Are you sure you want to delete this product and ALL its parts/options?")) return;
         try {
             await apiService.deleteProduct(productId);
             toast.success("Product Deleted");
             fetchData(); // Refresh list
         } catch (err) {
            console.error("Delete product error:", err);
             toast.error("Error Deleting Product", {
                 description: err.message || "Could not delete product."
             });
         }
    };

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorMessage error={error} title="Failed to load products"/>;

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Manage Products</h1>
                 {/* Use Link for Add button */}
                 <Link to="/admin/products/new">
                     <Button>
                         <PlusCircle className="mr-2 h-4 w-4" /> Add Product
                     </Button>
                 </Link>
            </div>
            <Card>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.length > 0 ? products.map((product) => (
                            <TableRow key={product.id}>
                                <TableCell className="font-medium">{product.name}</TableCell>
                                <TableCell className="text-muted-foreground max-w-xs truncate">{product.description}</TableCell>
                                <TableCell className="text-right space-x-1">
                                    {/* Use Link for Parts button */}
                                     <Link to={`/admin/products/${product.id}/parts`}>
                                         <Button variant="outline" size="sm"><Wrench className="mr-1 h-3 w-3" /> Parts</Button>
                                     </Link>
                                     {/* Use Link for Edit button */}
                                     <Link to={`/admin/products/${product.id}/edit`}>
                                         <Button variant="outline" size="sm">Edit</Button>
                                     </Link>
                                     {/* Delete button calls handler */}
                                    <Button variant="destructive" size="sm" onClick={() => handleDelete(product.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        )) : (
                             <TableRow>
                                <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">No products found.</TableCell>
                             </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
};

export default AdminProductListPage;