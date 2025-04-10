// src/components/customer/ProductCard.jsx
import React from 'react';
// Import Link from react-router-dom
import { Link } from 'react-router-dom';
import { Bike, Settings } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

// Remove onCustomizeClick prop
const ProductCard = ({ product }) => (
    <Card className="w-full max-w-sm overflow-hidden flex flex-col">
        <CardHeader>
            {/* Placeholder Image */}
            <div className="bg-gray-200 dark:bg-gray-700 aspect-video w-full flex items-center justify-center mb-4 rounded-md">
                <Bike className="w-16 h-16 text-gray-400 dark:text-gray-500" />
            </div>
            <CardTitle>{product.name}</CardTitle>
            <CardDescription className="flex-grow min-h-[60px]">{product.description}</CardDescription>
        </CardHeader>
        <CardFooter className="mt-auto pt-4 border-t">
            {/* Use Link wrapping the Button for navigation */}
             <Link to={`/product/${product.id}`} className="w-full">
                <Button className="w-full">
                     <Settings className="mr-2 h-4 w-4" /> Customize
                </Button>
             </Link>
        </CardFooter>
    </Card>
);

export default ProductCard;