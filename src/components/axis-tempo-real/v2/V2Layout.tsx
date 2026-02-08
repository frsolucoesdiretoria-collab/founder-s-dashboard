// AXIS TEMPO REAL V2 — Layout Component (STUB)
// V2.5 will implement here

import React from 'react';

interface V2LayoutProps {
  children: React.ReactNode;
}

const V2Layout: React.FC<V2LayoutProps> = ({ children }) => {
  return (
    <div className="relative w-full bg-white">
      {children}
    </div>
  );
};

export default V2Layout;
