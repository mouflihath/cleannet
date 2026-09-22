import React, { useEffect, useRef, useState } from 'react';
import { NavTab } from '../types';
import { Home, Sparkles, Layers, Factory, ShoppingCart, LogIn, LogOut, User } from 'lucide-react';

interface HeaderProps {
  activeTab: NavTab;
  onSelectTab?: (tab: NavTab) => void;
  onNavigate?: (tab: NavTab) => void;
  googleUser?: { name: string; email: string; picture?: string } | null;
  onGoogleLogin?: (credential: string) => void;
  onGoogleLogout?: () => void;
  authButtonTargetRef?: React.RefObject<HTMLDivElement | null>;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: { client_id: string; callback: (response: { credential: string }) => void; auto_select?: boolean; context?: string }) => void;
          renderButton: (element: HTMLElement, options: Record<string, string>) => void;
          prompt: () => void;
          disableAutoSelect: () => void;
        };
      };
    };
  }
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onSelectTab, onNavigate, googleUser, onGoogleLogin, onGoogleLogout, authButtonTargetRef }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const mobileGoogleButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!onGoogleLogin || googleUser || !window.google) return;
    window.google.accounts.id.initialize({
      client_id: '362664635286-sfa3cescvt9nu6tltel783rmd4ilht4u.apps.googleusercontent.com',
      callback: ({ credential }) => onGoogleLogin(credential),
      auto_select: false,
      context: 'signin',
    });
    const buttonOptions = {
      type: 'standard',
      theme: 'filled_blue',
      size: 'large',
      text: 'signin_with',
      shape: 'pill',
    };
    [googleButtonRef.current, mobileGoogleButtonRef.current, authButtonTargetRef?.current].forEach((container) => {
      if (!container) return;
      container.innerHTML = '';
      window.google?.accounts.id.renderButton(container, buttonOptions);
    });
  }, [googleUser, onGoogleLogin]);

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

  const handleLoginClick = () => {
    authButtonTargetRef?.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    window.google?.accounts.id.prompt();
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#FBFBFA]/90 backdrop-blur-md border-b border-stone-200/80 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
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

          <div className="hidden md:flex items-center gap-2 relative">
            {googleUser ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setProfileMenuOpen((prev) => !prev)}
                  className="flex items-center gap-2 rounded-full border border-stone-200 bg-white px-2 py-1 text-xs text-stone-700 hover:border-stone-400"
                  title="Profil utilisateur"
                >
                  {googleUser.picture && <img src={googleUser.picture} alt="" className="h-7 w-7 rounded-full" />}
                  <span className="max-w-28 truncate">{googleUser.name}</span>
                </button>

                {profileMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-stone-200 bg-white p-2 shadow-xl">
                    <div className="mb-2 px-2 py-2 rounded-xl bg-stone-50 text-xs text-stone-600">
                      <div className="flex items-center gap-2 text-stone-800 font-medium">
                        <User className="w-3.5 h-3.5" />
                        <span>{googleUser.name}</span>
                      </div>
                      <p className="mt-1 truncate text-[11px] text-stone-500">{googleUser.email}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setProfileMenuOpen(false);
                        onGoogleLogout?.();
                      }}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-stone-900 px-3 py-2 text-xs font-medium text-white hover:bg-stone-800"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Se déconnecter
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <div ref={googleButtonRef} />
                <button
                  type="button"
                  onClick={handleLoginClick}
                  className="flex items-center gap-2 rounded-full bg-stone-900 px-3 py-2 text-xs font-medium text-white hover:bg-stone-800"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  Se connecter
                </button>
              </>
            )}
          </div>

          {/* Mobile account (top right) */}
          <div className="md:hidden flex items-center justify-end gap-2 relative min-w-0">
            {!googleUser ? (
              <>
                <div ref={mobileGoogleButtonRef} className="hidden" />
                <button
                  type="button"
                  onClick={handleLoginClick}
                  className="flex items-center gap-1.5 rounded-full bg-stone-900 px-3 py-2 text-xs font-medium text-white shadow-sm"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  Connexion
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setProfileMenuOpen((prev) => !prev)}
                className="flex items-center gap-2 rounded-full border border-stone-200 bg-white px-2 py-1.5 text-[11px] text-stone-700 shadow-sm max-w-[170px]"
                title="Profil utilisateur"
              >
                {googleUser.picture && <img src={googleUser.picture} alt="" className="h-7 w-7 rounded-full shrink-0" />}
                <span className="truncate">{googleUser.email}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {profileMenuOpen && googleUser && (
        <div className="fixed inset-0 z-40 bg-stone-900/10 md:hidden" onClick={() => setProfileMenuOpen(false)} />
      )}

      {profileMenuOpen && googleUser && (
        <div className="fixed inset-x-4 bottom-20 z-50 md:hidden">
          <div className="rounded-2xl border border-stone-200 bg-white p-3 shadow-xl">
            <div className="mb-2 rounded-xl bg-stone-50 px-3 py-2 text-xs text-stone-600">
              <div className="flex items-center gap-2 text-stone-800 font-medium">
                <User className="w-3.5 h-3.5" />
                <span>{googleUser.name}</span>
              </div>
              <p className="mt-1 truncate text-[11px] text-stone-500">{googleUser.email}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setProfileMenuOpen(false);
                onGoogleLogout?.();
              }}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-stone-900 px-3 py-2.5 text-sm font-medium text-white"
            >
              <LogOut className="w-4 h-4" />
              Se déconnecter
            </button>
          </div>
        </div>
      )}

      </header>

      <nav className="mobile-bottom-nav md:hidden" aria-label="Navigation principale mobile">
        <div className="mobile-bottom-nav__inner">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`bottom-nav-${item.id}`}
                  onClick={() => handleTabClick(item.id)}
                  className={`flex flex-col items-center justify-center rounded-xl px-1 py-2 text-[10px] font-medium transition-colors ${
                    isActive
                      ? 'bg-stone-900 text-stone-50'
                      : 'text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span className="mt-1 leading-tight text-center">{item.label}</span>
                </button>
              );
            })}
        </div>
      </nav>
    </>
  );
};
