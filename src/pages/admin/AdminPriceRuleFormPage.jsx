// src/pages/admin/AdminPriceRuleFormPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom'; // Import router hooks
import { useForm } from 'react-hook-form';
import { apiService } from '@/services/api';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { toast } from "sonner"; // Import sonner
import { ArrowLeft } from 'lucide-react';

const AdminPriceRuleFormPage = () => {
     const navigate = useNavigate();
     const [allOptions, setAllOptions] = useState([]);
     const [loadingOptions, setLoadingOptions] = useState(true);
     const [loadingSubmit, setLoadingSubmit] = useState(false);
     const [error, setError] = useState(null);

     const form = useForm({
         defaultValues: {
             part_option_a_id: "",
             part_option_b_id: "",
             price_premium: "0.00",
        },
     });

     // Fetch options on mount
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

     // Group options for dropdowns
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
         setError(null);

        const optionAId = parseInt(values.part_option_a_id);
        const optionBId = parseInt(values.part_option_b_id);
        const premium = parseFloat(values.price_premium);

        if (!optionAId || !optionBId) {
            setError(new Error("Both options must be selected."));
            setLoadingSubmit(false);
            return;
        }

        if (optionAId === optionBId) {
            setError(new Error("Options A and B cannot be the same."));
            form.setError("part_option_b_id", { type: "manual", message: "Cannot be the same as Option A." });
            setLoadingSubmit(false);
            return;
        }
        if (isNaN(premium) || premium < 0) {
              setError(new Error("Price premium must be a valid non-negative number."));
              form.setError("price_premium", { type: "manual", message: "Must be a non-negative number (e.g., 5.00 or 0)." });
             setLoadingSubmit(false);
             return;
        }

        try {
             const dataToSend = {
                 part_option_a_id: optionAId,
                 part_option_b_id: optionBId,
                 price_premium: premium.toFixed(2), // Send as formatted string
             };
             await apiService.createPriceRule(dataToSend);
             toast.success("Price Rule Created");
             navigate('/admin/pricerules'); // Go back to list
        } catch (err) {
             console.error("Error Creating Price Rule:", err);
             setError(err);
             toast.error("Error Creating Price Rule", { description: err.message });
        } finally {
            setLoadingSubmit(false);
        }
     };

    const handleCancel = () => navigate('/admin/pricerules');

    if (loadingOptions) return <div className="p-4"><LoadingSpinner /></div>;
    if (error && allOptions.length === 0) return <ErrorMessage error={error} title="Failed to load form data" />;

    return (
         <div>
             <Button variant="outline" onClick={handleCancel} className="mb-4">
                 <ArrowLeft className="mr-2 h-4 w-4" /> Back to Price Rules
            </Button>
             <Card>
                <CardHeader><CardTitle>Add New Price Rule</CardTitle></CardHeader>
                 <CardContent>
                     {error && !loadingSubmit && <div className="pb-4"><ErrorMessage error={error} title="Operation Failed"/></div>}
                     <Form {...form}>
                         <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                             {/* Option A Select */}
                             <FormField control={form.control} name="part_option_a_id" rules={{ required: 'Please select Option A' }}
                                 render={({ field }) => ( <FormItem> <FormLabel>If Option A is selected...</FormLabel> <Select onValueChange={field.onChange} value={field.value?.toString()} disabled={loadingSubmit || loadingOptions}> <FormControl><SelectTrigger><SelectValue placeholder="Select an option" /></SelectTrigger></FormControl> <SelectContent> {Object.entries(groupedOptions).sort().map(([groupName, optionsInGroup]) => ( <SelectGroup key={groupName}> <SelectLabel>{groupName}</SelectLabel> {optionsInGroup.sort((a,b) => a.name.localeCompare(b.name)).map(option => ( <SelectItem key={option.id} value={option.id.toString()}>{option.name}</SelectItem> ))} </SelectGroup> ))} </SelectContent> </Select> <FormMessage /> </FormItem> )}
                             />
                             {/* Option B Select */}
                             <FormField control={form.control} name="part_option_b_id" rules={{ required: 'Please select Option B' }}
                                 render={({ field }) => ( <FormItem> <FormLabel>...and Option B is selected</FormLabel> <Select onValueChange={field.onChange} value={field.value?.toString()} disabled={loadingSubmit || loadingOptions}> <FormControl><SelectTrigger><SelectValue placeholder="Select an option" /></SelectTrigger></FormControl> <SelectContent> {Object.entries(groupedOptions).sort().map(([groupName, optionsInGroup]) => ( <SelectGroup key={groupName}> <SelectLabel>{groupName}</SelectLabel> {optionsInGroup.sort((a,b) => a.name.localeCompare(b.name)).map(option => ( <SelectItem key={option.id} value={option.id.toString()}>{option.name}</SelectItem> ))} </SelectGroup> ))} </SelectContent> </Select> <FormMessage /> </FormItem> )}
                             />
                              {/* Price Premium Input */}
                              <FormField control={form.control} name="price_premium" rules={{ required: 'Price premium is required', pattern: { value: /^\d+(\.\d{1,2})?$/, message: "Invalid price format (e.g., 5.00 or 0)"} }}
                                render={({ field }) => ( <FormItem> <FormLabel>Price Premium ($)</FormLabel> <FormControl> <Input type="text" inputMode="decimal" placeholder="0.00" {...field} disabled={loadingSubmit || loadingOptions} /> </FormControl> <FormDescription>Additional cost added when both Option A and B are selected.</FormDescription> <FormMessage /> </FormItem> )}
                             />

                             <div className="flex justify-end space-x-2 pt-4">
                                <Button variant="outline" type="button" onClick={handleCancel} disabled={loadingSubmit}>Cancel</Button>
                                 <Button type="submit" disabled={loadingSubmit || loadingOptions || allOptions.length === 0}> {loadingSubmit ? <LoadingSpinner className="mr-2 h-4 w-4"/> : null} Create Price Rule </Button>
                             </div>
                         </form>
                     </Form>
                 </CardContent>
            </Card>
        </div>
    );
};

export default AdminPriceRuleFormPage;