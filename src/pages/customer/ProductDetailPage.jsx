// src/pages/customer/ProductDetailPage.jsx
import React, { useState, useEffect } from 'react';
// Import hooks and Link from react-router-dom
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCustomizationStore } from '@/store/customizationStore';
import { apiService } from '@/services/api';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner"; // Using Sonner
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Bike, ShoppingCart, CheckCircle, AlertTriangle, ArrowLeft } from 'lucide-react';

// Removed productId and navigateTo props
const ProductDetailPage = () => {
    const { productId } = useParams(); // Get productId from URL parameter
    const navigate = useNavigate(); // Hook for programmatic navigation
    const {
        product, setProduct, selectedOptions, setSelectedOption,
        totalPrice, isValidConfiguration, validationErrors,
        isLoadingPrice, isLoadingValidation, resetCustomization,
        isFullyConfigured
    } = useCustomizationStore();

    // --- Local State ---
    const [loadingProduct, setLoadingProduct] = useState(true);
    const [errorProduct, setErrorProduct] = useState(null);
    const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
    const [orderError, setOrderError] = useState(null);
    const [showOrderDialog, setShowOrderDialog] = useState(false);
    const [customerName, setCustomerName] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');

    // --- Effects ---
    useEffect(() => {
        // Reset store on mount/productId change
        resetCustomization();
        const fetchProductDetails = async () => {
             if (!productId) {
                 console.error("Product ID missing from URL");
                 setErrorProduct(new Error("Product ID is missing"));
                 setLoadingProduct(false);
                 return;
             }
             setLoadingProduct(true);
             setErrorProduct(null);
             try {
                 // Fetch product using productId from useParams
                 const productData = await apiService.getProduct(productId);
                 if (productData && productData.parts) {
                     // Fetch options for parts if not included
                     const partsWithOptions = await Promise.all(productData.parts.map(async (part) => {
                         if (!part.part_options) {
                             try {
                                part.part_options = await apiService.getPartOptions(productId, part.id);
                             } catch(optErr) {
                                 console.error(`Failed to fetch options for part ${part.id}`, optErr);
                                 part.part_options = [];
                             }
                         }
                         return part;
                     }));
                     productData.parts = partsWithOptions;
                 }
                 setProduct(productData); // Update the store
             } catch (err) {
                 console.error("Failed to fetch product details:", err);
                 setErrorProduct(err);
                 setProduct(null); // Clear store product on error
             } finally {
                 setLoadingProduct(false);
             }
        };
        fetchProductDetails();
    }, [productId, setProduct, resetCustomization]); // Use productId from useParams

    // --- Handlers ---
    const handleSelectionChange = (partId, optionId) => {
        setSelectedOption(partId, parseInt(optionId));
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
         if (!customerName || !customerEmail) {
             toast.error("Missing Information", { description: "Please enter your name and email." });
             setOrderError("Please enter your name and email."); // Keep local error state if needed
             return;
         }
         if (!isValidConfiguration || !isFullyConfigured()) {
              const errorMsg = "Please ensure your bike configuration is complete and valid.";
              setOrderError(errorMsg);
              toast.error("Invalid Configuration", { description: errorMsg });
              return;
         }
         setIsSubmittingOrder(true);
         setOrderError(null);
         const orderData = {
             customer_name: customerName,
             customer_email: customerEmail,
             selected_part_option_ids: Object.values(selectedOptions),
         };
         try {
             const createdOrder = await apiService.createOrder(orderData);
             setShowOrderDialog(false);
             toast.success("Order Placed!", {
                 description: `Your order #${createdOrder.id} has been placed successfully. Total: $${createdOrder.total_price}`
             });
              resetCustomization();
              navigate('/'); // Use navigate to go home
         } catch (err) {
             const errorMsg = err.message || "Could not place your order. Please try again.";
             setOrderError(`Failed to place order: ${errorMsg}`);
             toast.error("Order Failed", { description: errorMsg });
         } finally {
             setIsSubmittingOrder(false);
         }
    };

    // --- Render Logic ---
    if (loadingProduct) return <div className="flex justify-center items-center p-8 min-h-[400px]"><LoadingSpinner className="w-12 h-12"/></div>;
    if (errorProduct) return <div className="container mx-auto p-4"><ErrorMessage error={errorProduct} title="Failed to load product details" /></div>;
    if (!product) return <div className="container mx-auto p-4 text-center text-gray-500">Product data not available.</div>;

     const fullyConfigured = isFullyConfigured();

    // --- JSX ---
    return (
        <div className="container mx-auto p-4 md:p-6">
            {/* Use Link for Back button */}
            <Link to="/" className="inline-block mb-4">
                 <Button variant="outline">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Products
                </Button>
            </Link>

            <Card>
                 <CardHeader>
                     <div className="bg-gray-200 dark:bg-gray-700 aspect-video w-full flex items-center justify-center mb-4 rounded-md">
                         <Bike className="w-24 h-24 text-gray-400 dark:text-gray-500" />
                     </div>
                     <CardTitle className="text-3xl">{product.name}</CardTitle>
                     <CardDescription>{product.description}</CardDescription>
                 </CardHeader>
                 <CardContent>
                      <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Customize Your Bike</h2>
                      {!product.parts || product.parts.length === 0 ? ( <p>No customization options available...</p> ) : (
                         <div className="space-y-6">
                             {product.parts.map((part) => (
                                 <div key={part.id} className="border p-4 rounded-md shadow-sm">
                                     <h3 className="text-lg font-medium mb-3">{part.name}</h3>
                                     {part.part_options && part.part_options.length > 0 ? (
                                         <RadioGroup value={selectedOptions[part.id]?.toString()} onValueChange={(value) => handleSelectionChange(part.id, value)} className="space-y-2">
                                             {part.part_options.map((option) => (
                                                 <div key={option.id} className={`flex items-center space-x-3 p-3 rounded border ${selectedOptions[part.id] === option.id ? 'border-primary bg-primary/10' : 'border-border'} ${!option.in_stock ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                                      <RadioGroupItem value={option.id.toString()} id={`option-${option.id}`} disabled={!option.in_stock}/>
                                                     <Label htmlFor={`option-${option.id}`} className={`flex-grow ${!option.in_stock ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                                                         {option.name}
                                                         {option.price && parseFloat(option.price) > 0 && ( <span className="text-sm text-muted-foreground ml-2">(+${option.price})</span> )}
                                                          {!option.in_stock && ( <span className="text-sm text-destructive ml-2 font-semibold">[Out of Stock]</span> )}
                                                     </Label>
                                                 </div>
                                             ))}
                                         </RadioGroup>
                                     ) : ( <p className="text-sm text-muted-foreground">No options...</p> )}
                                 </div>
                             ))}
                         </div>
                     )}
                 </CardContent>
                 <CardFooter className="flex flex-col items-start space-y-4 pt-4 border-t">
                      {/* Validation Errors */}
                      {!isLoadingValidation && !isValidConfiguration && validationErrors.length > 0 && ( <Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertTitle>Config Issue</AlertTitle><AlertDescription><ul className="list-disc list-inside">{validationErrors.map((err, index) => <li key={index}>{err}</li>)}</ul></AlertDescription></Alert> )}
                       {isLoadingValidation && <div className="flex items-center space-x-2 text-sm text-muted-foreground"><LoadingSpinner className="w-4 h-4"/><p>Validating...</p></div>}
                     {/* Price Display */}
                     <div className="text-2xl font-bold flex items-center space-x-2 w-full justify-end">
                         <span>Total Price:</span>
                         {isLoadingPrice ? <LoadingSpinner className="w-5 h-5" /> : totalPrice !== null ? <span>${totalPrice}</span> : fullyConfigured ? <span className="text-muted-foreground">Calculating...</span> : <span className="text-muted-foreground text-lg">Select all options</span>}
                     </div>
                     <Separator />
                     {/* Order Button and Dialog */}
                     <Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
                         <DialogTrigger asChild>
                             <Button size="lg" className="w-full" disabled={!fullyConfigured || !isValidConfiguration || isLoadingPrice || isLoadingValidation || isSubmittingOrder}> <ShoppingCart className="mr-2 h-5 w-5" /> Add to Order </Button>
                         </DialogTrigger>
                         <DialogContent>
                             <DialogHeader><DialogTitle>Complete Your Order</DialogTitle><DialogDescription>Enter details for "{product.name}". Total: ${totalPrice}</DialogDescription></DialogHeader>
                             {/* Form uses updated handlePlaceOrder */}
                             <form onSubmit={handlePlaceOrder} className="space-y-4 pt-4">
                                 <div><Label htmlFor="customerName">Name</Label><Input id="customerName" value={customerName} onChange={(e) => setCustomerName(e.target.value)} required placeholder="Your Name" disabled={isSubmittingOrder}/></div>
                                 <div><Label htmlFor="customerEmail">Email</Label><Input id="customerEmail" type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} required placeholder="your@email.com" disabled={isSubmittingOrder}/></div>
                                 {orderError && <ErrorMessage error={orderError} />}
                                 <DialogFooter className="pt-4">
                                     <DialogClose asChild><Button variant="outline" disabled={isSubmittingOrder}>Cancel</Button></DialogClose>
                                     <Button type="submit" disabled={isSubmittingOrder || !customerName || !customerEmail || !isValidConfiguration}>{isSubmittingOrder ? <LoadingSpinner className="mr-2 h-4 w-4" /> : <CheckCircle className="mr-2 h-4 w-4" />}Confirm Order</Button>
                                 </DialogFooter>
                             </form>
                         </DialogContent>
                     </Dialog>
                 </CardFooter>
             </Card>
         </div>
    );
};

export default ProductDetailPage;