import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState([]);

  const menuStructure = [
    {
      id: 'home',
      name: 'Home',
      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
      path: '/dashboard',
      single: true
    },
    {
      id: 'items',
      name: 'Items',
      icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
      submenu: [
        { name: 'Items List', path: '/products', hasQuickAdd: true, quickAddPath: '/products/new', quickAddTooltip: 'Add Item' },
        { name: 'Add Item', path: '/products/new' }
      ]
    },
    {
      id: 'inventory',
      name: 'Inventory',
      icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4',
      submenu: [
        { name: 'Inventory Adjustments', path: '/inventory/adjustments', hasQuickAdd: true, quickAddPath: '/inventory/adjustments/new', quickAddTooltip: 'New Adjustment' },
        { name: 'Stock Overview', path: '/inventory/overview' },
        { name: 'Packages', path: '/inventory/packages' },
        { name: 'Shipments', path: '/inventory/shipments' }
      ]
    },
    {
      id: 'sales',
      name: 'Sales',
      icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z',
      submenu: [
        { name: 'Customers', path: '/designers' },
        { name: 'Sales Orders', path: '/sales/orders', hasQuickAdd: true, quickAddPath: '/sales/orders/new', quickAddTooltip: 'Create Order' },
        { name: 'Invoices', path: '/sales/invoices' },
        { name: 'Payments Received', path: '/sales/payments' },
        { name: 'Sales Returns', path: '/sales/returns' }
      ]
    },
    {
      id: 'purchases',
      name: 'Purchases',
      icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z',
      submenu: [
        { name: 'Vendors', path: '/purchases/vendors' },
        { name: 'Purchase Orders', path: '/purchases/orders', hasQuickAdd: true, quickAddPath: '/purchases/orders/new', quickAddTooltip: 'Create PO' },
        { name: 'Purchase Receives', path: '/purchases/receives' },
        { name: 'Bills', path: '/purchases/bills' }
      ]
    },
    {
      id: 'reports',
      name: 'Reports',
      icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
      path: '/reports',
      single: true
    },
    {
      id: 'documents',
      name: 'Documents',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      path: '/documents',
      single: true
    }
  ];

  const isActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === path;
    }
    
    // For exact path matching (like /products/new), we need exact match
    if (path.includes('/new') || path.includes('/edit') || 
        path.includes('/adjustments') || path.includes('/orders') || 
        path.includes('/bills') || path.includes('/receives')) {
      return location.pathname === path;
    }
    
    // For base paths like /products, only match if not in a sub-route that has its own menu item
    if (path === '/products') {
      return location.pathname === '/products' || 
             (location.pathname.startsWith('/products') && 
              !location.pathname.includes('/new') && 
              !location.pathname.includes('/edit'));
    }
    
    return location.pathname.startsWith(path);
  };

  // Auto-expand sections when current path matches a submenu item
  useEffect(() => {
    const shouldExpandSections = [];
    
    menuStructure.forEach(item => {
      if (item.submenu) {
        const hasActiveSubmenu = item.submenu.some(subItem => isActive(subItem.path));
        if (hasActiveSubmenu) {
          shouldExpandSections.push(item.id);
        }
      }
    });

    setExpandedSections(prev => {
      // Only update if there are new sections to expand
      const newSections = [...new Set([...prev, ...shouldExpandSections])];
      return newSections.length !== prev.length ? newSections : prev;
    });
  }, [location.pathname]);

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };



  return (
    <div className={`${isCollapsed ? 'w-20 overflow-visible' : 'w-64'} bg-[#1a1d2e] dark:bg-gray-900 text-white h-screen fixed left-0 top-0 transition-all duration-300 ease-in-out flex flex-col z-50 shadow-xl`}>
      {/* Logo and Menu Icon Section */}
      <div className="p-4 border-b border-gray-700/30 dark:border-gray-700">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <h1 className="text-lg font-semibold">IBMS</h1>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-gray-800/50 transition-colors rounded-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2"/>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v18"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className={`flex-1 py-4 ${isCollapsed ? 'overflow-visible' : 'overflow-y-auto'}`}>
        <div className={isCollapsed ? '' : ''}>
          <ul className="space-y-1 px-3">{menuStructure.map((item) => (
              <li key={item.id}>
                {/* Single Menu Item (No Submenu) */}
                {item.single ? (
                  <div className="relative group">
                    <Link
                      to={item.path}
                      className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} px-3 py-3 transition-all duration-200 rounded ${
                        isActive(item.path)
                          ? 'bg-[#0d9488] text-white font-medium shadow-sm'
                          : 'text-gray-400 hover:bg-gray-800/50 dark:hover:bg-gray-700/50 hover:text-white'
                      }`}
                      title={isCollapsed ? item.name : ''}
                    >
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
                      </svg>
                      {!isCollapsed && (
                        <span className="text-sm">{item.name}</span>
                      )}
                    </Link>
                    
                    {/* Hover Tooltip for Collapsed Sidebar */}
                    {isCollapsed && (
                      <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 hidden group-hover:block z-[999]">
                        <div className="bg-[#2c3142] dark:bg-gray-800 rounded-md shadow-lg py-2 px-3 whitespace-nowrap border border-gray-700/20 dark:border-gray-600">
                          <span className="text-[13px] text-white font-medium">{item.name}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Expandable Menu Item */
                  <div className="relative group">
                    <button
                      onClick={() => toggleSection(item.id)}
                      className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-3 py-3 transition-all duration-200 rounded ${
                        expandedSections.includes(item.id)
                          ? 'text-white bg-gray-800/50 dark:bg-gray-700/50'
                          : 'text-gray-400 hover:bg-gray-800/50 dark:hover:bg-gray-700/50 hover:text-white'
                      }`}
                      title={isCollapsed ? item.name : ''}
                    >
                      <div className={`flex items-center ${isCollapsed ? '' : 'space-x-3'}`}>
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
                        </svg>
                        {!isCollapsed && (
                          <span className="text-sm font-medium">{item.name}</span>
                        )}
                      </div>
                      {!isCollapsed && (
                        <svg
                          className={`w-4 h-4 transition-transform duration-200 ${
                            expandedSections.includes(item.id) ? 'rotate-180' : ''
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </button>

                    {/* Hover Popup for Collapsed Sidebar */}
                    {isCollapsed && (
                      <div className="absolute left-full top-0 ml-3 hidden group-hover:block z-[999]">
                        <div className="bg-[#2c3142] dark:bg-gray-800 rounded-md shadow-lg py-2 px-0 min-w-[180px] border border-gray-700/20 dark:border-gray-600">
                          <div className="text-[10px] font-bold text-gray-400 mb-1.5 px-3 uppercase tracking-wider">
                            {item.name}
                          </div>
                          <ul className="space-y-0">
                            {item.submenu.map((subItem, idx) => (
                              <li key={idx}>
                                <Link
                                  to={subItem.path}
                                  className={`flex items-center justify-between px-3 py-2 text-sm transition-colors duration-150 ${
                                    isActive(subItem.path)
                                      ? 'bg-blue-500 text-white font-medium'
                                      : 'text-gray-300 hover:bg-gray-700/70 hover:text-white'
                                  }`}
                                >
                                  <span className="text-[13px]">{subItem.name}</span>
                                  {subItem.hasQuickAdd && (
                                    <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                                    </svg>
                                  )}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    {/* Submenu */}
                    {!isCollapsed && expandedSections.includes(item.id) && (
                      <div className="mt-2 mx-3 bg-[#252a3d] dark:bg-gray-800 rounded-lg p-2">
                        <ul className="space-y-0.5">
                          {item.submenu.map((subItem, idx) => (
                            <li key={idx} className="relative group">
                              <Link
                                to={subItem.path}
                                className={`flex items-center justify-between px-3 py-2.5 text-sm transition-all duration-200 rounded ${
                                  isActive(subItem.path)
                                    ? 'bg-[#0d9488] text-white font-medium shadow-sm'
                                    : 'text-gray-300 hover:bg-gray-600/50 dark:hover:bg-gray-700/50 hover:text-white'
                                }`}
                              >
                                <span>{subItem.name}</span>
                                {/* Quick Add Button - Show only on hover */}
                                {subItem.hasQuickAdd && (
                                  <Link
                                    to={subItem.quickAddPath}
                                    className="opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center bg-gray-700 hover:bg-gray-600 text-gray-400 hover:text-white rounded transition-all duration-200"
                                    title={subItem.quickAddTooltip}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                    </svg>
                                  </Link>
                                )}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>


      </nav>


    </div>
  );
};

export default Sidebar;
