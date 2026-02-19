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
      id: 'inventory',
      name: 'Inventory',
      icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4',
      submenu: [
        { name: 'Jewellery Items', path: '/products', hasQuickAdd: true, quickAddPath: '/products/new', quickAddTooltip: 'Add Item' },
        { name: 'Stock Levels', path: '/inventory/stock-levels' },
        { name: 'Low Stock Alerts', path: '/inventory/low-stock' }
      ]
    },
    {
      id: 'sales',
      name: 'Sales',
      icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z',
      submenu: [
        { name: 'Customers', path: '/sales/customers', hasQuickAdd: true, quickAddPath: '/sales/customers/new', quickAddTooltip: 'Add Customer' },
        { name: 'Sales Orders', path: '/sales/orders', hasQuickAdd: true, quickAddPath: '/sales/orders/new', quickAddTooltip: 'Create Order' },
        { name: 'Invoices', path: '/sales/invoices', hasQuickAdd: true, quickAddPath: '/sales/invoices/new', quickAddTooltip: 'Create Invoice' },
        { name: 'Sales Returns', path: '/sales/returns' }
      ]
    },
    {
      id: 'purchases',
      name: 'Purchases',
      icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z',
      submenu: [
        { name: 'Designers / Vendors', path: '/designers', hasQuickAdd: true, quickAddPath: '/designers/new', quickAddTooltip: 'Add Designer' },
        { name: 'Purchase Orders', path: '/purchases/orders', hasQuickAdd: true, quickAddPath: '/purchases/orders/new', quickAddTooltip: 'Create PO' },
        { name: 'Purchase Receives', path: '/purchases/receives' },
        { name: 'Bills', path: '/purchases/bills', hasQuickAdd: true, quickAddPath: '/purchases/bills/new', quickAddTooltip: 'Create Bill' }
      ]
    },
    {
      id: 'insights',
      name: 'Insights',
      icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
      submenu: [
        { name: 'Stock Risk Prediction (AI)', path: '/insights/stock-risk' }
      ]
    },
    {
      id: 'reports',
      name: 'Reports',
      icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
      submenu: [
        { name: 'Sales Report', path: '/reports/sales' },
        { name: 'Inventory Report', path: '/reports/inventory' }
      ]
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

  const isAnySubmenuActive = (submenu) => {
    return submenu?.some(subItem => isActive(subItem.path));
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };



  return (
    <div className={`${isCollapsed ? 'w-20 overflow-visible' : 'w-56'} bg-[#1e2139] dark:bg-gray-900 text-white h-screen fixed left-0 top-0 transition-all duration-300 ease-in-out flex flex-col z-50 shadow-xl`}>
      {/* Logo and Menu Icon Section */}
      <div className="p-3 border-b border-gray-700/30 dark:border-gray-700">
        <div className="flex items-center justify-between">
          {!isCollapsed ? (
            <>
              <h1 className="text-base font-semibold text-center flex-1">IBMS</h1>
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-1.5 hover:bg-[#0d9488]/20 transition-colors rounded-md"
                title="Collapse Sidebar"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="flex items-center justify-center w-full p-1.5 hover:bg-[#0d9488]/20 transition-colors rounded-md"
              title="Expand Sidebar"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className={`flex-1 py-3 ${isCollapsed ? 'overflow-visible' : 'overflow-y-auto'}`}>
        <div className={isCollapsed ? '' : ''}>
          <ul className={`space-y-0.5 ${isCollapsed ? 'px-1' : 'px-2'}`}>{menuStructure.map((item) => (
              <li key={item.id}>
                {/* Single Menu Item (No Submenu) */}
                {item.single ? (
                  <div className="relative group">
                    <Link
                      to={item.path}
                      className={`flex ${isCollapsed ? 'flex-col items-center py-3' : 'flex-row items-center space-x-3 py-2.5'} px-3 transition-all duration-200 rounded-lg ${
                        isActive(item.path)
                          ? 'bg-[#0d9488] text-white font-medium shadow-sm'
                          : 'text-gray-400 hover:bg-[#0d9488] hover:text-white'
                      }`}
                      title={isCollapsed ? item.name : ''}
                    >
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
                      </svg>
                      {isCollapsed ? (
                        <span className="text-[10px] mt-1 font-medium text-center w-full overflow-hidden text-ellipsis whitespace-nowrap">{item.name}</span>
                      ) : (
                        <span className="text-sm font-medium">{item.name}</span>
                      )}
                    </Link>
                    
                  </div>
                ) : (
                  /* Expandable Menu Item */
                  <div className="relative group">
                    <button
                      onClick={() => toggleSection(item.id)}
                      className={`w-full flex ${isCollapsed ? 'flex-col items-center py-3' : 'flex-row items-center justify-between py-2.5'} px-3 transition-all duration-200 rounded-lg ${
                        isAnySubmenuActive(item.submenu)
                          ? 'bg-[#0d9488] text-white font-medium shadow-sm'
                          : 'text-gray-400 hover:bg-[#0d9488] hover:text-white'
                      }`}
                      title={isCollapsed ? item.name : ''}
                    >
                      <div className={`flex ${isCollapsed ? 'flex-col items-center' : 'flex-row items-center space-x-3'}`}>
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
                        </svg>
                        {isCollapsed ? (
                          <span className="text-[10px] mt-1 font-medium text-center w-full overflow-hidden text-ellipsis whitespace-nowrap">{item.name}</span>
                        ) : (
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
                      <div className="absolute left-full top-0 ml-1 hidden group-hover:block z-[999]">
                        <div className="bg-[#2a2d42] dark:bg-gray-800 rounded-lg shadow-xl py-2.5 px-0 min-w-[240px] border border-gray-700/30 dark:border-gray-600">
                          <div className="text-[10px] font-bold text-gray-400 mb-2 px-3 uppercase tracking-wider">
                            {item.name}
                          </div>
                          <ul className="space-y-0">
                            {item.submenu.map((subItem, idx) => (
                              <li key={idx} className="relative group/item">
                                <Link
                                  to={subItem.path}
                                  className={`flex items-center justify-between px-3 py-2.5 text-sm transition-colors duration-150 ${
                                    isActive(subItem.path)
                                      ? 'bg-[#0d9488] text-white font-medium'
                                      : 'text-gray-300 hover:bg-[#0d9488] hover:text-white'
                                  }`}
                                >
                                  <span className="text-[13px]">{subItem.name}</span>
                                  {/* Quick Add Button - Show only on hover */}
                                  {subItem.hasQuickAdd && (
                                    <Link
                                      to={subItem.quickAddPath}
                                      className="opacity-0 group-hover/item:opacity-100 flex items-center justify-center text-gray-400 hover:text-white transition-opacity duration-150"
                                      title={subItem.quickAddTooltip}
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                                      </svg>
                                    </Link>
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
                      <div className="mt-1 ml-2 mr-2">
                        <ul className="space-y-0.5">
                          {item.submenu.map((subItem, idx) => (
                            <li key={idx} className="relative group/subitem">
                              <Link
                                to={subItem.path}
                                className={`flex items-center justify-between px-4 py-2 text-sm transition-all duration-150 rounded-md ${
                                  isActive(subItem.path)
                                    ? 'bg-[#0d9488] text-white font-medium'
                                    : 'text-gray-400 hover:bg-[#0d9488] hover:text-white'
                                }`}
                              >
                                <span>{subItem.name}</span>
                                {/* Quick Add Button - Show only on hover */}
                                {subItem.hasQuickAdd && (
                                  <Link
                                    to={subItem.quickAddPath}
                                    className="opacity-0 group-hover/subitem:opacity-100 flex items-center justify-center text-gray-400 hover:text-white transition-opacity duration-150"
                                    title={subItem.quickAddTooltip}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
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


