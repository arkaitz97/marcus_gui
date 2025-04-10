// src/pages/admin/AdminOrderDetailPage.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Import router hooks
import { apiService } from '@/services/api';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { toast } from "sonner"; // Import sonner
import { ArrowLeft, RefreshCw } from 'lucide-react';

const AdminOrderDetailPage = () => {
    const { orderId } = useParams(); // Get orderId from URL
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [allOptions, setAllOptions] = useState([]); // To map option IDs to names
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [newStatus, setNewStatus] = useState('');

     // Memoize option lookup
     const optionMap = useMemo(() => {
         const map = new Map();
         allOptions.forEach(opt => map.set(opt.id, opt));
         return map;
     }, [allOptions]);

     const getOptionDetails = useCallback((optionId) => {
        const option = optionMap.get(optionId);
        return option ? `${option.product_name || '?'} / ${option.part_name || '?'} / ${option.name || '?'}` : `Option ID: ${optionId} (Not Found)`;
     }, [optionMap]);


    const fetchData = useCallback(async () => {
        if (!orderId) {
            setError(new Error("Order ID is missing"));
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            // Fetch order details AND all part options in parallel
            const [orderData, optionData] = await Promise.all([
                 apiService.getOrder(orderId),
                 apiService.getAllPartOptions() // Reuse helper
            ]);

            if (!orderData) throw new Error("Order not found"); // Handle case where order API returns null/undefined

            setOrder(orderData);
            setAllOptions(optionData || []);
            setNewStatus(orderData?.status || ''); // Initialize status dropdown
        } catch (err) {
            setError(err);
             console.error("Failed to fetch order details or options:", err);
             // Show toast only if orderData likely failed, not just options
             if (!order) toast.error("Error Loading Order", {description: err.message});
        } finally {
            setLoading(false);
        }
    }, [orderId]); // Removed 'order' from dependency array to avoid potential loop

    useEffect(() => {
        fetchData();
    }, [fetchData]); // Fetch data when component mounts or fetchData changes

    const handleStatusUpdate = async () => {
         if (!newStatus || !order || newStatus === order.status) return;
        setUpdatingStatus(true);
        try {
            await apiService.updateOrder(orderId, { status: newStatus });
             toast.success("Order Status Updated", { description: `Status changed to ${newStatus}`});
             // Update local state immediately for better UX
             setOrder(prev => (prev ? { ...prev, status: newStatus } : null));
             // No need to re-fetch unless other data might change based on status
        } catch (err) {
            console.error("Error updating status:", err);
             toast.error("Error Updating Status", { description: err.message });
        } finally {
            setUpdatingStatus(false);
        }
     };

     // Define possible order statuses
     const orderStatuses = ["Pending", "Processing", "Shipped", "Completed", "Cancelled"];

      const getStatusBadge = (status) => {
         const baseClass = "ml-2 px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap";
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
     // If fetch failed AND order is still null, show error
     if (error && !order) return <ErrorMessage error={error} title="Failed to load order details"/>;
     // If order just isn't found after loading
     if (!order) return <p className="text-center text-gray-500 p-4">Order #{orderId} not found.</p>;


    return (
        <div>
            {/* Back button using navigate */}
            <Button variant="outline" onClick={() => navigate('/admin/orders')} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Orders
            </Button>
            <h1 className="text-2xl font-bold mb-1">Order Details</h1>
             <p className="text-muted-foreground mb-4 font-mono">ID: #{order.id}</p>


             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 {/* Order Info Card */}
                 <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Customer & Order Information</CardTitle>
                    </CardHeader>
                     <CardContent className="space-y-3 text-sm">
                        <div><strong>Customer:</strong> {order.customer_name || '-'}</div>
                        <div><strong>Email:</strong> {order.customer_email || '-'}</div>
                        <div><strong>Order Date:</strong> {order.created_at ? new Date(order.created_at).toLocaleString() : '-'}</div>
                        <div><strong>Total Price:</strong> ${order.total_price != null ? parseFloat(order.total_price).toFixed(2) : 'N/A'}</div>
                         <Separator className="my-4" />
                         <h3 className="font-semibold text-base mb-2">Selected Options:</h3>
                          {/* Check both possible structures for selected options */}
                         {(order.selected_part_options && order.selected_part_options.length > 0) || (order.selected_part_option_ids && order.selected_part_option_ids.length > 0) ? (
                             <ul className="list-disc list-inside space-y-1 pl-4">
                                 {(order.selected_part_options || order.selected_part_option_ids).map((opt, index) => (
                                     // If 'opt' is an object with id, use opt.id, otherwise assume opt *is* the ID
                                     <li key={opt.id || opt || index}>
                                         {getOptionDetails(opt.id || opt)}
                                     </li>
                                 ))}
                             </ul>
                         ) : (
                             <p className="text-muted-foreground">No option details available for this order.</p>
                         )}
                     </CardContent>
                 </Card>

                 {/* Status Update Card */}
                 <Card className="lg:col-span-1">
                     <CardHeader>
                         <CardTitle>Order Status</CardTitle>
                     </CardHeader>
                     <CardContent className="space-y-4">
                        <div className="flex items-center flex-wrap"> {/* Added flex-wrap */}
                             <span className="font-medium mr-2">Current Status:</span>
                             <span className={getStatusBadge(order.status)}>{order.status || 'N/A'}</span>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="orderStatus">Update Status</Label>
                             <Select
                                value={newStatus}
                                onValueChange={setNewStatus}
                                disabled={updatingStatus}
                            >
                                 <SelectTrigger id="orderStatus"><SelectValue placeholder="Select new status" /></SelectTrigger>
                                <SelectContent>
                                     {orderStatuses.map(status => ( <SelectItem key={status} value={status}>{status}</SelectItem> ))}
                                </SelectContent>
                            </Select>
                         </div>
                        <Button
                             onClick={handleStatusUpdate}
                             disabled={updatingStatus || !newStatus || newStatus === order.status}
                             className="w-full"
                        >
                            {updatingStatus ? <LoadingSpinner className="mr-2 h-4 w-4" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                            Update Status
                        </Button>
                     </CardContent>
                 </Card>
            </div>
         </div>
    );
};

export default AdminOrderDetailPage;