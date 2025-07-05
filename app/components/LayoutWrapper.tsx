'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import Footer from '../main/Footer';

interface SidebarContextType {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType>({
  isCollapsed: false,
  setIsCollapsed: () => {}
});

export const useSidebar = () => useContext(SidebarContext);

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="lg:ml-64 min-h-screen flex flex-col">
        <main className="flex-grow p-4 lg:p-6">{children}</main>
        <Footer />
      </div>
    );
  }

  return (
    <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed }}>
      <div 
        className={`min-h-screen flex flex-col transition-all duration-300 ease-in-out ${
          isCollapsed ? 'lg:ml-16' : 'lg:ml-64'
        }`}
      >
        <main className="flex-grow p-4 lg:p-6">{children}</main>
        <Footer />
      </div>
    </SidebarContext.Provider>
  );
} 