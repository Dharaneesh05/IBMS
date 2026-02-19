import React from 'react';
import { useSocket } from '../contexts/SocketContext';

const ConnectionStatus = () => {
  const { connected } = useSocket();

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <div
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full shadow-lg ${
          connected
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
        }`}
      >
        <span
          className={`w-2 h-2 rounded-full ${
            connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
          }`}
        ></span>
        <span
          className={`text-xs font-medium ${
            connected
              ? 'text-green-700 dark:text-green-300'
              : 'text-red-700 dark:text-red-300'
          }`}
        >
          {connected ? 'Live Updates Active' : 'Disconnected'}
        </span>
      </div>
    </div>
  );
};

export default ConnectionStatus;
