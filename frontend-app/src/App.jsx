import React from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { ShieldCheck, Layers, FileEdit, Search } from 'lucide-react';
import IssuePage from './pages/IssuePage';
import VerifyPage from './pages/VerifyPage';
import WalletPage from './pages/WalletPage';

function App() {
  return (
    <BrowserRouter>
      {/* Background Animated Blobs */}
      <div className="bg-blob blob-1"></div>
      <div className="bg-blob blob-2"></div>

      <div className="app-container">
        {/* Navigation Bar */}
        <nav className="nav-bar">
          <div className="nav-logo">
            <Layers className="file-icon" style={{ width: 28, height: 28 }} />
            ZKBAR-V
          </div>

          <div className="nav-links">
            <NavLink
              to="/wallet"
              className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={18} />
                Student Wallet
              </div>
            </NavLink>
            <NavLink
              to="/"
              className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
              end
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileEdit size={18} />
                Issue Credential
              </div>
            </NavLink>
            <NavLink
              to="/verify"
              className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Search size={18} />
                Verify Credential
              </div>
            </NavLink>
          </div>
        </nav>

        {/* Main Content Area */}
        <main>
          <Routes>
            <Route path="/" element={<IssuePage />} />
            <Route path="/verify" element={<VerifyPage />} />
            <Route path="/wallet" element={<WalletPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
