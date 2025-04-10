// src/pages/admin/AdminOptionListPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom'; // Import router hooks
import { apiService } from '@/services/api';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from "@/components/ui/switch"; // For potential inline stock toggle
import { toast } from "sonner"; // Import sonner
import { PlusCircle, Trash2, Wrench, ArrowLeft, Check, X } from 'lucide-react';

const AdminOptionListPage = () => {
    const { productId, partId } = useParams(); // Get IDs from URL
    const navigate = useNavigate();
    const [options, setOptions] = useState([]);
    const [partName, setPartName] = useState(''); // Store part name
    const [productName, setProductName] = useState(''); // Store product name
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        if (!productId || !partId) {
            setError(new Error("Product ID or Part ID is missing"));
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            // Fetch options, part details (for name), and product details (for name)
             // Fetching part name might require getting all parts and filtering, or a dedicated endpoint
             // Fetching product name requires getProduct
            const [optionsData, partsData, productData] = await Promise.all([
                 apiService.getPartOptions(productId, partId),
                 apiService.getParts(productId), // Fetch parts to find the name
                 apiService.getProduct(productId) // Fetch product to get its name
            ]);

            setOptions(optionsData || []);
            const currentPart = partsData?.find(p => p.id === parseInt(partId));
            setPartName(currentPart?.name || `Part ${partId}`);
            setProductName(productData?.name || `Product ${productId}`);
        } catch (err) {
            setError(err);
            console.error("Failed to fetch options or parent details:", err);
        } finally {
            setLoading(false);
        }
    }, [productId, partId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

     const handleDelete = async (optionId) => {
        if (!window.confirm("Are you sure you want to delete this option?")) return;
        try {
            await apiService.deletePartOption(productId, partId, optionId);
            toast.success("Option Deleted");
            fetchData(); // Refresh list
        } catch (err) {
             console.error("Delete option error:", err);
            toast.error("Error Deleting Option", { description: err.message });
        }
    };

    // Optional: Handler for inline stock toggle (more complex state mgmt needed)
    // const handleStockToggle = async (optionId, currentStock) => { ... }

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorMessage error={error} title="Failed to load options"/>;

     return (
         <div>
             <Button variant="outline" onClick={() => navigate(`/admin/products/${productId}/parts`)} className="mb-4">
                 <ArrowLeft className="mr-2 h-4 w-4" /> Back to Parts for "{productName}"
            </Button>
            <div className="flex justify-between items-center mb-4">
                 <h1 className="text-2xl font-bold truncate pr-4">Manage Options for "{partName}"</h1>
                 {/* Link to Add Option Form */}
                 <Link to={`/admin/products/${productId}/parts/${partId}/options/new`}>
                     <Button><PlusCircle className="mr-2 h-4 w-4" /> Add Option</Button>
                 </Link>
            </div>
             <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Option Name</TableHead>
                            <TableHead>Price ($)</TableHead>
                             <TableHead>In Stock</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                         {options.length > 0 ? options.map((option) => (
                            <TableRow key={option.id}>
                                <TableCell className="font-medium">{option.name}</TableCell>
                                <TableCell>{option.price != null ? parseFloat(option.price).toFixed(2) : '0.00'}</TableCell>
                                <TableCell>
                                    {option.in_stock ? <Check className="h-5 w-5 text-green-600"/> : <X className="h-5 w-5 text-red-600"/>}
                                    {/* Optional: Inline toggle (requires handler) */}
                                    {/* <Switch checked={option.in_stock} onCheckedChange={(checked) => handleStockToggle(option.id, checked)} /> */}
                                </TableCell>
                                <TableCell className="text-right space-x-1">
                                    {/* Link to Edit Option Form */}
                                    <Link to={`/admin/products/${productId}/parts/${partId}/options/${option.id}/edit`}>
                                         <Button variant="outline" size="sm"><Wrench className="mr-1 h-3 w-3"/> Edit</Button>
                                    </Link>
                                    <Button variant="destructive" size="sm" onClick={() => handleDelete(option.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                         )) : (
                             <TableRow><TableCell colSpan={4} className="text-center h-24 text-muted-foreground">No options found for this part.</TableCell></TableRow>
                         )}
                     </TableBody>
                </Table>
            </Card>
         </div>
    );
};

export default AdminOptionListPage;