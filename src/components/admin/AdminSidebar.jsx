// src/components/admin/AdminSidebar.jsx
import React from 'react';
// Import NavLink from react-router-dom
import { NavLink, Link } from 'react-router-dom';
// Removed Button import as NavLink handles click/style wrapper
import { Separator } from "@/components/ui/separator";
import { Bike, Cog, Package, ShoppingCart, ArrowLeft, Ruler, Tag } from 'lucide-react'; // Ensure all icons are imported

// Removed navigateTo and currentPage props
const AdminSidebar = () => {
    const navItems = [
        // Use absolute paths starting from root
        { key: 'products', path: '/admin/products', label: 'Products', icon: Package },
        { key: 'restrictions', path: '/admin/restrictions', label: 'Restrictions', icon: Ruler },
        { key: 'pricerules', path: '/admin/pricerules', label: 'Price Rules', icon: Tag },
        { key: 'orders', path: '/admin/orders', label: 'Orders', icon: ShoppingCart },
        // { key: 'dashboard', path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard }, // Example
    ];

    // Define active/default styles using Tailwind classes (adjust as needed)
    // Match these with your shadcn/ui theme (primary, muted, etc.)
    const activeClassName = "bg-primary/10 text-primary dark:bg-primary/20";
    const defaultClassName = "hover:bg-muted/80 text-muted-foreground hover:text-foreground";

    return (
        <aside className="w-full md:w-60 lg:w-64 bg-muted/40 p-4 border-r flex flex-col dark:bg-background">
             {/* Link to main admin page */}
             <Link to="/admin" className="text-xl font-semibold mb-4 flex items-center px-2 hover:text-primary transition-colors">
                <Cog className="mr-2 h-5 w-5" /> Admin Panel
             </Link>
            <nav className="flex-grow space-y-1">
                 {navItems.map(item => (
                     // Use NavLink for automatic active class handling
                     <NavLink
                        key={item.key}
                        to={item.path}
                        // The `isActive` property is provided by NavLink
                        className={({ isActive }) =>
                            `flex items-center w-full justify-start px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? activeClassName : defaultClassName}`
                        }
                        // Use 'end' prop if exact match needed (e.g., "/admin" shouldn't match "/admin/products")
                        // Usually needed for the root/index link if you have one here
                    >
                        <item.icon className="mr-3 h-4 w-4" /> {item.label}
                     </NavLink>
                 ))}
            </nav>
             <div className="mt-auto">
                 <Separator className="my-2"/>
                 {/* Use Link for simple navigation back */}
                 <Link
                    to="/" // Navigate back to customer view (home)
                    // Apply default link styling
                    className={`flex items-center w-full justify-start px-3 py-2 rounded-md text-sm font-medium transition-colors ${defaultClassName}`}
                 >
                    <ArrowLeft className="mr-3 h-4 w-4" /> Back to Store
                 </Link>
            </div>
        </aside>
    );
};

export default AdminSidebar;