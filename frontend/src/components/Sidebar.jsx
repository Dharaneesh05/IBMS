import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  HiHome, 
  HiCube, 
  HiReceiptTax, 
  HiShoppingCart, 
  HiChartBar,
  HiChevronDown,
  HiChevronLeft,
  HiMenu,
  HiPlus,
  HiCog
} from 'react-icons/hi';
import { RiBox3Line } from 'react-icons/ri';
import { TbPackages } from 'react-icons/tb';
import { BsBoxSeam } from 'react-icons/bs';

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedSections, setExpandedSections] = useState([]);

  const menuStructure = [
    {
      id: 'home',
      name: 'Dashboard',
      icon: HiHome,
      path: '/dashboard',
      single: true
    },
    {
      id: 'inventory',
      name: 'Inventory',
      icon: BsBoxSeam,
      submenu: [
        { name: 'Products', path: '/products', hasQuickAdd: true, quickAddPath: '/products/new', quickAddTooltip: 'Add Product' },
        { name: 'Designers', path: '/designers', hasQuickAdd: true, quickAddPath: '/designers/new', quickAddTooltip: 'Add Designer' },
        { name: 'Stock Overview', path: '/inventory/stock-levels' }
      ]
    },
    {
      id: 'sales',
      name: 'Sales',
      icon: HiReceiptTax,
      submenu: [
        { name: 'Invoices', path: '/sales/invoices', hasQuickAdd: true, quickAddPath: '/sales/invoices/new', quickAddTooltip: 'Create Invoice' },
        { name: 'Customers', path: '/customers', hasQuickAdd: true, quickAddPath: '/customers/new', quickAddTooltip: 'Add Customer' }
      ]
    },
    {
      id: 'purchases',
      name: 'Purchases',
      icon: HiShoppingCart,
      submenu: [
        { name: 'Vendors', path: '/vendors', hasQuickAdd: true, quickAddPath: '/vendors/new', quickAddTooltip: 'Add Vendor' },
        { name: 'Purchase Orders', path: '/purchase-orders', hasQuickAdd: true, quickAddPath: '/purchase-orders/new', quickAddTooltip: 'Create PO' }
      ]
    },
    {
      id: 'services',
      name: 'Services',
      icon: HiCog,
      submenu: [
        { name: 'Repair Orders', path: '/services/repair-orders', hasQuickAdd: true, quickAddPath: '/services/repair-orders/new', quickAddTooltip: 'New Repair Order' }
      ]
    },
    {
      id: 'reports', 
      name: 'Reports',
      icon: HiChartBar,
      path: '/reports',
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
        : [sectionId]  // Only one open at a time
    );
  };



  return (
    <div className={`${isCollapsed ? 'w-20 overflow-visible' : 'w-56'} bg-[#1F3A2E] dark:bg-gray-900 text-white h-screen fixed left-0 top-0 transition-all duration-300 ease-in-out flex flex-col z-50 shadow-xl`}>
      {/* Logo and Menu Icon Section */}
      <div className="p-3 border-b border-gray-700/30 dark:border-gray-700">
        <div className="flex items-center justify-between">
          {!isCollapsed ? (
            <>
              <h1 className="text-sm font-bold text-center flex-1 leading-tight" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', letterSpacing: '0.2px' }}>Shanmuga<br/>Jewellers</h1>
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-1.5 hover:bg-[#D4AF37]/20 transition-colors rounded-md"
                title="Collapse Sidebar"
              >
                <HiChevronLeft className="w-5 h-5" />
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="flex items-center justify-center w-full p-1.5 hover:bg-[#D4AF37]/20 transition-colors rounded-md"
              title="Expand Sidebar"
            >
              <HiMenu className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className={`flex-1 py-3 ${isCollapsed ? 'overflow-visible' : 'overflow-y-auto'} flex flex-col justify-between`}>
        <div className={isCollapsed ? '' : ''}>
          <ul className={`${isCollapsed ? 'space-y-0.5 px-1' : 'space-y-2 px-2'}`}>{menuStructure.map((item) => (
              <li key={item.id}>
                {/* Single Menu Item (No Submenu) */}
                {item.single ? (
                  <div className="relative group">
                    <Link
                      to={item.path}
                      className={`flex ${isCollapsed ? 'flex-col items-center py-3' : 'flex-row items-center space-x-3 py-3'} px-4 transition-all duration-200 rounded-lg ${
                        isActive(item.path)
                          ? 'text-white font-medium shadow-sm'
                          : 'text-gray-300 hover:text-white'
                      }`}
                      style={isActive(item.path) ? { background: '#D4AF37' } : {}}
                      onMouseEnter={e => { if (!isActive(item.path)) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                      onMouseLeave={e => { if (!isActive(item.path)) e.currentTarget.style.background = ''; }}
                      title={isCollapsed ? item.name : ''}
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
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
                      className={`w-full flex ${isCollapsed ? 'flex-col items-center py-3' : 'flex-row items-center justify-between py-3'} px-4 transition-all duration-200 rounded-lg ${
                        isAnySubmenuActive(item.submenu)
                          ? 'text-white font-medium shadow-sm'
                          : 'text-gray-300 hover:text-white'
                      }`}
                      style={isAnySubmenuActive(item.submenu) ? { background: '#D4AF37' } : {}}
                      onMouseEnter={e => { if (!isAnySubmenuActive(item.submenu)) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                      onMouseLeave={e => { if (!isAnySubmenuActive(item.submenu)) e.currentTarget.style.background = ''; }}
                      title={isCollapsed ? item.name : ''}
                    >
                      <div className={`flex ${isCollapsed ? 'flex-col items-center' : 'flex-row items-center space-x-3'}`}>
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        {isCollapsed ? (
                          <span className="text-[10px] mt-1 font-medium text-center w-full overflow-hidden text-ellipsis whitespace-nowrap">{item.name}</span>
                        ) : (
                          <span className="text-sm font-medium">{item.name}</span>
                        )}
                      </div>
                      {!isCollapsed && (
                        <HiChevronDown
                          className={`w-4 h-4 transition-transform duration-200 ${
                            expandedSections.includes(item.id) ? 'rotate-180' : ''
                          }`}
                        />
                      )}
                    </button>

                    {/* Hover Popup for Collapsed Sidebar */}
                    {isCollapsed && (
                      <div className="absolute left-full top-0 ml-1 hidden group-hover:block z-[999]">
                        <div className="bg-[#162d22] dark:bg-gray-800 rounded-lg shadow-xl py-2.5 px-0 min-w-[240px] border border-[#D4AF37]/30 dark:border-gray-600">
                          <div className="text-[10px] font-bold text-gray-400 mb-2 px-3 uppercase tracking-wider">
                            {item.name}
                          </div>
                          <ul className="space-y-0">
                            {item.submenu.map((subItem, idx) => (
                              <li key={idx} className="relative group/item">
                                <Link
                                  to={subItem.path}
                                  style={isActive(subItem.path) ? { background: '#D4AF37' } : {}}
                                  className={`flex items-center justify-between px-3 py-2.5 text-sm transition-colors duration-150 ${
                                    isActive(subItem.path)
                                      ? 'text-white font-medium'
                                      : 'text-gray-300 hover:text-white'
                                  }`}
                                >
                                  <span className="text-[13px]">{subItem.name}</span>
                                  {/* Quick Add Button - Show only on hover */}
                                  {subItem.hasQuickAdd && (
                                    <button
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        navigate(subItem.quickAddPath);
                                      }}
                                      className="opacity-0 group-hover/item:opacity-100 flex items-center justify-center text-gray-400 hover:text-white transition-opacity duration-150"
                                      title={subItem.quickAddTooltip}
                                    >
                                      <HiPlus className="w-4 h-4" />
                                    </button>
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
                                style={isActive(subItem.path) ? { background: '#D4AF37' } : {}}
                              className={`flex items-center justify-between px-4 py-2.5 text-sm transition-all duration-150 rounded-md ${
                                  isActive(subItem.path)
                                    ? 'text-white font-medium'
                                    : 'text-gray-400 hover:text-white'
                                }`}
                              >
                                <span>{subItem.name}</span>
                                {/* Quick Add Button - Show only on hover */}
                                {subItem.hasQuickAdd && (
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      navigate(subItem.quickAddPath);
                                    }}
                                    className="opacity-0 group-hover/subitem:opacity-100 flex items-center justify-center text-gray-400 hover:text-white transition-opacity duration-150"
                                    title={subItem.quickAddTooltip}
                                  >
                                    <HiPlus className="w-4 h-4" />
                                  </button>
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

        {/* Bottom Brand Footer - pinned to bottom of nav */}
        <div className={`mt-4 pt-3 border-t border-[#D4AF37]/20 ${isCollapsed ? 'px-1 pb-3' : 'px-3 pb-3'}`}>
          {!isCollapsed ? (
            <p className="text-[10px] text-gray-500 text-center tracking-wide">
              Shanmuga Jewellers &copy; 2025
            </p>
          ) : (
            <p className="text-[10px] text-gray-500 text-center font-bold">SJ</p>
          )}
        </div>
      </nav>

    </div>
  );
};

export default Sidebar;


