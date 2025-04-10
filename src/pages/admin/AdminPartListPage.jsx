// src/pages/admin/AdminPartListPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
// Import router hooks and Link
import { useParams, Link, useNavigate } from 'react-router-dom';
import { apiService } from '@/services/api';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from "sonner"; // Using Sonner
import { PlusCircle, Trash2, Wrench, List, ArrowLeft } from 'lucide-react';

// Removed navigateTo prop
const AdminPartListPage = () => {
    const { productId } = useParams(); // Get productId from URL
    const navigate = useNavigate(); // Hook for navigation
    const [parts, setParts] = useState([]);
    const [productName, setProductName] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        if (!productId) {
             setError(new Error("Product ID is missing from URL"));
             setLoading(false);
             return;
        };
        setLoading(true);
        setError(null);
        try {
            const [partsData, productData] = await Promise.all([
                apiService.getParts(productId),
                apiService.getProduct(productId)
            ]);
            setParts(partsData || []);
            setProductName(productData?.name || `Product ${productId}`);
        } catch (err) {
            setError(err);
            console.error("Failed to fetch parts or product:", err);
        } finally {
            setLoading(false);
        }
    }, [productId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

     const handleDelete = async (partId) => {
        if (!window.confirm("Are you sure you want to delete this part and all its options?")) return;
        try {
            await apiService.deletePart(productId, partId);
            toast.success("Part Deleted");
            fetchData(); // Refresh list
        } catch (err) {
            console.error("Delete part error:", err);
            toast.error("Error Deleting Part", { description: err.message });
        }
    };

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorMessage error={error} title="Failed to load parts"/>;

    return (
         <div>
             {/* Use navigate for back button */}
             <Button variant="outline" onClick={() => navigate('/admin/products')} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Products
            </Button>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold truncate pr-4">Manage Parts for "{productName}"</h1>
                {/* Use Link for Add button */}
                <Link to={`/admin/products/${productId}/parts/new`}>
                    <Button> <PlusCircle className="mr-2 h-4 w-4" /> Add Part </Button>
                </Link>
            </div>
             <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Part Name</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                         {parts.length > 0 ? parts.map((part) => (
                            <TableRow key={part.id}>
                                <TableCell className="font-medium">{part.name}</TableCell>
                                <TableCell className="text-right space-x-1">
                                    {/* Link to Options List */}
                                    <Link to={`/admin/products/${productId}/parts/${part.id}/options`}>
                                        <Button variant="outline" size="sm"><List className="mr-1 h-3 w-3" /> Options</Button>
                                    </Link>
                                    {/* Link to Edit Part Form */}
                                    <Link to={`/admin/products/${productId}/parts/${part.id}/edit`}>
                                        <Button variant="outline" size="sm"><Wrench className="mr-1 h-3 w-3"/> Edit</Button>
                                    </Link>
                                    {/* Delete button uses handler */}
                                    <Button variant="destructive" size="sm" onClick={() => handleDelete(part.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                         )) : (
                             <TableRow><TableCell colSpan={2} className="text-center h-24 text-muted-foreground">No parts found for this product.</TableCell></TableRow>
                         )}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
};

export default AdminPartListPage;