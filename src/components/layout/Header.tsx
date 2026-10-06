import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Menu, X, Globe, User, Shield, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const { totalItems } = useCart();
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/', label: t('nav.home') },
    { path: '/#make-book', label: language === 'nl' ? 'Maak Je Boek' : 'Make Your Book' },
    { path: '/about', label: t('nav.about') },
    { path: '/contact', label: t('nav.contact') },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md shadow-soft">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <img 
              src="/logo.PNG" 
              alt="Sterren Verhalen" 
              className="h-[70px] md:h-20 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
            />
            <span className="text-xl md:text-2xl font-bold text-foreground hidden sm:inline">
              Sterren Verhalen
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              item.path.includes('#') ? (
                <a
                  key={item.path}
                  href={item.path}
                  className={`px-4 py-2 rounded-full text-base font-medium transition-all duration-300 text-foreground hover:bg-accent hover:text-accent-foreground`}
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-2 rounded-full text-base font-medium transition-all duration-300 ${
                    isActive(item.path)
                      ? 'bg-primary/10 text-primary'
                      : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  {item.label}
                </Link>
              )
            ))}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(language === 'nl' ? 'en' : 'nl')}
              className="flex items-center gap-1 px-3 py-2 rounded-full bg-accent/50 hover:bg-accent transition-colors duration-300 text-sm font-medium"
            >
              <Globe className="w-4 h-4" />
              <span className="uppercase">{language}</span>
            </button>

            {/* Admin Panel - Only show if user is admin */}
            {user?.is_admin && (
              <Link to="/admin" title={language === 'nl' ? 'Beheerderspaneel' : 'Admin Panel'}>
                <Button variant="ghost" size="icon" className="relative">
                  <Shield className="w-5 h-5 text-primary" />
                </Button>
              </Link>
            )}

            {/* Profile Link */}
            <Link to="/profile" title={language === 'nl' ? 'Mijn Profiel' : 'My Profile'}>
              <Button variant="ghost" size="icon" className="relative">
                <User className="w-5 h-5" />
                {user && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></span>
                )}
              </Button>
            </Link>

            {/* Logout Button - Only show if user is logged in */}
            {user && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={logout}
                title={language === 'nl' ? 'Uitloggen' : 'Logout'}
                className="text-muted-foreground hover:text-destructive"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            )}

            {/* Cart */}
            <Link to="/cart" className="relative">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center animate-scale-in">
                    {totalItems}
                  </span>
                )}
              </Button>
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-full hover:bg-accent transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 border-t border-border animate-fade-in">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                item.path.includes('#') ? (
                  <a
                    key={item.path}
                    href={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`px-4 py-3 rounded-xl text-base font-medium transition-all duration-300 text-foreground hover:bg-accent`}
                  >
                    {item.label}
                  </a>
                ) : (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`px-4 py-3 rounded-xl text-base font-medium transition-all duration-300 ${
                      isActive(item.path)
                        ? 'bg-primary/10 text-primary'
                        : 'text-foreground hover:bg-accent'
                    }`}
                  >
                    {item.label}
                  </Link>
                )
              ))}
              
              {/* Mobile Profile Link */}
              <Link
                to="/profile"
                onClick={() => setIsMenuOpen(false)}
                className={`px-4 py-3 rounded-xl text-base font-medium transition-all duration-300 flex items-center gap-2 ${
                  isActive('/profile')
                    ? 'bg-primary/10 text-primary'
                    : 'text-foreground hover:bg-accent'
                }`}
              >
                <User className="w-5 h-5" />
                {language === 'nl' ? 'Mijn Profiel' : 'My Profile'}
                {user && <span className="w-2 h-2 bg-green-500 rounded-full ml-auto"></span>}
              </Link>

              {/* Mobile Admin Panel Link */}
              {user?.is_admin && (
                <Link
                  to="/admin"
                  onClick={() => setIsMenuOpen(false)}
                  className={`px-4 py-3 rounded-xl text-base font-medium transition-all duration-300 flex items-center gap-2 ${
                    isActive('/admin')
                      ? 'bg-primary/10 text-primary'
                      : 'text-foreground hover:bg-accent'
                  }`}
                >
                  <Shield className="w-5 h-5" />
                  {language === 'nl' ? 'Beheerderspaneel' : 'Admin Panel'}
                </Link>
              )}

              {/* Mobile Logout Button */}
              {user && (
                <button
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                  className="px-4 py-3 rounded-xl text-base font-medium transition-all duration-300 flex items-center gap-2 text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="w-5 h-5" />
                  {language === 'nl' ? 'Uitloggen' : 'Logout'}
                </button>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
