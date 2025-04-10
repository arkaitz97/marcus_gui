// src/pages/admin/AdminRestrictionFormPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom'; // Import router hooks
import { useForm } from 'react-hook-form';
import { apiService } from '@/services/api';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from "sonner"; // Import sonner
import { ArrowLeft } from 'lucide-react';

const AdminRestrictionFormPage = () => {
    const navigate = useNavigate();
    const [allOptions, setAllOptions] = useState([]);
    const [loadingOptions, setLoadingOptions] = useState(true);
    const [loadingSubmit, setLoadingSubmit] = useState(false); // Submission loading
    const [error, setError] = useState(null); // General error state for loading/submission

     const form = useForm({
        defaultValues: {
            part_option_id: "",
            restricted_part_option_id: "",
        },
     });

    // Fetch all options on mount
     useEffect(() => {
         setLoadingOptions(true);
         setError(null);
         apiService.getAllPartOptions()
            .then(data => setAllOptions(data || []))
            .catch(err => {
                console.error("Failed to fetch options:", err);
                setError(new Error(`Failed to load options for form: ${err.message}`));
                toast.error("Error loading form data", { description: err.message });
            })
            .finally(() => setLoadingOptions(false));
     }, []);

    // Group options by product/part for the dropdown
     const groupedOptions = useMemo(() => {
        return allOptions.reduce((acc, option) => {
             const groupName = `${option.product_name || '?'} - ${option.part_name || '?'}`;
             if (!acc[groupName]) acc[groupName] = [];
             acc[groupName].push(option);
             return acc;
         }, {});
     }, [allOptions]);

     const onSubmit = async (values) => {
        setLoadingSubmit(true);
        setError(null); // Clear previous errors

        const optionAId = parseInt(values.part_option_id);
        const optionBId = parseInt(values.restricted_part_option_id);

        if (!optionAId || !optionBId) {
            setError(new Error("Both options must be selected."));
            setLoadingSubmit(false);
            return;
        }

        if (optionAId === optionBId) {
             setError(new Error("An option cannot restrict itself."));
             // Set error specifically on the second field for better UX
             form.setError("restricted_part_option_id", { type: "manual", message: "Cannot be the same as the first option." });
             setLoadingSubmit(false);
             return;
        }

        try {
             const dataToSend = {
                part_option_id: optionAId,
                restricted_part_option_id: optionBId,
             };
             await apiService.createPartRestriction(dataToSend);
             toast.success("Restriction Created");
             navigate('/admin/restrictions'); // Go back to list
        } catch (err) {
             console.error("Error Creating Restriction:", err);
             setError(err); // Show general error
             toast.error("Error Creating Restriction", { description: err.message });
        } finally {
            setLoadingSubmit(false);
        }
    };

    const handleCancel = () => navigate('/admin/restrictions');

    // Show single spinner while options load
    if (loadingOptions) return <div className="p-4"><LoadingSpinner /></div>;
    // If options failed to load, prevent form rendering and show error
    if (error && allOptions.length === 0) return <ErrorMessage error={error} title="Failed to load form data" />;

    return (
         <div>
             <Button variant="outline" onClick={handleCancel} className="mb-4">
                 <ArrowLeft className="mr-2 h-4 w-4" /> Back to Restrictions
            </Button>
            <Card>
                 <CardHeader> <CardTitle>Add New Restriction</CardTitle> </CardHeader>
                 <CardContent>
                    {/* Show submission errors here */}
                    {error && !loadingSubmit && <div className="pb-4"><ErrorMessage error={error} title="Operation Failed"/></div>}
                     <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                             <FormField
                                control={form.control}
                                name="part_option_id"
                                rules={{ required: 'Please select the first option' }}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>When this option is selected...</FormLabel>
                                         <Select onValueChange={field.onChange} value={field.value?.toString()} disabled={loadingSubmit || loadingOptions}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Select an option" /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                {Object.entries(groupedOptions).sort().map(([groupName, optionsInGroup]) => ( // Sort groups alphabetically
                                                    <SelectGroup key={groupName}>
                                                        <SelectLabel>{groupName}</SelectLabel>
                                                        {optionsInGroup.sort((a,b) => a.name.localeCompare(b.name)) // Sort options alphabetically
                                                          .map(option => ( <SelectItem key={option.id} value={option.id.toString()}>{option.name}</SelectItem> ))}
                                                     </SelectGroup>
                                                 ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="restricted_part_option_id"
                                rules={{ required: 'Please select the restricted option' }}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>...this option becomes unavailable</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value?.toString()} disabled={loadingSubmit || loadingOptions}>
                                             <FormControl><SelectTrigger><SelectValue placeholder="Select an option" /></SelectTrigger></FormControl>
                                             <SelectContent>
                                                 {Object.entries(groupedOptions).sort().map(([groupName, optionsInGroup]) => ( // Sort groups
                                                    <SelectGroup key={groupName}>
                                                         <SelectLabel>{groupName}</SelectLabel>
                                                         {optionsInGroup.sort((a,b) => a.name.localeCompare(b.name)) // Sort options
                                                           .map(option => ( <SelectItem key={option.id} value={option.id.toString()}>{option.name}</SelectItem> ))}
                                                     </SelectGroup>
                                                 ))}
                                             </SelectContent>
                                        </Select>
                                         <FormMessage />
                                    </FormItem>
                                )}
                             />

                            <div className="flex justify-end space-x-2 pt-4">
                                <Button variant="outline" type="button" onClick={handleCancel} disabled={loadingSubmit}>Cancel</Button>
                                <Button type="submit" disabled={loadingSubmit || loadingOptions || allOptions.length === 0}>
                                     {loadingSubmit ? <LoadingSpinner className="mr-2 h-4 w-4"/> : null} Create Restriction
                                </Button>
                            </div>
                         </form>
                     </Form>
                 </CardContent>
            </Card>
        </div>
    );
};

export default AdminRestrictionFormPage;