import React, { createContext, useState, useContext } from 'react';

const FilterContext = createContext();

export const useFilter = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilter must be used within FilterProvider');
  }
  return context;
};

export const FilterProvider = ({ children }) => {
  const [filters, setFilters] = useState({
    category: 'all',
    minPrice: '',
    maxPrice: '',
    stockStatus: {
      all: true,
      inStock: false,
      lowStock: false,
      outOfStock: false
    },
    designer: ''
  });

  const [isFilterApplied, setIsFilterApplied] = useState(false);

  const updateFilter = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const updateStockStatus = (status) => {
    setFilters(prev => ({
      ...prev,
      stockStatus: {
        ...prev.stockStatus,
        [status]: !prev.stockStatus[status]
      }
    }));
  };

  const applyFilters = () => {
    setIsFilterApplied(true);
    // You can add additional logic here
  };

  const resetFilters = () => {
    setFilters({
      category: 'all',
      minPrice: '',
      maxPrice: '',
      stockStatus: {
        all: true,
        inStock: false,
        lowStock: false,
        outOfStock: false
      },
      designer: ''
    });
    setIsFilterApplied(false);
  };

  const getFilteredProducts = (products) => {
    if (!isFilterApplied) return products;

    return products.filter(product => {
      // Category filter
      if (filters.category !== 'all' && product.category !== filters.category) {
        return false;
      }

      // Price filter
      if (filters.minPrice && product.price < parseFloat(filters.minPrice)) {
        return false;
      }
      if (filters.maxPrice && product.price > parseFloat(filters.maxPrice)) {
        return false;
      }

      // Stock status filter
      const { all, inStock, lowStock, outOfStock } = filters.stockStatus;
      if (!all) {
        // If no specific status is selected when 'all' is off, show nothing
        if (!inStock && !lowStock && !outOfStock) return false;
        
        // Check if product matches any of the selected statuses (OR logic)
        const matchesStatus = 
          (inStock && product.stock > 10) ||
          (lowStock && product.stock > 0 && product.stock <= 10) ||
          (outOfStock && product.stock === 0);
        
        if (!matchesStatus) return false;
      }

      // Designer filter
      if (filters.designer && !product.designer?.toLowerCase().includes(filters.designer.toLowerCase())) {
        return false;
      }

      return true;
    });
  };

  return (
    <FilterContext.Provider value={{ 
      filters, 
      updateFilter, 
      updateStockStatus,
      applyFilters, 
      resetFilters, 
      getFilteredProducts,
      isFilterApplied 
    }}>
      {children}
    </FilterContext.Provider>
  );
};
