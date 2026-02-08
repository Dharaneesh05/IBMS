import React, { useState } from 'react';
import { useDarkMode } from '../contexts/DarkModeContext';

const SlidePanel = ({ isOpen, onClose, type, title }) => {
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Slide Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto h-[calc(100%-4rem)] p-6">
          {type === 'filter' && <FilterContent />}
          {type === 'notification' && <NotificationContent />}
          {type === 'mail' && <MailContent />}
          {type === 'settings' && <SettingsContent />}
        </div>
      </div>
    </>
  );
};

// Filter Content Component
const FilterContent = () => {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
        <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d9488] focus:border-transparent">
          <option>All Categories</option>
          <option>Rings</option>
          <option>Necklaces</option>
          <option>Bracelets</option>
          <option>Earrings</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
        <div className="flex items-center space-x-2">
          <input
            type="number"
            placeholder="Min"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d9488] focus:border-transparent"
          />
          <span className="text-gray-500">-</span>
          <input
            type="number"
            placeholder="Max"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d9488] focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Stock Status</label>
        <div className="space-y-2">
          {['All Items', 'In Stock', 'Low Stock', 'Out of Stock'].map((status) => (
            <label key={status} className="flex items-center">
              <input type="checkbox" className="rounded border-gray-300 text-[#0d9488] focus:ring-[#0d9488]" />
              <span className="ml-2 text-sm text-gray-700">{status}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Designer</label>
        <input
          type="text"
          placeholder="Search designer"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d9488] focus:border-transparent"
        />
      </div>

      <div className="flex space-x-3 pt-4">
        <button className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
          Reset
        </button>
        <button className="flex-1 px-4 py-2 bg-[#1a1d2e] text-white rounded-lg hover:bg-gray-900 transition-colors">
          Apply Filters
        </button>
      </div>
    </div>
  );
};

// Notification Content Component
const NotificationContent = () => {
  const notifications = [
    {
      id: 1,
      type: 'success',
      title: 'New Order Received',
      message: 'Order #ORD2040 has been placed successfully',
      time: '2 minutes ago',
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      color: 'text-green-600',
      bg: 'bg-green-50'
    },
    {
      id: 2,
      type: 'warning',
      title: 'Low Stock Alert',
      message: 'Diamond Ring #DR123 is running low on stock',
      time: '1 hour ago',
      icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
      color: 'text-yellow-600',
      bg: 'bg-yellow-50'
    },
    {
      id: 3,
      type: 'info',
      title: 'Product Added',
      message: 'New product "Gold Bracelet" added to inventory',
      time: '3 hours ago',
      icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      id: 4,
      type: 'danger',
      title: 'Payment Failed',
      message: 'Order #ORD2039 payment processing failed',
      time: '5 hours ago',
      icon: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
      color: 'text-red-600',
      bg: 'bg-red-50'
    },
  ];

  return (
    <div className="space-y-4">
      {notifications.map((notification) => (
        <div key={notification.id} className={`p-4 rounded-lg ${notification.bg} border border-gray-200`}>
          <div className="flex items-start space-x-3">
            <div className={`flex-shrink-0 ${notification.color}`}>
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d={notification.icon} clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-gray-900">{notification.title}</h4>
              <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
              <p className="text-xs text-gray-500 mt-2">{notification.time}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Mail Content Component
const MailContent = () => {
  const mails = [
    {
      id: 1,
      from: 'Sarah Johnson',
      subject: 'Order Inquiry - Diamond Ring',
      preview: 'Hi, I would like to inquire about the diamond ring listed on your website...',
      time: '10:30 AM',
      unread: true,
      avatar: 'SJ'
    },
    {
      id: 2,
      from: 'Michael Chen',
      subject: 'Bulk Order Request',
      preview: 'We are interested in placing a bulk order for wedding rings. Could you please...',
      time: '9:15 AM',
      unread: true,
      avatar: 'MC'
    },
    {
      id: 3,
      from: 'Emily Roberts',
      subject: 'Product Catalog Request',
      preview: 'Can you send me the latest product catalog with pricing information?',
      time: 'Yesterday',
      unread: false,
      avatar: 'ER'
    },
    {
      id: 4,
      from: 'David Wilson',
      subject: 'Thank you for the service',
      preview: 'The necklace arrived safely and my wife loves it! Thank you for the excellent...',
      time: '2 days ago',
      unread: false,
      avatar: 'DW'
    },
  ];

  return (
    <div className="space-y-2">
      {mails.map((mail) => (
        <div
          key={mail.id}
          className={`p-4 rounded-lg border transition-colors cursor-pointer ${
            mail.unread
              ? 'bg-blue-50 border-blue-200 hover:bg-blue-100'
              : 'bg-white border-gray-200 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-[#0d9488] rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {mail.avatar}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className={`text-sm ${mail.unread ? 'font-bold' : 'font-medium'} text-gray-900 truncate`}>
                  {mail.from}
                </h4>
                <span className="text-xs text-gray-500 ml-2">{mail.time}</span>
              </div>
              <p className={`text-sm ${mail.unread ? 'font-semibold' : 'font-normal'} text-gray-700 mt-1 truncate`}>
                {mail.subject}
              </p>
              <p className="text-sm text-gray-500 mt-1 truncate">{mail.preview}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Settings Content Component
const SettingsContent = () => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  
  return (
    <div className="space-y-6">
      {/* Appearance */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Appearance</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Dark Mode</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={isDarkMode}
                onChange={toggleDarkMode}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#0d9488]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0d9488]"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Compact View</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#0d9488]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0d9488]"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Notifications</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-700">Email Notifications</p>
              <p className="text-xs text-gray-500">Receive email updates</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#0d9488]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0d9488]"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-700">Push Notifications</p>
              <p className="text-xs text-gray-500">Receive push alerts</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#0d9488]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0d9488]"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-700">Low Stock Alerts</p>
              <p className="text-xs text-gray-500">Get notified on low inventory</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#0d9488]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0d9488]"></div>
            </label>
          </div>
        </div>
      </div>

      {/* System */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">System</h3>
        <div className="space-y-2">
          <button className="w-full p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Language</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">English</span>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </button>

          <button className="w-full p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Time Zone</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">GMT+5:30</span>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </button>

          <button className="w-full p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Currency</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">INR (₹)</span>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </button>
        </div>
      </div>


    </div>
  );
};

export default SlidePanel;
