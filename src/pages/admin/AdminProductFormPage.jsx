// src/pages/admin/AdminProductFormPage.jsx
import React, { useState, useEffect } from 'react';
// Import hooks from react-router-dom
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { apiService } from '@/services/api';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from "sonner"; // Using Sonner
import { ArrowLeft } from 'lucide-react';

// Accept mode prop, remove context/navigateTo
const AdminProductFormPage = ({ mode }) => {
    // Get productId from URL if present (for edit mode)
    const { productId } = useParams();
    // Hook for navigation
    const navigate = useNavigate();
    const isEditMode = mode === 'edit';
    const [loading, setLoading] = useState(false); // For submission spinner
    const [loadingData, setLoadingData] = useState(false); // For fetching data in edit mode
    const [error, setError] = useState(null);

     const form = useForm({
        defaultValues: { name: "", description: "" },
     });

    // Effect to load data in edit mode
    useEffect(() => {
        form.reset({ name: "", description: "" });
        setError(null);
        if (isEditMode && productId) {
            setLoadingData(true);
            apiService.getProduct(productId)
                .then(data => {
                     form.reset({ name: data.name, description: data.description || "" });
                })
                .catch(err => {
                    console.error("Failed to fetch product data:", err);
                    setError(new Error(`Failed to load product data: ${err.message}`));
                    toast.error("Error Loading Data", { description: err.message });
                })
                .finally(() => setLoadingData(false));
        }
    }, [isEditMode, productId, form]); // Dependencies for effect

    // Form submission handler
    const onSubmit = async (values) => {
         setLoading(true);
         setError(null);
         const successMessage = isEditMode ? "Product Updated" : "Product Created";
         const action = isEditMode
             ? () => apiService.updateProduct(productId, values)
             : () => apiService.createProduct(values);

         try {
             await action();
             toast.success(successMessage);
             navigate('/admin/products'); // Use navigate to go back to list
         } catch (err) {
            console.error(`Error ${isEditMode ? 'updating' : 'creating'} product:`, err);
            setError(err); // Display error near the form
             toast.error(`Error ${isEditMode ? 'Updating' : 'Creating'} Product`, { description: err.message || "An unknown error occurred." });
         } finally {
             setLoading(false);
         }
    };

    // Handler for cancel button
    const handleCancel = () => {
        navigate('/admin/products'); // Navigate back to list
    };

    if (loadingData) return <LoadingSpinner />; // Show loader only when fetching data for edit

    return (
        <div>
             {/* Use Button with onClick for cancel */}
             <Button variant="outline" onClick={handleCancel} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Products
            </Button>
            <Card>
                 <CardHeader>
                    <CardTitle>{isEditMode ? 'Edit Product' : 'Add New Product'}</CardTitle>
                    <CardDescription>
                        {isEditMode ? `Editing product ID: ${productId}` : 'Fill in the details for the new product.'}
                    </CardDescription>
                 </CardHeader>
                <CardContent>
                    {error && !loading && <ErrorMessage error={error} title="Operation Failed"/>}
                    <Form {...form}>
                        {/* Form uses the updated onSubmit handler */}
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField control={form.control} name="name" rules={{ required: "Product name cannot be empty."}}
                                render={({ field }) => ( <FormItem> <FormLabel>Product Name</FormLabel> <FormControl> <Input placeholder="e.g., Mountain Bike Pro" {...field} disabled={loading || loadingData} /> </FormControl> <FormMessage /> </FormItem> )}
                            />
                             <FormField control={form.control} name="description"
                                render={({ field }) => ( <FormItem> <FormLabel>Description</FormLabel> <FormControl> <Textarea placeholder="A detailed description..." {...field} disabled={loading || loadingData}/> </FormControl> <FormMessage /> </FormItem> )}
                            />
                            <div className="flex justify-end space-x-2 pt-4">
                                 {/* Cancel button uses handleCancel */}
                                 <Button variant="outline" type="button" onClick={handleCancel} disabled={loading}>Cancel</Button>
                                <Button type="submit" disabled={loading || loadingData}>
                                     {loading ? <LoadingSpinner className="mr-2 h-4 w-4"/> : null}
                                     {isEditMode ? 'Save Changes' : 'Create Product'}
                                 </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminProductFormPage;