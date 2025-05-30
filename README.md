# Marcus's Bike Shop - Vue 3 Frontend

This repository contains the frontend application for Marcus's Bike Shop, built with Vue 3 and Vite. It provides an interface for customers to browse, customize, and order bicycles online, as well as an administrative interface for managing products, options, rules, and orders.

## Features

**Customer Facing:**

* **Product Listing:** Displays available bicycle products.  
* **Product Detail & Customization:**  
    * Shows detailed product information.  
    * Allows selection of parts and options.  
    * Placeholder for dynamic validation of selected options based on backend rules.  
    * Placeholder for real-time price calculation based on selected options and backend rules.  
    * Out-of-stock options are disabled.  
* **Shopping Cart:** Users can add multiple configured bikes to a cart before placing orders.  
* **Order Placement:** Users can place orders for the items in their cart (currently places one order per cart item via API).

**Admin Facing (`/admin`):**

* **Dashboard:** Basic landing page for the admin section.  
* **Product Management:** CRUD interface for Products.  
* **Part Management:** CRUD interface for Parts associated with a Product.  
* **Part Option Management:** CRUD interface for Part Options associated with a Part (includes inline editing).  
* **Restriction Management:** Interface to list, add, and delete incompatible pairs of Part Options.  
* **Price Rule Management:** Interface to list, add, and delete price premiums for specific pairs of Part Options.  
* **Order Management:** List view for all orders and a detail view to inspect individual orders and update their status.

## Technology Stack

* **Framework:** [Vue 3](https://vuejs.org/) (Composition API with `<script setup>`)  
* **Build Tool:** [Vite](https://vitejs.dev/)  
* **Routing:** [Vue Router](https://router.vuejs.org/)  
* **State Management:** [Pinia](https://pinia.vuejs.org/)  
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)  
* **API Client:** [Axios](https://axios-http.com/)  
* **Icons:** [Lucide Vue Next](https://lucide.dev/)

## Project Setup and Running

**Prerequisites:**

* [Node.js](https://nodejs.org/) (includes npm) - Version 18+ recommended.  
* A running instance of the corresponding backend API server.

**Installation:**

1.  **Clone the repository (if applicable):**  
    ```bash  
    git clone https://github.com/arkaitz97/marcus_gui
    cd marcus_gui  
    ```  

2.  **Install Dependencies (if not starting from scratch):**  
    ```bash  
    npm install  
    ```

**Configuration:**

1.  **API Base URL:** The API base URL is configured in `src/services/apiService.js` (currently set to `/api/v1`).  

**Running the Development Server:**

```bash  
npm run dev
```

This will start the Vite development server, typically available at http://localhost:5173 (or the next available port).  
**Building for Production:**  
```bash
npm run build
```

This command bundles the application into the dist directory, optimized for deployment. The build process includes minification, which removes comments and whitespace.

## **API Specification**

The frontend interacts with a backend API, expected to be available under the configured base URL (/api/v1). Key endpoints include:

* /products, /products/:id (CRUD for Products)  
* /products/:productId/parts, /products/:productId/parts/:partId (CRUD for Parts)  
* /products/:productId/parts/:partId/part_options, /products/:productId/parts/:partId/part_options/:optionId (CRUD for Options)  
* /part_restrictions, /part_restrictions/:id (CRUD for Restrictions)  
* /price_rules, /price_rules/:id (CRUD for Price Rules)  
* /orders, /orders/:id (CRUD for Orders)  
* /product_configuration/validate_selection (POST)  
* /product_configuration/calculate_price (POST)

*(Refer to src/services/apiService.js for details on how the frontend calls these endpoints).*

## **Potential Improvements / Future Work**

This application provides a solid foundation. Here are areas for future development:

* **Dynamic Validation/Pricing:** Fully implement the dynamic option disabling and real-time price updates based on the /validate_selection and /calculate_price API responses.  
* **UI/UX Refinements:** Improve loading states (skeletons), add toast notifications, enhance form validation, improve accessibility, use confirmation modals, and polish styling.  
* **Admin Enhancements:**  
  * Implement user-friendly selectors (dropdowns/search) instead of ID inputs for rules.  
  * Display option/part names instead of IDs where appropriate (may require API changes or caching).  
  * Add pagination, search, and filtering to admin lists.  
  * Enhance the admin dashboard with useful widgets.  
* **Customer Feature Enhancements:** Add user accounts, saved configurations, product search/filtering, visual customization previews.  
* **Cart Persistence:** Use localStorage or sessionStorage to make the cart persist across browser sessions.  
* **Testing:** Implement unit, integration, and/or end-to-end tests.  
* **TypeScript:** Convert the codebase to TypeScript for better maintainability.
