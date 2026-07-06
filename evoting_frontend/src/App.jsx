
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginRegister from './LoginRegister';
import VotingBooth from './VotingBooth';
import PrivateAdminConsole from './PrivateAdminConsole';
import './index.css';

function VoterTerminal() {
  const [sessionData, setSessionData] = useState(null);

  return (
    <div className="app-viewport">
      <div className="dashboard-grid">
        <aside className="hero-panel">
          <div style={{ maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h1 style={{ color: '#C9D1D9', fontSize: '32px', fontWeight: '800', margin: 0 }}>
              DECENTRALIZED<br />VOTING MATRIX
            </h1>
            <p style={{ color: '#8B949E', fontSize: '13px', lineHeight: '1.6', margin: 0 }}>
              Secure identity validation and anonymous cryptographic ballot system.
            </p>
          </div>
        </aside>

        <main className="interactive-area">
          {!sessionData ? (
            <LoginRegister onAuthSuccess={(data) => setSessionData(data)} />
          ) : (
            <VotingBooth sessionData={sessionData} onSessionTerminate={() => setSessionData(null)} />
          )}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<VoterTerminal />} />
        <Route path="/admin" element={<PrivateAdminConsole />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}