import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Stethoscope, Building2, Pill, 
  TestTube, FileText, LogOut, Activity, Menu, X, Sun, Moon, Bot
} from 'lucide-react';
import { Button } from './UI';

interface SidebarItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  dark?: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ to, icon, label, active, dark }) => (
  <Link
    to={to}
    className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
      active
        ? dark ? 'bg-emerald-900/40 text-emerald-400 font-medium' : 'bg-emerald-50 text-emerald-600 font-medium'
        : dark ? 'text-slate-400 hover:bg-slate-700 hover:text-white' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
    }`}
  >
    {icon}
    <span>{label}</span>
  </Link>
);

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isDark, setIsDark] = React.useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  const role = localStorage.getItem('role') || 'PATIENT';
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  React.useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(prev => !prev);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const profileRoute = {
    ADMIN:   '/admin/profile',
    DOCTOR:  '/doctor/profile',
    PATIENT: '/patient/profile',
  }[role] || '/';

  const menuItems = {
    ADMIN: [
      { to: '/admin/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
      { to: '/admin/clinics',   icon: <Building2 size={20} />,       label: 'Clinics' },
      { to: '/admin/doctors',   icon: <Stethoscope size={20} />,     label: 'Doctors' },
      { to: '/admin/patients',  icon: <Users size={20} />,           label: 'Patients' },
      { to: '/admin/admins',    icon: <Users size={20} />,           label: 'Admins' },
    ],
    DOCTOR: [
      { to: '/doctor/dashboard',     icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
      { to: '/doctor/clinics',       icon: <Building2 size={20} />,       label: 'Clinics' },
      { to: '/doctor/patients',      icon: <Users size={20} />,           label: 'My Patients' },
      { to: '/doctor/prescriptions', icon: <FileText size={20} />,        label: 'Prescriptions' },
      { to: '/doctor/medicines',     icon: <Pill size={20} />,            label: 'Medicines' },
      { to: '/doctor/tests',         icon: <TestTube size={20} />,        label: 'Medical Tests' },
    ],
    PATIENT: [
      { to: '/patient/dashboard',     icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
      { to: '/patient/clinics',       icon: <Building2 size={20} />,       label: 'Clinics' },
      { to: '/patient/doctors',       icon: <Stethoscope size={20} />,     label: 'My Doctors' },
      { to: '/patient/prescriptions', icon: <FileText size={20} />,        label: 'My Prescriptions' },
      { to: '/patient/tests',         icon: <TestTube size={20} />,        label: 'My Tests' },
    ],
  };

  const currentMenuItems = menuItems[role as keyof typeof menuItems] || [];
  const displayName = user.username || user.name || user.fullName || role;
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  const sidebarBg    = isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200';
  const mainBg       = isDark ? 'bg-slate-900' : 'bg-slate-50';
  const logoText     = isDark ? 'text-white' : 'text-slate-900';
  const dividerColor = isDark ? 'border-slate-700' : 'border-slate-100';
  const mobileBg     = isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200';
  const mobileText   = isDark ? 'text-white' : 'text-slate-900';

  const ThemeToggle = () => (
    <button
      onClick={toggleTheme}
      className={`flex items-center justify-between w-full px-4 py-3 rounded-xl transition-all duration-200 mb-1 ${
        isDark
          ? 'text-slate-400 hover:bg-slate-700 hover:text-white'
          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
      }`}
    >
      <div className="flex items-center space-x-3">
        {isDark ? <Sun size={20} /> : <Moon size={20} />}
        <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
      </div>
      <div className={`w-10 h-5 rounded-full transition-colors duration-300 flex items-center px-0.5 ${
        isDark ? 'bg-emerald-500' : 'bg-slate-300'
      }`}>
        <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform duration-300 ${
          isDark ? 'translate-x-5' : 'translate-x-0'
        }`} />
      </div>
    </button>
  );

  return (
    <div className={`min-h-screen ${mainBg} transition-colors duration-300`}>

      {/* Sidebar Desktop */}
      <aside className={`hidden md:flex flex-col fixed top-0 left-0 h-screen w-64 ${sidebarBg} border-r p-6 z-30 transition-colors duration-300`}>
        <div className="flex items-center space-x-3 mb-10 px-2">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
            <Activity className="text-white w-6 h-6" />
          </div>
          <span className={`text-xl font-bold ${logoText}`}>HealthCare</span>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto">
          {currentMenuItems.map((item) => (
            <SidebarItem
              key={item.to}
              to={item.to}
              icon={item.icon}
              label={item.label}
              active={location.pathname === item.to}
              dark={isDark}
            />
          ))}
        </nav>

        <div className={`pt-4 border-t ${dividerColor}`}>
          {/* Theme toggle */}
          <ThemeToggle />

          {/* Profile */}
          <button
            onClick={() => navigate(profileRoute)}
            className={`w-full flex items-center space-x-3 px-2 mb-3 rounded-xl py-2 transition-all duration-200 group ${
              location.pathname === profileRoute
                ? isDark ? 'bg-emerald-900/40' : 'bg-emerald-50'
                : isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-50'
            }`}
          >
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
              <span className="text-sm font-bold text-emerald-700">{initials}</span>
            </div>
            <div className="flex-1 overflow-hidden text-left">
              <p className={`text-sm font-medium truncate group-hover:text-emerald-600 transition-colors ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
                {displayName}
              </p>
              <p className={`text-xs truncate ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{role}</p>
            </div>
          </button>

          {/* AI Assistant Button */}
          <Button
            variant="ghost"
            className="w-full justify-start text-violet-500 hover:bg-violet-500/10 hover:text-violet-400 mb-1"
            onClick={() => navigate('/AI')}
          >
            <Bot size={20} className="mr-3" />
            AI Assistant
          </Button>

          {/* Logout */}
          <Button
            variant="ghost"
            className="w-full justify-start text-red-500 hover:bg-red-500/10 hover:text-red-400"
            onClick={handleLogout}
          >
            <LogOut size={20} className="mr-3" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className={`md:hidden fixed top-0 left-0 right-0 ${mobileBg} border-b z-50 px-4 py-3 flex items-center justify-between transition-colors duration-300`}>
        <div className="flex items-center space-x-2">
          <Activity className="text-emerald-600 w-6 h-6" />
          <span className={`font-bold ${mobileText}`}>HealthCare</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={toggleTheme} className={`p-1.5 rounded-lg transition ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}>
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className={mobileText}>
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className={`md:hidden fixed inset-0 ${mobileBg} z-40 pt-16 p-6 transition-colors duration-300`}>
          <nav className="space-y-2">
            {currentMenuItems.map((item) => (
              <SidebarItem
                key={item.to}
                to={item.to}
                icon={item.icon}
                label={item.label}
                active={location.pathname === item.to}
                dark={isDark}
              />
            ))}

            <button
              onClick={() => { navigate(profileRoute); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isDark ? 'text-slate-400 hover:bg-slate-700 hover:text-white' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="w-7 h-7 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-emerald-700">{initials}</span>
              </div>
              <span>My Profile</span>
            </button>

            {/* AI Assistant Button */}
            <Button
              variant="ghost"
              className="w-full justify-start text-violet-500 hover:bg-violet-500/10 hover:text-violet-400"
              onClick={() => { navigate('/AI'); setIsMobileMenuOpen(false); }}
            >
              <Bot size={20} className="mr-3" />
              AI Assistant
            </Button>

            {/* Logout */}
            <Button
              variant="ghost"
              className="w-full justify-start text-red-500 mt-2"
              onClick={handleLogout}
            >
              <LogOut size={20} className="mr-3" />
              Logout
            </Button>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="md:ml-64 p-4 md:p-8 pt-20 md:pt-8 min-h-screen transition-colors duration-300">
        {children}
      </main>

    </div>
  );
};