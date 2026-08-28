import React from 'react';

export const BuzzAlertBanner: React.FC<{ message?: string }> = ({ message }) => {
  if (!message) return null;
  return (
    <div className="bg-orange-500 text-white text-xs font-medium py-2 px-4 text-center">
      {message}
    </div>
  );
};
