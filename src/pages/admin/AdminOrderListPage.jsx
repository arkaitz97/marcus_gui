// src/pages/admin/AdminOrderListPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom'; // Import Link
import { apiService } from '@/services/api';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from "sonner"; // Import sonner
import { Eye, Trash2 } from 'lucide-react'; // Import Eye icon

const AdminOrderListPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await apiService.getOrders();
             // Sort orders by date, newest first (ensure created_at exists or handle undefined)
             const sortedData = (data || []).sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
            setOrders(sortedData);
        } catch (err) {
            setError(err);
             console.error("Failed to fetch orders:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Delete function (use with caution - consider status update 'Cancelled' instead)
    const handleDelete = async (orderId) => {
        if (!window.confirm("Are you sure you want to DELETE this order? This is permanent.")) return;
        try {
             await apiService.deleteOrder(orderId);
             toast.success("Order Deleted Permanently");
             fetchData(); // Refresh list
        } catch (err) {
             console.error("Delete order error:", err);
             toast.error("Error Deleting Order", { description: err.message });
        }
    };

     const getStatusBadge = (status) => {
        const baseClass = "px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap";
        switch (status?.toLowerCase()) {
            case 'pending': return `${baseClass} bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300`;
            case 'processing': return `${baseClass} bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300`;
            case 'shipped': return `${baseClass} bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300`;
            case 'completed': return `${baseClass} bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300`;
            case 'cancelled': return `${baseClass} bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300`;
            default: return `${baseClass} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300`;
        }
     };

    if (loading) return <div className="p-4"><LoadingSpinner /></div>;
    if (error) return <ErrorMessage error={error} title="Failed to load orders"/>;

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                 <h1 className="text-2xl font-bold">Manage Orders</h1>
            </div>
            <Card>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Total ($)</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                     </TableHeader>
                     <TableBody>
                         {orders.length > 0 ? orders.map((order) => (
                            <TableRow key={order.id}>
                                <TableCell className="font-mono">#{order.id}</TableCell>
                                <TableCell>{order.customer_name}</TableCell>
                                <TableCell className="text-muted-foreground">{order.customer_email}</TableCell>
                                <TableCell>{new Date(order.created_at || Date.now()).toLocaleDateString()}</TableCell>
                                <TableCell><span className={getStatusBadge(order.status)}>{order.status || 'N/A'}</span></TableCell>
                                <TableCell>{order.total_price != null ? parseFloat(order.total_price).toFixed(2) : 'N/A'}</TableCell>
                                <TableCell className="text-right space-x-1">
                                    {/* Link to Order Detail Page */}
                                    <Link to={`/admin/orders/${order.id}`}>
                                         <Button variant="outline" size="sm"><Eye className="mr-1 h-3 w-3"/> View</Button>
                                    </Link>
                                     {/* Optional: Delete button */}
                                     {/* <Button variant="destructive" size="sm" onClick={() => handleDelete(order.id)} title="Delete Permanently"> <Trash2 className="h-4 w-4" /> </Button> */}
                                </TableCell>
                            </TableRow>
                        )) : (
                             <TableRow><TableCell colSpan={7} className="text-center h-24 text-muted-foreground">No orders found.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
             </Card>
        </div>
    );
};
export default AdminOrderListPage;