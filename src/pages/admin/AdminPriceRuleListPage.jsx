// src/pages/admin/AdminPriceRuleListPage.jsx
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

const AdminPriceRuleListPage = () => {
     const [priceRules, setPriceRules] = useState([]);
     const [allOptions, setAllOptions] = useState([]);
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState(null);

     // Memoize option lookup
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
            const [ruleData, optionData] = await Promise.all([
                apiService.getPriceRules(),
                apiService.getAllPartOptions()
            ]);
             setPriceRules(ruleData || []);
             setAllOptions(optionData || []);
        } catch (err) {
            setError(err);
            console.error("Failed to fetch price rules or options:", err);
        } finally {
            setLoading(false);
        }
     }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

     const handleDelete = async (ruleId) => {
         if (!window.confirm("Are you sure you want to delete this price rule?")) return;
         try {
             await apiService.deletePriceRule(ruleId);
             toast.success("Price Rule Deleted");
             fetchData(); // Refresh list
         } catch (err) {
            console.error("Delete price rule error:", err);
            toast.error("Error Deleting Price Rule", { description: err.message });
         }
     };

     if (loading) return <div className="p-4"><LoadingSpinner /></div>;
     if (error) return <ErrorMessage error={error} title="Failed to load data"/>;

     return (
         <div>
             <div className="flex justify-between items-center mb-4">
                 <h1 className="text-2xl font-bold">Manage Price Rules</h1>
                  {/* Link to Add Form */}
                  <Link to="/admin/pricerules/new">
                     <Button disabled={loading || allOptions.length === 0}>
                         <PlusCircle className="mr-2 h-4 w-4" /> Add Price Rule
                     </Button>
                 </Link>
             </div>
             <Card>
                 <Table>
                     <TableHeader>
                         <TableRow>
                            <TableHead>If Option A is selected...</TableHead>
                            <TableHead>...and Option B is selected</TableHead>
                             <TableHead>Price Premium ($)</TableHead>
                             <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                         {priceRules.length > 0 ? priceRules.map((rule) => (
                            <TableRow key={rule.id}>
                                 <TableCell className="text-sm">{getOptionName(rule.part_option_a_id)}</TableCell>
                                 <TableCell className="text-sm">{getOptionName(rule.part_option_b_id)}</TableCell>
                                 <TableCell>{rule.price_premium != null ? parseFloat(rule.price_premium).toFixed(2) : '0.00'}</TableCell>
                                <TableCell className="text-right">
                                     <Button variant="destructive" size="sm" onClick={() => handleDelete(rule.id)}>
                                         <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                             </TableRow>
                         )) : (
                            <TableRow><TableCell colSpan={4} className="text-center h-24 text-muted-foreground">No price rules defined.</TableCell></TableRow>
                         )}
                     </TableBody>
                </Table>
             </Card>
        </div>
    );
};

export default AdminPriceRuleListPage;