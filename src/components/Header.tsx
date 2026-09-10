import React, { useState } from 'react';
import { NavTab } from '../types';
import { Home, Sparkles, Layers, Factory, ShoppingCart, Menu, X } from 'lucide-react';

interface HeaderProps {
  activeTab: NavTab;
  onSelectTab?: (tab: NavTab) => void;
  onNavigate?: (tab: NavTab) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onSelectTab, onNavigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    { id: 'accueil', label: 'Accueil', icon: <Home className="w-4 h-4" /> },
    { id: 'produits', label: 'Produits et formules', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'matieres', label: 'Matières premières', icon: <Layers className="w-4 h-4" /> },
    { id: 'fabrication', label: 'Fabrication', icon: <Factory className="w-4 h-4" /> },
    { id: 'achats', label: 'Achats', icon: <ShoppingCart className="w-4 h-4" /> },
  ];

  const handleTabClick = (tab: NavTab) => {
    if (onSelectTab) onSelectTab(tab);
    if (onNavigate) onNavigate(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FBFBFA]/90 backdrop-blur-md border-b border-stone-200/80 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo CleanNet - Official Brand Identity */}
          <button
            onClick={() => handleTabClick('accueil')}
            id="brand-header-logo-btn"
            className="group text-left flex items-center space-x-3 focus:outline-none"
          >
            <img
              src="/logo.png"
              alt="Logo CleanNet"
              referrerPolicy="no-referrer"
              className="h-11 w-auto max-h-12 object-contain transition-transform group-hover:scale-105"
            />
            <span className="text-2xl font-bold tracking-tight text-stone-900 transition-colors hidden sm:inline">
              Clean<span className="text-amber-500">Net</span>
            </span>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => handleTabClick(item.id)}
                  className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                    isActive
                      ? 'bg-stone-900 text-stone-50 shadow-sm'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/80'
                  }`}
                >
                  <span className={isActive ? 'text-stone-200' : 'text-stone-500'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              id="mobile-menu-toggle"
              className="p-2 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 focus:outline-none"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 bg-[#FBFBFA] px-4 pt-3 pb-5 space-y-1 shadow-lg">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`mobile-nav-${item.id}`}
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-stone-900 text-stone-50'
                    : 'text-stone-700 hover:bg-stone-100'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
