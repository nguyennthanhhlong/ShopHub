import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { 
  LayoutDashboard, Package, Tags, Users, ShoppingCart, 
  Settings, Search, Bell, Menu, LogOut, Ticket, 
  MessageSquare, Moon, Sun, ShieldCheck
} from 'lucide-react';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  // Initialize Dark Mode based on system preference or localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('adminTheme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('adminTheme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('adminTheme', 'dark');
      setIsDarkMode(true);
    }
  };

  // If no token, redirect to login immediately
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Products', href: '/products', icon: Package },
    { name: 'Categories', href: '/categories', icon: Tags },
    { name: 'Orders', href: '/orders', icon: ShoppingCart },
    { name: 'Coupons', href: '/coupons', icon: Ticket },
    { name: 'Users', href: '/users', icon: Users },
    { name: 'Banners & Content', href: '/banners', icon: Settings },
    { name: 'Testimonials', href: '/testimonials', icon: MessageSquare },
    { name: 'Reviews', href: '/reviews', icon: MessageSquare },
  ];

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 font-sans text-slate-900 dark:text-slate-100 overflow-hidden transition-colors duration-300">
      
      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-30
        flex flex-col bg-slate-900 dark:bg-slate-950 text-slate-300 
        transition-all duration-300 shadow-2xl md:shadow-none
        border-r border-slate-800
        ${sidebarOpen ? 'w-72 translate-x-0' : 'w-72 -translate-x-full md:w-20 md:translate-x-0'}
      `}>
        
        {/* Brand Logo */}
        <div className="h-20 flex items-center justify-center border-b border-slate-800/60 font-bold text-xl tracking-wider text-white">
          <Link to="/" className="flex items-center gap-3">
            <div className={`
              bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20
              ${sidebarOpen ? 'w-10 h-10' : 'w-12 h-12'}
              transition-all duration-300
            `}>
              <ShieldCheck size={sidebarOpen ? 24 : 28} className="mt-0.5" />
            </div>
            <span className={`transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'md:opacity-0 md:hidden'}`}>
              SHOPHUB
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-hide">
          <div className={`mb-4 transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'md:opacity-0 md:hidden'}`}>
            <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Management</p>
          </div>
          
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href || (location.pathname.startsWith(item.href) && item.href !== '/');
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`
                  group flex items-center space-x-3 py-3 px-4 rounded-xl transition-all duration-300 relative
                  ${isActive 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' 
                    : 'hover:bg-slate-800 hover:text-white'}
                  ${!sidebarOpen && 'md:justify-center md:px-0'}
                `}
                title={!sidebarOpen ? item.name : ""}
              >
                <Icon size={22} className={`transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'}`} />
                <span className={`font-medium transition-opacity duration-300 whitespace-nowrap ${sidebarOpen ? 'opacity-100' : 'md:opacity-0 md:hidden'}`}>
                  {item.name}
                </span>
                
                {/* Active Indicator Strip */}
                {isActive && sidebarOpen && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-white rounded-r-full"></div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-slate-800/60 space-y-2">
          {/* <button 
            onClick={toggleTheme} 
            className={`
              w-full flex items-center space-x-3 py-3 px-4 rounded-xl transition-all duration-300 text-slate-400 hover:bg-slate-800 hover:text-white
              ${!sidebarOpen && 'md:justify-center md:px-0'}
            `}
            title="Toggle Theme"
          >
            {isDarkMode ? <Sun size={22} className="text-amber-400" /> : <Moon size={22} />}
            <span className={`font-medium transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'md:opacity-0 md:hidden'}`}>
              {isDarkMode ? 'Light Mode' : 'Dark Mode'}
            </span>
          </button> */}

          <button 
            onClick={handleLogout} 
            className={`
              w-full flex items-center space-x-3 py-3 px-4 rounded-xl transition-all duration-300 text-red-400 hover:bg-red-500/10 hover:text-red-300
              ${!sidebarOpen && 'md:justify-center md:px-0'}
            `}
            title="Logout"
          >
            <LogOut size={22} />
            <span className={`font-medium transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'md:opacity-0 md:hidden'}`}>
              Logout
            </span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-20 md:hidden transition-opacity" 
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        {/* Top Header (Glassmorphism) */}
        <header className="h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-6 z-10 sticky top-0 transition-colors duration-300">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)} 
              className="text-slate-500 dark:text-slate-400 focus:outline-none hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 p-2.5 rounded-xl transition-all"
            >
              <Menu size={24} />
            </button>

            {/* Global Search */}
            {/* <div className="relative hidden lg:block group">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-500 text-slate-400">
                <Search size={18} />
              </span> */}
              {/* <input 
                className="w-80 bg-slate-100 dark:bg-slate-800 border-transparent dark:border-slate-700 rounded-xl pl-11 pr-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-500" 
                type="text" 
                placeholder="Search resources, orders, users..." 
              /> */}
            {/* </div> */}
          </div>
          
          {/* Header Right Actions */}
          {/* <div className="flex items-center space-x-3 sm:space-x-5">
            <button className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 relative p-2.5 rounded-xl hover:bg-blue-50 dark:hover:bg-slate-800 transition-all">
              <Bell size={22} />
              <span className="absolute top-2 right-2 h-2.5 w-2.5 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse"></span>
            </button>
            
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20 cursor-pointer border-2 border-white dark:border-slate-800 ring-2 ring-transparent hover:ring-blue-500/50 hover:-translate-y-0.5 transition-all">
              AD
            </div>
          </div> */}
        </header>

        {/* Main View Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50/50 dark:bg-slate-900/50 p-4 sm:p-6 md:p-8 scroll-smooth transition-colors duration-300">
          <div className="max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
