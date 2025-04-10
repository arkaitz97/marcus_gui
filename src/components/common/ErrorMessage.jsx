import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const ErrorMessage = ({ error, title = "Error" }) => {
    if (!error) return null;
    const message = error instanceof Error ? error.message : (typeof error === 'string' ? error : "An unknown error occurred.");
    return (
        <Alert variant="destructive" className="my-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>{title}</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
        </Alert>
    );
};

export default ErrorMessage;