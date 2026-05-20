import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronDown, LogOut, User, LayoutDashboard } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const navLinks = [
  { to: '/',            label: '🏆 Tournaments' },
  { to: '/analysis',   label: '🔬 Analysis' },
  { to: '/calculator', label: '📊 Rating Calc' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const { user, logout, isAdmin } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); setDropOpen(false); };

  return (
    <nav className="sticky top-0 z-50 glass border-b border-cm-border" style={{ height: 'var(--nav-h, 62px)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center gap-2">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 mr-6 flex-shrink-0">
          <span className="text-2xl leading-none">♟</span>
          <span className="font-serif text-xl font-bold text-cm-text">
            Chess<span className="text-cm-accent">Mate</span>
          </span>
        </Link>

        {/* Desktop nav tabs */}
        <div className="hidden md:flex items-center gap-1 flex-1">
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'text-cm-accent bg-cm-accent/10'
                    : 'text-cm-muted hover:text-cm-text hover:bg-white/5'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
          {isAdmin() && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive ? 'text-cm-accent bg-cm-accent/10' : 'text-cm-muted hover:text-cm-text hover:bg-white/5'
                }`
              }
            >
              ⚙️ Admin
            </NavLink>
          )}
        </div>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-2 ml-auto">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropOpen(!dropOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-cm-border hover:border-cm-accent text-sm font-medium transition-all"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cm-accent to-cm-accent-d flex items-center justify-center text-white text-xs font-bold">
                  {user.name.slice(0, 2).toUpperCase()}
                </div>
                <span className="text-cm-text">{user.name.split(' ')[0]}</span>
                <ChevronDown size={14} className="text-cm-muted" />
              </button>
              {dropOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-cm-card border border-cm-border rounded-xl shadow-2xl overflow-hidden z-50 animate-fade-in">
                  <div className="p-3 border-b border-cm-border">
                    <p className="text-sm font-medium text-cm-text">{user.name}</p>
                    <p className="text-xs text-cm-muted">{user.email}</p>
                  </div>
                  <div className="p-1">
                    <button
                      onClick={() => { navigate('/player/arjunkumar'); setDropOpen(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-cm-text hover:bg-white/5 transition-colors"
                    >
                      <User size={14} /> My Profile
                    </button>
                    {isAdmin() && (
                      <button
                        onClick={() => { navigate('/admin'); setDropOpen(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-cm-text hover:bg-white/5 transition-colors"
                      >
                        <LayoutDashboard size={14} /> Admin Panel
                      </button>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-400/10 transition-colors"
                    >
                      <LogOut size={14} /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 rounded-lg border border-cm-border text-sm font-medium text-cm-text hover:border-cm-accent hover:text-cm-accent transition-all"
              >
                Sign In
              </Link>
              <Link
                to="/login?tab=register"
                className="px-4 py-2 rounded-lg bg-cm-accent text-white text-sm font-medium hover:bg-cm-accent-l transition-all"
              >
                Register Free
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden ml-auto p-2 text-cm-text"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-cm-card border-t border-cm-border px-4 py-3 flex flex-col gap-1 animate-slide-up">
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `px-3 py-3 rounded-lg text-sm font-medium ${isActive ? 'text-cm-accent bg-cm-accent/10' : 'text-cm-text'}`
              }
            >
              {label}
            </NavLink>
          ))}
          {!user ? (
            <div className="flex gap-2 pt-2 border-t border-cm-border mt-2">
              <Link to="/login" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-2 rounded-lg border border-cm-border text-sm text-cm-text">Sign In</Link>
              <Link to="/login?tab=register" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-2 rounded-lg bg-cm-accent text-white text-sm">Register</Link>
            </div>
          ) : (
            <button onClick={handleLogout} className="mt-2 flex items-center gap-2 px-3 py-2 text-sm text-red-400">
              <LogOut size={14} /> Sign Out
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
