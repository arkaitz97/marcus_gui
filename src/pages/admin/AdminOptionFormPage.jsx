// src/pages/admin/AdminOptionFormPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Import router hooks
import { useForm } from 'react-hook-form';
import { apiService } from '@/services/api';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from "sonner"; // Import sonner
import { ArrowLeft } from 'lucide-react';

const AdminOptionFormPage = ({ mode }) => {
    const { productId, partId, optionId } = useParams(); // Get IDs from URL
    const navigate = useNavigate();
    const isEditMode = mode === 'edit';
    const [loading, setLoading] = useState(false); // Submission loading
    const [loadingData, setLoadingData] = useState(false); // Data fetching loading
    const [error, setError] = useState(null);
    const [partName, setPartName] = useState(''); // For display

    const form = useForm({
        defaultValues: {
            name: "",
            price: "0.00",
            in_stock: true,
        },
     });

    useEffect(() => {
        form.reset({ name: "", price: "0.00", in_stock: true });
        setError(null);

        if (!productId || !partId) {
            setError(new Error("Missing product or part ID in URL"));
            toast.error("Error", { description: "Cannot load form without product/part context." });
            setLoadingData(false);
            return;
        }

        setLoadingData(true);

         // Fetch part name (could be optimized by passing from list state if available)
         apiService.getParts(productId)
             .then(parts => {
                 const currentPart = parts?.find(p => p.id === parseInt(partId));
                 setPartName(currentPart?.name || `Part ${partId}`);
             }).catch(err => console.error("Failed to get part name", err));


        if (isEditMode && optionId) {
             // Fetch the specific option
             apiService.getPartOptions(productId, partId) // Or use dedicated getPartOption if available
                 .then(options => {
                     const option = options.find(opt => opt.id === parseInt(optionId));
                     if (option) {
                         form.reset({
                            name: option.name,
                            price: option.price != null ? parseFloat(option.price).toFixed(2) : "0.00", // Format for input
                            in_stock: option.in_stock ?? true,
                        });
                     } else { throw new Error("Option not found"); }
                      setLoadingData(false);
                 })
                 .catch(err => {
                     console.error("Failed to fetch option data:", err);
                     setError(new Error(`Failed to load option data: ${err.message}`));
                     toast.error("Error Loading Data", { description: err.message });
                     setLoadingData(false);
                 });
        } else {
            setLoadingData(false); // No specific option data to fetch for create mode
        }
    }, [isEditMode, productId, partId, optionId, form]);

    const onSubmit = async (values) => {
        setLoading(true);
        setError(null);
        const navigateToList = () => navigate(`/admin/products/${productId}/parts/${partId}/options`);
        const dataToSend = {
            ...values,
            price: values.price, // Keep as string formatted to 2 decimals
            in_stock: values.in_stock,
         };

        try {
            if (isEditMode) {
                await apiService.updatePartOption(productId, partId, optionId, dataToSend);
                toast.success("Option Updated");
            } else {
                await apiService.createPartOption(productId, partId, dataToSend);
                toast.success("Option Created");
            }
             navigateToList();
        } catch (err) {
            console.error(`Error ${isEditMode ? 'updating' : 'creating'} option:`, err);
            setError(err);
            toast.error(`Error ${isEditMode ? 'Updating' : 'Creating'} Option`, { description: err.message });
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => navigate(`/admin/products/${productId}/parts/${partId}/options`);

    if (loadingData) return <div className="p-4"><LoadingSpinner /></div>;
    // Show error if essential IDs are missing
    if (!productId || !partId) return <div className="p-4"><ErrorMessage error={error || new Error("Missing required parameters.")} title="Cannot Load Form" /></div>;


    return (
        <div>
             <Button variant="outline" onClick={handleCancel} className="mb-4">
                 <ArrowLeft className="mr-2 h-4 w-4" /> Back to Options for "{partName}"
            </Button>
             <Card>
                <CardHeader>
                    <CardTitle>{isEditMode ? 'Edit Option' : 'Add New Option'}</CardTitle>
                    <CardDescription>For part "{partName}"</CardDescription>
                </CardHeader>
                 <CardContent>
                     {error && !loading && <ErrorMessage error={error} title="Operation Failed"/>}
                     <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="name"
                                rules={{ required: 'Option name is required' }}
                                render={({ field }) => ( <FormItem> <FormLabel>Option Name</FormLabel> <FormControl> <Input placeholder="e.g., Red, Carbon Fiber, 29-inch" {...field} disabled={loading || loadingData} /> </FormControl> <FormMessage /> </FormItem> )}
                            />
                             <FormField
                                control={form.control}
                                name="price"
                                rules={{ required: 'Price is required (enter 0 if no cost)', pattern: { value: /^\d+(\.\d{1,2})?$/, message: "Invalid price format (e.g., 10.99 or 0)"} }}
                                render={({ field }) => ( <FormItem> <FormLabel>Price Adjustment ($)</FormLabel> <FormControl> <Input type="text" inputMode="decimal" placeholder="0.00" {...field} disabled={loading || loadingData} /> </FormControl> <FormDescription>Base price is defined elsewhere. Enter 0 for no adjustment.</FormDescription> <FormMessage /> </FormItem> )}
                            />
                            <FormField
                                control={form.control}
                                name="in_stock"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                        <div className="space-y-0.5">
                                            <FormLabel>In Stock</FormLabel>
                                            <FormDescription> Available for customers? </FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch checked={field.value} onCheckedChange={field.onChange} disabled={loading || loadingData} aria-readonly />
                                         </FormControl>
                                    </FormItem>
                                )}
                            />

                            <div className="flex justify-end space-x-2 pt-4">
                                <Button variant="outline" type="button" onClick={handleCancel} disabled={loading}>Cancel</Button>
                                <Button type="submit" disabled={loading || loadingData}> {loading ? <LoadingSpinner className="mr-2 h-4 w-4"/> : null} {isEditMode ? 'Save Changes' : 'Create Option'} </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminOptionFormPage;