// src/pages/admin/AdminRestrictionListPage.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom'; // Import Link
import { apiService } from '@/services/api';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from "sonner"; // Import sonner
import { PlusCircle, Trash2 } from 'lucide-react';

const AdminRestrictionListPage = () => {
    const [restrictions, setRestrictions] = useState([]);
    const [allOptions, setAllOptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Memoize option lookup for performance
     const optionMap = useMemo(() => {
         const map = new Map();
         allOptions.forEach(opt => map.set(opt.id, opt));
         return map;
     }, [allOptions]);

     const getOptionName = useCallback((optionId) => {
         const option = optionMap.get(optionId);
         return option ? `${option.product_name || '?'} / ${option.part_name || '?'} / ${option.name || '?'}` : `Option ID: ${optionId} (Not Found)`;
     }, [optionMap]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Fetch in parallel
            const [restrictionData, optionData] = await Promise.all([
                apiService.getPartRestrictions(),
                apiService.getAllPartOptions() // Fetch all options to map IDs to names
            ]);
            setRestrictions(restrictionData || []);
            setAllOptions(optionData || []);
        } catch (err) {
            setError(err);
            console.error("Failed to fetch restrictions or options:", err)
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleDelete = async (restrictionId) => {
        if (!window.confirm("Are you sure you want to delete this restriction?")) return;
        try {
            await apiService.deletePartRestriction(restrictionId);
            toast.success("Restriction Deleted");
            fetchData(); // Refresh list
        } catch (err) {
             console.error("Delete restriction error:", err);
            toast.error("Error Deleting Restriction", { description: err.message });
        }
    };

     if (loading) return <div className="p-4"><LoadingSpinner /></div>;
     if (error) return <ErrorMessage error={error} title="Failed to load data"/>;

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Manage Part Restrictions</h1>
                 {/* Link to Add Form */}
                 <Link to="/admin/restrictions/new">
                     {/* Disable button if options haven't loaded yet for the form */}
                     <Button disabled={loading || allOptions.length === 0}>
                         <PlusCircle className="mr-2 h-4 w-4" /> Add Restriction
                     </Button>
                 </Link>
            </div>
             <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>When This Option is Selected...</TableHead>
                            <TableHead>This Option is Restricted</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                         {restrictions.length > 0 ? restrictions.map((res) => (
                            <TableRow key={res.id}>
                                <TableCell className="text-sm">{getOptionName(res.part_option_id)}</TableCell>
                                <TableCell className="text-sm">{getOptionName(res.restricted_part_option_id)}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="destructive" size="sm" onClick={() => handleDelete(res.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                         )) : (
                            <TableRow><TableCell colSpan={3} className="text-center h-24 text-muted-foreground">No restrictions defined.</TableCell></TableRow>
                         )}
                     </TableBody>
                </Table>
            </Card>
        </div>
    );
};

export default AdminRestrictionListPage;