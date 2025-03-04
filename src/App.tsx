import React from 'react';
import { Events } from './components/Events';
import NotFound from './components/NotFound';
import './App.css';

function App() {
  // Simple route handling without react-router-dom
  const path = window.location.pathname;
  
  // Function to determine which component to render based on the path
  const getComponentForPath = () => {
    switch (path) {
      case '/':
      case '/index.html':
        return <Events />;
      default:
        // For any undefined route, show the 404 page
        return <NotFound />;
    }
  };

  return (
    <div className="App">
      {getComponentForPath()}
    </div>
  );
}

export default App; 