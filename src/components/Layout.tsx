import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';

export function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-israel-blue text-white py-4 px-4 shadow-lg">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 no-underline text-white">
            <span className="text-3xl">🇮🇱</span>
            <div>
              <h1 className="text-2xl font-bold m-0 leading-tight">חידון ציון</h1>
              <p className="text-xs opacity-80 m-0">Chidon Tzion</p>
            </div>
          </Link>
          {!isHome && (
            <Link
              to="/"
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors no-underline"
            >
              🏠 דף הבית
            </Link>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
        {children}
      </main>
    </div>
  );
}
