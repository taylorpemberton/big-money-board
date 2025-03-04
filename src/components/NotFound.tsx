import React from 'react';

interface NotFoundProps {
  theme?: string;
}

const NotFound: React.FC<NotFoundProps> = ({ theme = 'default' }) => {
  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-white">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
        <p className="text-2xl text-gray-600 mb-8">Page Not Found</p>
        <p className="text-gray-500 mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <a 
          href="/" 
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Go Home
        </a>
      </div>
    </div>
  );
};

export default NotFound; 