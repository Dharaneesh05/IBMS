import React, { createContext, useState, useContext, useEffect } from 'react';

const ActivityContext = createContext();

export const useActivity = () => {
  const context = useContext(ActivityContext);
  if (!context) {
    throw new Error('useActivity must be used within ActivityProvider');
  }
  return context;
};

export const ActivityProvider = ({ children }) => {
  const [activities, setActivities] = useState(() => {
    const saved = localStorage.getItem('recentActivities');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('recentActivities', JSON.stringify(activities.slice(0, 50))); // Keep last 50
  }, [activities]);

  const addActivity = (type, title, details) => {
    const newActivity = {
      id: Date.now(),
      type, // 'create', 'update', 'delete'
      title,
      details,
      user: 'Dharaneesh C', // You can make this dynamic later
      timestamp: new Date().toISOString(),
      icon: type === 'create' ? 'add' : type === 'update' ? 'edit' : 'delete'
    };
    
    setActivities(prev => [newActivity, ...prev]);
  };

  const clearActivities = () => {
    setActivities([]);
    localStorage.removeItem('recentActivities');
  };

  return (
    <ActivityContext.Provider value={{ activities, addActivity, clearActivities }}>
      {children}
    </ActivityContext.Provider>
  );
};
