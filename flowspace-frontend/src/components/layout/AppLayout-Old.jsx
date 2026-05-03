import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useAuth } from '../../hooks/useAuth';

export default function AppLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    setNotificationCount(3);
  }, []);

  const handleSearch = (query) => {
    console.log('Searching for:', query);
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="flex h-screen bg-white">
      <Sidebar 
        isCollapsed={isSidebarCollapsed}
        onToggle={toggleSidebar}
      />
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarCollapsed ? 'ml-0' : ''}`}>
        <Topbar 
          title="FlowSpace"
          onSearch={handleSearch}
          notificationCount={notificationCount}
        />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
