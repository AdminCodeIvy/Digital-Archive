
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  useEffect(() => {
    console.error('404 Error: User attempted to access non-existent route');
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <h1 className="text-6xl font-bold text-orange-500 mb-4">404</h1>
      <p className="text-xl text-gray-600 mb-6">Page not found</p>
      <p className="text-gray-500 max-w-md text-center mb-8">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Button 
        onClick={() => navigate('/')}
        className="bg-orange-500 hover:bg-orange-600"
      >
        Return to Dashboard
      </Button>
    </div>
  );
};

export default NotFound;
