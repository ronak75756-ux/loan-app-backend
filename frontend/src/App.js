import React, { useState } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Reports from './pages/Reports';

import CustomerDetails from './pages/CustomerDetails';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'customers':
        return <Customers onCustomerClick={(id) => setCurrentPage(`customer/${id}`)} />;
      case 'reports':
        return <Reports />;
      default:
        // Handle dynamic routes manually since this is a simple custom router
        if (currentPage.startsWith('customer/')) {
          const customerId = currentPage.split('/')[1];
          return <CustomerDetails customerId={customerId} onBack={() => setCurrentPage('customers')} />;
        }
        return <Dashboard />;
    }
  };

  return (
    <div className="App">
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
      {renderPage()}
    </div>
  );
}

export default App;
