import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Components
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import ProductList from './components/products/ProductList';
import ProductShow from './components/products/ProductShow';
import ProductNew from './components/products/ProductNew';
import ProductEdit from './components/products/ProductEdit';
import ProductType from './components/products/ProductType';
import DesignerList from './components/designers/DesignerList';
import DesignerShow from './components/designers/DesignerShow';
import DesignerNew from './components/designers/DesignerNew';
import DesignerEdit from './components/designers/DesignerEdit';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <div className="container">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* Product Routes */}
            <Route path="/products" element={<ProductList />} />
            <Route path="/products/new" element={<ProductNew />} />
            <Route path="/products/:id" element={<ProductShow />} />
            <Route path="/products/:id/edit" element={<ProductEdit />} />
            <Route path="/products/type/:type" element={<ProductType />} />
            
            {/* Designer Routes */}
            <Route path="/designers" element={<DesignerList />} />
            <Route path="/designers/new" element={<DesignerNew />} />
            <Route path="/designers/:id" element={<DesignerShow />} />
            <Route path="/designers/:id/edit" element={<DesignerEdit />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
