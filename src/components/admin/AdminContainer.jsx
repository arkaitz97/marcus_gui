import React from 'react';

const AdminContainer = ({ children }) => (
    <div className="flex-grow p-4 md:p-6 lg:p-8 bg-background overflow-auto">
        {children}
    </div>
);

export default AdminContainer;