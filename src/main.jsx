// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // Import BrowserRouter
import App from './App.jsx';
import './index.css';
// Import the Toaster component from the shadcn/ui location
import { Toaster } from "@/components/ui/sonner";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter> {/* Wrap App with BrowserRouter */}
      <App />
      {/* Render the Sonner Toaster component */}
      <Toaster richColors position="top-right" />
    </BrowserRouter>
  </React.StrictMode>,
);