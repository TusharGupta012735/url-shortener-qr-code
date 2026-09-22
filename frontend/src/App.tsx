import { useState } from 'react';
import { APP_ENV } from './lib/api';
import Home from './pages/Home';
import Analytics from './pages/Analytics';
import './App.css';

type View = 'home' | 'analytics';

function App() {
  const [view, setView] = useState<View>('home');

  return (
    <div className="shell">
      <nav className="nav">
        <div className="nav-inner">
          <div className="brand">
            <span aria-hidden="true">🔗</span> Shortener
          </div>
          <div className="nav-links">
            <button
              className={`nav-link ${view === 'home' ? 'active' : ''}`}
              onClick={() => setView('home')}
            >
              Shorten
            </button>
            <button
              className={`nav-link ${view === 'analytics' ? 'active' : ''}`}
              onClick={() => setView('analytics')}
            >
              Analytics
            </button>
          </div>
          <span className={`env-badge env-${APP_ENV}`}>{APP_ENV}</span>
        </div>
      </nav>

      {view === 'home' ? <Home /> : <Analytics />}
    </div>
  );
}

export default App;
