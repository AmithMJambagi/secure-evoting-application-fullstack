// import React, { useState, useEffect } from 'react';

// export default function PrivateAdminConsole() {
//     const [isAuthenticated, setIsAuthenticated] = useState(false);
//     const [username, setUsername] = useState("");
//     const [password, setPassword] = useState("");

//     // Navigation Menus: "results" | "explorer" | "integrity"
//     const [activeTab, setActiveTab] = useState("results"); 

//     const [constituencies, setConstituencies] = useState([]);
//     const [selectedCode, setSelectedCode] = useState("");
    
//     // Server Synchronized Buckets
//     const [metrics, setMetrics] = useState(null); 
//     const [regionalCandidates, setRegionalCandidates] = useState([]); 
//     const [tamperLogs, setTamperLogs] = useState([]); 

//     const [safetyWipeConfirmation, setSafetyWipeConfirmation] = useState("");

//     // Inline Status Banner States (Success / Error alerts inside layout)
//     const [loginError, setLoginError] = useState("");
//     const [integrityStatus, setIntegrityStatus] = useState(null); // { type: 'success'|'danger', message: '' }
//     const [wipeStatus, setWipeStatus] = useState(null); // { type: 'success'|'danger', message: '' }

//     // Initial session hook
//     useEffect(() => {
//         const token = localStorage.getItem('admin_token');
//         if (token) {
//             setIsAuthenticated(true);
//             fetchInitialConstituencies(token);
//         }
//     }, []);

//     // Active dropdown database watcher
//     useEffect(() => {
//         if (selectedCode && isAuthenticated) {
//             syncConstituencyData();
//         }
//     }, [selectedCode, isAuthenticated, activeTab]);

//     const handleLogin = async (e) => {
//         e.preventDefault();
//         setLoginError("");
//         try {
//             const res = await fetch(buildApiUrl('/api/admin/auth/login'), { 
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ username, password })
//             });
//             if (!res.ok) throw new Error("Invalid username or password credentials.");
//             const data = await res.json();
//             localStorage.setItem('admin_token', data.token);
//             setIsAuthenticated(true);
//             fetchInitialConstituencies(data.token);
//         } catch (err) {
//             setLoginError(err.message);
//         }
//     };

//     const fetchInitialConstituencies = (token) => {
//         fetch(buildApiUrl('/api/admin/evm-management/constituencies'), {
//             headers: { 'Authorization': `Bearer ${token || localStorage.getItem('admin_token')}` }
//         })
//         .then(res => {
//             if (!res.ok) throw new Error("Failed to load initial layout arrays");
//             return res.json();
//         })
//         .then(data => {
//             setConstituencies(data);
//             if (data.length > 0) setSelectedCode(data[0].constituencyCode);
//         })
//         .catch(err => console.error("Network Error:", err));
//     };

//     const syncConstituencyData = async () => {
//         if (!selectedCode) return;
//         const currentToken = localStorage.getItem('admin_token');
//         const targetConstituencyObject = constituencies.find(c => c.constituencyCode === selectedCode);

//         try {
//             const tallyRes = await fetch(buildApiUrl(`/api/admin/evm-management/constituency-tally/${selectedCode}`), {
//                 headers: { 'Authorization': `Bearer ${currentToken}` }
//             });
//             if (tallyRes.ok) {
//                 const tallyData = await tallyRes.json();
//                 setMetrics(tallyData);
//             }

//             if (targetConstituencyObject) {
//                 const candRes = await fetch(buildApiUrl('/api/admin/evm-management/candidates'), {
//                     method: 'POST',
//                     headers: { 
//                         'Content-Type': 'application/json',
//                         'Authorization': `Bearer ${currentToken}`
//                     },
//                     body: JSON.stringify(targetConstituencyObject)
//                 });
//                 if (candRes.ok) {
//                     const candData = await candRes.json();
//                     setRegionalCandidates(candData);
//                 }
//             }
//         } catch (err) {
//             console.error("Telemetry Error:", err);
//         }
//     };

//     const runIntegrityCheck = async () => {
//         setIntegrityStatus(null);
//         const currentToken = localStorage.getItem('admin_token');
//         try {
//             const res = await fetch(buildApiUrl('/api/admin/evm-management/tamper-report'), {
//                 headers: { 'Authorization': `Bearer ${currentToken}` }
//             });
//             if (!res.ok) throw new Error("Cryptographic verification loop failed to execute correctly.");
            
//             const data = await res.json();
//             setTamperLogs(data);

//             if (data.length === 0) {
//                 setIntegrityStatus({
//                     type: 'success',
//                     message: "✅ VOTE INTEGRITY SECURE: All record row sequences matched their signature fields completely. No anomalies found."
//                 });
//             } else {
//                 setIntegrityStatus({
//                     type: 'danger',
//                     message: `🚨 SECURITY WARNING: Isolated ${data.length} tampered ballot rows inside the log registry! Review database table violations listed below.`
//                 });
//             }
//         } catch (err) {
//             setIntegrityStatus({ type: 'danger', message: err.message });
//         }
//     };

//     const triggerZeroize = async () => {
//         setWipeStatus(null);
//         if (safetyWipeConfirmation !== "ERASE_EVM_VOTES") {
//             setWipeStatus({ type: 'danger', message: "Verification string sequence mismatch. Action rejected." });
//             return;
//         }
        
//         try {
//             const res = await fetch(buildApiUrl('/api/admin/evm-management/zeroize'), {
//                 method: 'POST',
//                 headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` }
//             });
//             if (res.ok) {
//                 setWipeStatus({ type: 'success', message: "Votes wiped successfully. Resetting terminal environment..." });
//                 setTimeout(() => {
//                     localStorage.removeItem('admin_token');
//                     window.location.reload();
//                 }, 2000);
//             } else {
//                 throw new Error("Wipe operation rejected by backend node security protocols.");
//             }
//         } catch (err) {
//             setWipeStatus({ type: 'danger', message: err.message });
//         }
//     };

//     if (!isAuthenticated) {
//         return (
//             <div style={{ display: 'flex', height: '100vh', backgroundColor: '#0d1117', justifyContent: 'center', alignItems: 'center', fontFamily: 'monospace' }}>
//                 <form onSubmit={handleLogin} style={{ background: '#161b22', padding: '30px', borderRadius: '6px', border: '1px solid #30363d', width: '320px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
//                     <h2 style={{ color: '#c9d1d9', margin: '0 0 10px 0', fontSize: '16px', fontWeight: 'bold', textAlign: 'center' }}>LOGIN</h2>
                    
//                     {loginError && (
//                         <div style={{ backgroundColor: '#ffdbdb', color: '#bd2c00', border: '1px solid #ffcccc', padding: '10px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
//                             {loginError}
//                         </div>
//                     )}

//                     <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} style={{ background: '#0d1117', border: '1px solid #30363d', padding: '10px', color: '#c9d1d9', borderRadius: '4px', outline: 'none' }} required />
//                     <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} style={{ background: '#0d1117', border: '1px solid #30363d', padding: '10px', color: '#c9d1d9', borderRadius: '4px', outline: 'none' }} required />
//                     <button type="submit" style={{ background: '#238636', color: '#fff', border: 'none', padding: '11px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>SUBMIT</button>
//                 </form>
//             </div>
//         );
//     }

//     const sortedStandings = metrics && metrics.standings ? Object.entries(metrics.standings).sort((a, b) => b[1] - a[1]) : [];
//     const leadVotes = sortedStandings.length > 0 ? sortedStandings[0][1] : 0;

//     return (
//         <div style={{ backgroundColor: '#0d1117', minHeight: '100vh', color: '#c9d1d9', fontFamily: 'monospace', padding: '30px' }}>
//             <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '25px' }}>
                
//                 <header style={{ borderBottom: '1px solid #30363d', paddingBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                     <h1 style={{ margin: 0, fontSize: '20px', color: '#58a6ff', fontWeight: 'bold' }}>ADMIN PANEL</h1>
//                     <button onClick={() => { localStorage.removeItem('admin_token'); window.location.reload(); }} style={{ background: '#da3633', border: 'none', padding: '8px 16px', color: '#fff', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>LOGOUT</button>
//                 </header>

//                 <nav style={{ display: 'flex', gap: '10px', borderBottom: '1px solid #21262d', paddingBottom: '10px' }}>
//                     <button onClick={() => setActiveTab("results")} style={{ background: activeTab === "results" ? "#21262d" : "transparent", border: activeTab === "results" ? "1px solid #30363d" : "none", color: activeTab === "results" ? "#58a6ff" : "#8b949e", padding: '8px 14px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Results Matrix</button>
//                     <button onClick={() => setActiveTab("explorer")} style={{ background: activeTab === "explorer" ? "#21262d" : "transparent", border: activeTab === "explorer" ? "1px solid #30363d" : "none", color: activeTab === "explorer" ? "#58a6ff" : "#8b949e", padding: '8px 14px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Candidates list</button>
//                     <button onClick={() => setActiveTab("integrity")} style={{ background: activeTab === "integrity" ? "#21262d" : "transparent", border: activeTab === "integrity" ? "1px solid #30363d" : "none", color: activeTab === "integrity" ? "#da3633" : "#8b949e", padding: '8px 14px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Security Options</button>
//                 </nav>

//                 {activeTab !== "integrity" && (
//                     <div style={{ background: '#161b22', border: '1px solid #30363d', padding: '15px 20px', borderRadius: '6px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
//                         <label style={{ fontSize: '12px', color: '#8b949e', fontWeight: 'bold' }}>Select Constituency:</label>
//                         <select value={selectedCode} onChange={e => setSelectedCode(e.target.value)} style={{ background: '#0d1117', border: '1px solid #30363d', padding: '10px', color: '#c9d1d9', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', width: '100%' }}>
//                             {constituencies.length === 0 ? <option value="">No Constituencies Found</option> : constituencies.map(c => <option key={c.constituencyCode} value={c.constituencyCode}>{c.constituencyName} ({c.constituencyCode})</option>)}
//                         </select>
//                     </div>
//                 )}

//                 {/* --- MENU: RESULTS --- */}
//                 {activeTab === "results" && (
//                     <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
//                         <div style={{ background: '#161b22', border: '1px solid #30363d', padding: '20px', borderRadius: '6px' }}>
//                             <h3 style={{ margin: '0 0 15px 0', fontSize: '14px', color: '#58a6ff' }}>Vote Standings</h3>
//                             {sortedStandings.map(([name, votes], idx) => (
//                                 <div key={name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '8px 0', borderBottom: '1px solid #21262d' }}>
//                                     <span>{idx + 1}. {name}</span>
//                                     <span style={{ fontWeight: 'bold', color: votes > 0 && idx === 0 ? '#2ea44f' : '#c9d1d9' }}>{votes} Votes</span>
//                                 </div>
//                             ))}
//                         </div>
//                         <div style={{ background: '#161b22', border: '1px solid #30363d', padding: '20px', borderRadius: '6px' }}>
//                             <h3 style={{ margin: '0 0 15px 0', fontSize: '14px', color: '#2ea44f' }}>Calculated Margins</h3>
//                             {sortedStandings.length <= 1 || leadVotes === 0 ? (
//                                 <div style={{ color: '#8b949e', fontSize: '12px', fontStyle: 'italic' }}>No data to compute running margins.</div>
//                             ) : (
//                                 sortedStandings.slice(1).map(([name, votes]) => (
//                                     <div key={name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '8px 0', borderBottom: '1px solid #21262d' }}>
//                                         <span style={{ color: '#8b949e' }}>{sortedStandings[0][0]} vs {name}</span>
//                                         <span style={{ fontWeight: 'bold', color: '#da3633' }}>-{leadVotes - votes} Votes</span>
//                                     </div>
//                                 ))
//                             )}
//                         </div>
//                     </div>
//                 )}

//                 {/* --- MENU: CANDIDATES --- */}
//                 {activeTab === "explorer" && (
//                     <div style={{ background: '#161b22', border: '1px solid #30363d', padding: '20px', borderRadius: '6px' }}>
//                         <h3 style={{ margin: '0 0 15px 0', fontSize: '14px', color: '#58a6ff' }}>Registered Candidates</h3>
//                         {regionalCandidates.length === 0 ? (
//                             <div style={{ color: '#8b949e', fontSize: '12px', fontStyle: 'italic' }}>No candidates found for this region selection.</div>
//                         ) : (
//                             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
//                                 {regionalCandidates.map((cand) => (
//                                     <div key={cand.id} style={{ background: '#0d1117', border: '1px solid #30363d', padding: '15px', borderRadius: '4px' }}>
//                                         <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#fff' }}>{cand.name}</div>
//                                         <div style={{ fontSize: '12px', color: '#8b949e', marginTop: '6px' }}>Party: <span style={{ color: '#58a6ff' }}>{cand.party}</span></div>
//                                         <div style={{ fontSize: '11px', color: '#58a6ff', marginTop: '2px' }}>ID: {cand.id}</div>
//                                     </div>
//                                 ))}
//                             </div>
//                         )}
//                     </div>
//                 )}

//                 --- MENU: AUDIT SECURITY INTEGRITY ---
//                 {activeTab === "integrity" && (
//                     <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                        
//                         <div style={{ background: '#161b22', border: '1px solid #30363d', padding: '20px', borderRadius: '6px' }}>
//                             <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#2ea44f', fontWeight: 'bold' }}>Verify Vote Integrity</h3>
//                             <p style={{ margin: '0 0 15px 0', fontSize: '12px', color: '#8b949e', lineHeight: '1.4' }}>Run optimized scan loop checking cryptographic records row-by-row.</p>
//                             <button onClick={runIntegrityCheck} style={{ background: '#21262d', border: '1px solid #30363d', color: '#2ea44f', padding: '10px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', marginBottom: '15px' }}>Run Integrity Verification</button>
                            
//                             {/* Dashboard Notification Banner instead of Alerts */}
//                             {integrityStatus && (
//                                 <div style={{ 
//                                     backgroundColor: integrityStatus.type === 'success' ? '#dcfee5' : '#ffebe9', 
//                                     color: integrityStatus.type === 'success' ? '#24292e' : '#c44137', 
//                                     border: `1px solid ${integrityStatus.type === 'success' ? '#bef5cb' : '#ffc1bd'}`, 
//                                     padding: '12px 15px', 
//                                     borderRadius: '4px', 
//                                     fontSize: '13px',
//                                     fontWeight: 'bold',
//                                     lineHeight: '1.4'
//                                 }}>
//                                     {integrityStatus.message}
//                                 </div>
//                             )}
//                         </div>

//                         {/* Renders the dynamic tamper data list table */}
//                         {tamperLogs.length > 0 && (
//                             <div style={{ background: '#161b22', border: '1px solid #da3633', padding: '20px', borderRadius: '6px' }}>
//                                 <h3 style={{ margin: '0 0 15px 0', fontSize: '14px', color: '#da3633', fontWeight: 'bold' }}>ISOLATED BALLOT TAMPER LOGS</h3>
//                                 <div style={{ overflowX: 'auto' }}>
//                                     <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
//                                         <thead>
//                                             <tr style={{ borderBottom: '2px solid #30363d', color: '#8b949e' }}>
//                                                 <th style={{ padding: '10px 5px' }}>BALLOT ID</th>
//                                                 <th style={{ padding: '10px 5px' }}>CONSTITUENCY NAME</th>
//                                                 <th style={{ padding: '10px 5px' }}>CONSTITUENCY CODE</th>
//                                                 <th style={{ padding: '10px 5px', textAlign: 'right' }}>CAST TIMSTAMP</th>
//                                             </tr>
//                                         </thead>
//                                         <tbody>
//                                             {tamperLogs.map((log) => (
//                                                 <tr key={log.ballotId} style={{ borderBottom: '1px solid #21262d', color: '#c9d1d9' }}>
//                                                     <td style={{ padding: '12px 5px', color: '#da3633', fontWeight: 'bold' }}>#{log.ballotId}</td>
//                                                     <td style={{ padding: '12px 5px' }}>{log.constituencyName}</td>
//                                                     <td style={{ padding: '12px 5px', color: '#58a6ff' }}>{log.constituencyCode}</td>
//                                                     <td style={{ padding: '12px 5px', textAlign: 'right', color: '#8b949e' }}>{log.timestamp}</td>
//                                                 </tr>
//                                             ))}
//                                         </tbody>
//                                     </table>
//                                 </div>
//                             </div>
//                         )}

//                         {/* Secure Destruction Confirmation Panel */}
//                         <div style={{ background: '#161b22', border: '1px solid #da3633', padding: '20px', borderRadius: '6px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
//                             <h3 style={{ margin: 0, fontSize: '14px', color: '#da3633', fontWeight: 'bold' }}>Wipe Electronic Votes</h3>
//                             <p style={{ margin: 0, fontSize: '12px', color: '#8b949e', lineHeight: '1.4' }}>Completely wipe all records from the database storage logs. This action cannot be reversed.</p>
                            
//                             <div style={{ background: '#0d1117', border: '1px solid #30363d', padding: '15px', borderRadius: '4px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
//                                 <label style={{ fontSize: '12px', color: '#c9d1d9' }}>To protect against accidental clicking, type the string sequence exactly below to unlock action permissions:</label>
//                                 <span style={{ fontSize: '13px', color: '#da3633', fontWeight: 'bold', letterSpacing: '1px' }}>ERASE_EVM_VOTES</span>
//                                 <input type="text" placeholder="Type confirmation here..." value={safetyWipeConfirmation} onChange={e => setSafetyWipeConfirmation(e.target.value)} style={{ background: '#161b22', border: '1px solid #30363d', padding: '10px', color: '#fff', borderRadius: '4px', outline: 'none', fontSize: '13px' }} />
//                             </div>
                            
//                             <button onClick={triggerZeroize} disabled={safetyWipeConfirmation !== "ERASE_EVM_VOTES"} style={{ background: safetyWipeConfirmation === "ERASE_EVM_VOTES" ? '#da3633' : '#21262d', border: 'none', color: safetyWipeConfirmation === "ERASE_EVM_VOTES" ? '#fff' : '#484f58', padding: '12px', borderRadius: '4px', cursor: safetyWipeConfirmation === "ERASE_EVM_VOTES" ? 'pointer' : 'not-allowed', fontWeight: 'bold', fontSize: '12px' }}>Confirm and Wipe Database Logs</button>
                            
//                             {/* Layout Notification Banner for Wipe Operations */}
//                             {wipeStatus && (
//                                 <div style={{ 
//                                     backgroundColor: wipeStatus.type === 'success' ? '#dcfee5' : '#ffebe9', 
//                                     color: wipeStatus.type === 'success' ? '#24292e' : '#c44137', 
//                                     border: `1px solid ${wipeStatus.type === 'success' ? '#bef5cb' : '#ffc1bd'}`, 
//                                     padding: '12px 15px', 
//                                     borderRadius: '4px', 
//                                     fontSize: '13px',
//                                     fontWeight: 'bold'
//                                 }}>
//                                     {wipeStatus.message}
//                                 </div>
//                             )}
//                         </div>

//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// }

import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from './apiConfig';

// Helper function to safely parse client-side JWT payload expiration claims
const getJwtExpirationTime = (token) => {
    try {
        if (!token) return null;
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            window.atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        const parsed = JSON.parse(jsonPayload);
        return parsed.exp ? parsed.exp * 1000 : null;
    } catch (e) {
        console.error("Malformed token format caught during session scan:", e);
        return null;
    }
};

const buildApiUrl = (path) => `${API_BASE_URL}${path}`;

export default function PrivateAdminConsole() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    // Navigation Menus: "results" | "explorer" | "integrity"
    const [activeTab, setActiveTab] = useState("results"); 

    const [constituencies, setConstituencies] = useState([]);
    const [selectedCode, setSelectedCode] = useState("");
    
    // Server Synchronized Buckets
    const [metrics, setMetrics] = useState(null); 
    const [regionalCandidates, setRegionalCandidates] = useState([]); 
    const [tamperLogs, setTamperLogs] = useState([]); 

    const [safetyWipeConfirmation, setSafetyWipeConfirmation] = useState("");

    // Inline Status Banner States
    const [loginError, setLoginError] = useState("");
    const [integrityStatus, setIntegrityStatus] = useState(null); 
    const [wipeStatus, setWipeStatus] = useState(null); 

    // Automatic Session Expiration Hook
    useEffect(() => {
        let logoutTimer;
        const token = localStorage.getItem('admin_token');
        
        if (token) {
            const expirationTimeMs = getJwtExpirationTime(token);
            const currentTimeMs = Date.now();

            if (expirationTimeMs && currentTimeMs >= expirationTimeMs) {
                handleAutomaticLogout();
            } else if (expirationTimeMs) {
                setIsAuthenticated(true);
                fetchInitialConstituencies(token);

                const remainingTimeMs = expirationTimeMs - currentTimeMs;
                logoutTimer = setTimeout(() => {
                    handleAutomaticLogout();
                }, remainingTimeMs);
            } else {
                setIsAuthenticated(true);
                fetchInitialConstituencies(token);
            }
        }

        return () => {
            if (logoutTimer) clearTimeout(logoutTimer);
        };
    }, [isAuthenticated]);

    // Active dropdown database watcher
    useEffect(() => {
        if (selectedCode && isAuthenticated) {
            syncConstituencyData();
        }
    }, [selectedCode, isAuthenticated, activeTab]);

    const handleAutomaticLogout = () => {
        localStorage.removeItem('admin_token');
        setIsAuthenticated(false);
        setMetrics(null);
        setRegionalCandidates([]);
        setTamperLogs([]);
        window.location.reload();
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoginError("");
        try {
            const res = await fetch(buildApiUrl('/api/admin/auth/login'), { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            if (!res.ok) throw new Error("Invalid username or password credentials.");
            const data = await res.json();
            localStorage.setItem('admin_token', data.token);
            setIsAuthenticated(true);
        } catch (err) {
            setLoginError(err.message);
        }
    };

    const fetchInitialConstituencies = (token) => {
        fetch(buildApiUrl('/api/admin/evm-management/constituencies'), {
            headers: { 'Authorization': `Bearer ${token || localStorage.getItem('admin_token')}` }
        })
        .then(res => {
            if (!res.ok) throw new Error("Failed to load initial layout arrays");
            return res.json();
        })
        .then(data => {
            setConstituencies(data);
            if (data.length > 0) setSelectedCode(data[0].constituencyCode);
        })
        .catch(err => console.error("Network Error:", err));
    };

    const syncConstituencyData = async () => {
        if (!selectedCode) return;
        const currentToken = localStorage.getItem('admin_token');
        const targetConstituencyObject = constituencies.find(c => c.constituencyCode === selectedCode);

        try {
            const tallyRes = await fetch(buildApiUrl(`/api/admin/evm-management/constituency-tally/${selectedCode}`), {
                headers: { 'Authorization': `Bearer ${currentToken}` }
            });
            if (tallyRes.ok) {
                const tallyData = await tallyRes.json();
                setMetrics(tallyData);
            } else {
                setMetrics(null);
            }

            if (targetConstituencyObject) {
                const candRes = await fetch(buildApiUrl('/api/admin/evm-management/candidates'), {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${currentToken}`
                    },
                    body: JSON.stringify(targetConstituencyObject)
                });
                if (candRes.ok) {
                    const candData = await candRes.json();
                    setRegionalCandidates(candData);
                }
            }
        } catch (err) {
            console.error("Telemetry Error:", err);
            setMetrics(null);
        }
    };

    const runIntegrityCheck = async () => {
        setIntegrityStatus(null);
        const currentToken = localStorage.getItem('admin_token');
        try {
            const res = await fetch(buildApiUrl('/api/admin/evm-management/tamper-report'), {
                headers: { 'Authorization': `Bearer ${currentToken}` }
            });
            if (!res.ok) throw new Error("Cryptographic verification loop failed to execute correctly.");
            
            const data = await res.json();
            setTamperLogs(data);

            if (data.length === 0) {
                setIntegrityStatus({
                    type: 'success',
                    message: "✅ VOTE INTEGRITY SECURE: All record row sequences matched their signature fields completely. No anomalies found."
                });
            } else {
                setIntegrityStatus({
                    type: 'danger',
                    message: `🚨 SECURITY WARNING: Isolated ${data.length} anomalous records inside the log registry! Review database table violations listed below.`
                });
            }
        } catch (err) {
            setIntegrityStatus({ type: 'danger', message: err.message });
        }
    };

    const triggerZeroize = async () => {
        setWipeStatus(null);
        if (safetyWipeConfirmation !== "ERASE_EVM_VOTES") {
            setWipeStatus({ type: 'danger', message: "Verification string sequence mismatch. Action rejected." });
            return;
        }
        
        try {
            const res = await fetch(buildApiUrl('/api/admin/evm-management/zeroize'), {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` }
            });
            if (res.ok) {
                setWipeStatus({ type: 'success', message: "Votes wiped successfully. Resetting terminal environment..." });
                setTimeout(() => {
                    localStorage.removeItem('admin_token');
                    window.location.reload();
                }, 2000);
            } else {
                throw new Error("Wipe operation rejected by backend node security protocols.");
            }
        } catch (err) {
            setWipeStatus({ type: 'danger', message: err.message });
        }
    };

    if (!isAuthenticated) {
        return (
            <div style={{ display: 'flex', height: '100vh', backgroundColor: '#0d1117', justifyContent: 'center', alignItems: 'center', fontFamily: 'monospace' }}>
                <form onSubmit={handleLogin} style={{ background: '#161b22', padding: '30px', borderRadius: '6px', border: '1px solid #30363d', width: '320px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <h2 style={{ color: '#c9d1d9', margin: '0 0 10px 0', fontSize: '16px', fontWeight: 'bold', textAlign: 'center' }}>LOGIN</h2>
                    
                    {loginError && (
                        <div style={{ backgroundColor: '#ffdbdb', color: '#bd2c00', border: '1px solid #ffcccc', padding: '10px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                            {loginError}
                        </div>
                    )}

                    <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} style={{ background: '#0d1117', border: '1px solid #30363d', padding: '10px', color: '#c9d1d9', borderRadius: '4px', outline: 'none' }} required />
                    <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} style={{ background: '#0d1117', border: '1px solid #30363d', padding: '10px', color: '#c9d1d9', borderRadius: '4px', outline: 'none' }} required />
                    <button type="submit" style={{ background: '#238636', color: '#fff', border: 'none', padding: '11px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>SUBMIT</button>
                </form>
            </div>
        );
    }

    const sortedStandings = metrics && metrics.standings ? Object.entries(metrics.standings).sort((a, b) => b[1] - a[1]) : [];
    const leadVotes = sortedStandings.length > 0 ? sortedStandings[0][1] : 0;

    return (
        <div style={{ backgroundColor: '#0d1117', minHeight: '100vh', color: '#c9d1d9', fontFamily: 'monospace', padding: '30px' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '25px' }}>
                
                <header style={{ borderBottom: '1px solid #30363d', paddingBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1 style={{ margin: 0, fontSize: '20px', color: '#58a6ff', fontWeight: 'bold' }}>ADMIN PANEL</h1>
                    <button onClick={() => { localStorage.removeItem('admin_token'); window.location.reload(); }} style={{ background: '#da3633', border: 'none', padding: '8px 16px', color: '#fff', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>LOGOUT</button>
                </header>

                <nav style={{ display: 'flex', gap: '10px', borderBottom: '1px solid #21262d', paddingBottom: '10px' }}>
                    <button onClick={() => setActiveTab("results")} style={{ background: activeTab === "results" ? "#21262d" : "transparent", border: activeTab === "results" ? "1px solid #30363d" : "none", color: activeTab === "results" ? "#58a6ff" : "#8b949e", padding: '8px 14px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Results Matrix</button>
                    <button onClick={() => setActiveTab("explorer")} style={{ background: activeTab === "explorer" ? "#21262d" : "transparent", border: activeTab === "explorer" ? "1px solid #30363d" : "none", color: activeTab === "explorer" ? "#58a6ff" : "#8b949e", padding: '8px 14px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Candidates list</button>
                    <button onClick={() => setActiveTab("integrity")} style={{ background: activeTab === "integrity" ? "#21262d" : "transparent", border: activeTab === "integrity" ? "1px solid #30363d" : "none", color: activeTab === "integrity" ? "#da3633" : "#8b949e", padding: '8px 14px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Security Options</button>
                </nav>

                {activeTab !== "integrity" && (
                    <div style={{ background: '#161b22', border: '1px solid #30363d', padding: '15px 20px', borderRadius: '6px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '12px', color: '#8b949e', fontWeight: 'bold' }}>Select Constituency:</label>
                        <select value={selectedCode} onChange={e => setSelectedCode(e.target.value)} style={{ background: '#0d1117', border: '1px solid #30363d', padding: '10px', color: '#c9d1d9', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', width: '100%' }}>
                            {constituencies.length === 0 ? <option value="">No Constituencies Found</option> : constituencies.map(c => <option key={c.constituencyCode} value={c.constituencyCode}>{c.constituencyName} ({c.constituencyCode})</option>)}
                        </select>
                    </div>
                )}

                {/* --- MENU: RESULTS MATRIX --- */}
                {activeTab === "results" && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div style={{ background: '#161b22', border: '1px solid #30363d', padding: '20px', borderRadius: '6px' }}>
                            <h3 style={{ margin: '0 0 15px 0', fontSize: '14px', color: '#58a6ff' }}>Vote Standings</h3>
                            {sortedStandings.length === 0 ? (
                                <div style={{ color: '#8b949e', fontSize: '12px', fontStyle: 'italic' }}>No standings data available.</div>
                            ) : (
                                sortedStandings.map(([displayIdentifier, votes], idx) => (
                                    <div key={displayIdentifier} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '8px 0', borderBottom: '1px solid #21262d' }}>
                                        <span>{idx + 1}. {displayIdentifier}</span>
                                        <span style={{ fontWeight: 'bold', color: votes > 0 && idx === 0 ? '#2ea44f' : '#c9d1d9' }}>{votes} Votes</span>
                                    </div>
                                ))
                            )}
                        </div>
                        <div style={{ background: '#161b22', border: '1px solid #30363d', padding: '20px', borderRadius: '6px' }}>
                            <h3 style={{ margin: '0 0 15px 0', fontSize: '14px', color: '#2ea44f' }}>Calculated Margins</h3>
                            {sortedStandings.length <= 1 || leadVotes === 0 ? (
                                <div style={{ color: '#8b949e', fontSize: '12px', fontStyle: 'italic' }}>No data to compute running margins.</div>
                            ) : (
                                sortedStandings.slice(1).map(([displayIdentifier, votes]) => (
                                    <div key={displayIdentifier} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '8px 0', borderBottom: '1px solid #21262d' }}>
                                        <span style={{ color: '#8b949e' }}>{sortedStandings[0][0].split(" (ID:")[0]} vs {displayIdentifier.split(" (ID:")[0]}</span>
                                        <span style={{ fontWeight: 'bold', color: '#da3633' }}>-{leadVotes - votes} Votes</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* --- MENU: CANDIDATES LIST --- */}
                {activeTab === "explorer" && (
                    <div style={{ background: '#161b22', border: '1px solid #30363d', padding: '20px', borderRadius: '6px' }}>
                        <h3 style={{ margin: '0 0 15px 0', fontSize: '14px', color: '#58a6ff' }}>Registered Candidates</h3>
                        {regionalCandidates.length === 0 ? (
                            <div style={{ color: '#8b949e', fontSize: '12px', fontStyle: 'italic' }}>No candidates found for this region selection.</div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                {regionalCandidates.map((cand) => (
                                    <div key={cand.id} style={{ background: '#0d1117', border: '1px solid #30363d', padding: '15px', borderRadius: '4px' }}>
                                        <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#fff' }}>{cand.name}</div>
                                        <div style={{ fontSize: '12px', color: '#8b949e', marginTop: '6px' }}>Party: <span style={{ color: '#58a6ff' }}>{cand.party}</span></div>
                                        <div style={{ fontSize: '11px', color: '#58a6ff', marginTop: '2px' }}>ID: {cand.id}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* --- MENU: AUDIT SECURITY INTEGRITY --- */}
                {activeTab === "integrity" && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                        
                        <div style={{ background: '#161b22', border: '1px solid #30363d', padding: '20px', borderRadius: '6px' }}>
                            <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#2ea44f', fontWeight: 'bold' }}>Verify Vote Integrity</h3>
                            <p style={{ margin: '0 0 15px 0', fontSize: '12px', color: '#8b949e', lineHeight: '1.4' }}>Run optimized scan loop checking cryptographic records row-by-row and validating ledger turnout boundaries.</p>
                            <button onClick={runIntegrityCheck} style={{ background: '#21262d', border: '1px solid #30363d', color: '#2ea44f', padding: '10px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', marginBottom: '15px' }}>Run Integrity Verification</button>
                            
                            {integrityStatus && (
                                <div style={{ 
                                    backgroundColor: integrityStatus.type === 'success' ? '#dcfee5' : '#ffebe9', 
                                    color: integrityStatus.type === 'success' ? '#24292e' : '#c44137', 
                                    border: `1px solid ${integrityStatus.type === 'success' ? '#bef5cb' : '#ffc1bd'}`, 
                                    padding: '12px 15px', 
                                    borderRadius: '4px', 
                                    fontSize: '13px',
                                    fontWeight: 'bold',
                                    lineHeight: '1.4'
                                }}>
                                    {integrityStatus.message}
                                </div>
                            )}
                        </div>

                        {/* Renders the dynamic tamper data list table */}
                        {tamperLogs.length > 0 && (
                            <div style={{ background: '#161b22', border: '1px solid #da3633', padding: '20px', borderRadius: '6px' }}>
                                <h3 style={{ margin: '0 0 15px 0', fontSize: '14px', color: '#da3633', fontWeight: 'bold' }}>ISOLATED BALLOT SYSTEM ANOMALIES</h3>
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '2px solid #30363d', color: '#8b949e' }}>
                                                <th style={{ padding: '10px 5px' }}>TARGET ID</th>
                                                <th style={{ padding: '10px 5px' }}>CONSTITUENCY INFO</th>
                                                <th style={{ padding: '10px 5px' }}>VIOLATION TYPE CLASSIFICATION</th>
                                                <th style={{ padding: '10px 5px', textAlign: 'right' }}>AUDIT TIMESTAMP</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {tamperLogs.map((log, index) => {
                                                const isRegionAlert = log.ballotId === "REGION_ALERT";
                                                return (
                                                    <tr key={index} style={{ borderBottom: '1px solid #21262d', color: '#c9d1d9', background: isRegionAlert ? '#da36330a' : 'transparent' }}>
                                                        <td style={{ padding: '12px 5px', color: '#da3633', fontWeight: 'bold' }}>
                                                            {isRegionAlert ? "⚠️ SYSTEM" : `#${log.ballotId}`}
                                                        </td>
                                                        <td style={{ padding: '12px 5px' }}>
                                                            <div>{log.constituencyName}</div>
                                                            <div style={{ fontSize: '11px', color: '#58a6ff', marginTop: '2px' }}>Code: {log.constituencyCode}</div>
                                                        </td>
                                                        <td style={{ padding: '12px 5px' }}>
                                                            <span style={{ 
                                                                display: 'inline-block',
                                                                padding: '3px 8px', 
                                                                borderRadius: '4px', 
                                                                fontSize: '11px', 
                                                                fontWeight: 'bold',
                                                                background: isRegionAlert ? '#ffdbdb' : '#21262d',
                                                                color: isRegionAlert ? '#bd2c00' : '#ffc1bd'
                                                            }}>
                                                                {log.violationType || "CRYPTOGRAPHIC_SIGNATURE_MISMATCH"}
                                                            </span>
                                                        </td>
                                                        <td style={{ padding: '12px 5px', textAlign: 'right', color: '#8b949e' }}>{log.timestamp}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Secure Destruction Confirmation Panel */}
                        <div style={{ background: '#161b22', border: '1px solid #da3633', padding: '20px', borderRadius: '6px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <h3 style={{ margin: 0, fontSize: '14px', color: '#da3633', fontWeight: 'bold' }}>Wipe Electronic Votes</h3>
                            <p style={{ margin: 0, fontSize: '12px', color: '#8b949e', lineHeight: '1.4' }}>Completely wipe all records from the database storage logs. This action cannot be reversed.</p>
                            
                            <div style={{ background: '#0d1117', border: '1px solid #30363d', padding: '15px', borderRadius: '4px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <label style={{ fontSize: '12px', color: '#c9d1d9' }}>To protect against accidental clicking, type the string sequence exactly below to unlock action permissions:</label>
                                <span style={{ fontSize: '13px', color: '#da3633', fontWeight: 'bold', letterSpacing: '1px' }}>ERASE_EVM_VOTES</span>
                                <input type="text" placeholder="Type confirmation here..." value={safetyWipeConfirmation} onChange={e => setSafetyWipeConfirmation(e.target.value)} style={{ background: '#161b22', border: '1px solid #30363d', padding: '10px', color: '#fff', borderRadius: '4px', outline: 'none', fontSize: '13px' }} />
                            </div>
                            
                            <button onClick={triggerZeroize} disabled={safetyWipeConfirmation !== "ERASE_EVM_VOTES"} style={{ background: safetyWipeConfirmation === "ERASE_EVM_VOTES" ? '#da3633' : '#21262d', border: 'none', color: safetyWipeConfirmation === "ERASE_EVM_VOTES" ? '#fff' : '#484f58', padding: '12px', borderRadius: '4px', cursor: safetyWipeConfirmation === "ERASE_EVM_VOTES" ? 'pointer' : 'not-allowed', fontWeight: 'bold', fontSize: '12px' }}>Confirm and Wipe Database Logs</button>
                            
                            {wipeStatus && (
                                <div style={{ 
                                    backgroundColor: wipeStatus.type === 'success' ? '#dcfee5' : '#ffebe9', 
                                    color: wipeStatus.type === 'success' ? '#24292e' : '#c44137', 
                                    border: `1px solid ${wipeStatus.type === 'success' ? '#bef5cb' : '#ffc1bd'}`, 
                                    padding: '12px 15px', 
                                    borderRadius: '4px', 
                                    fontSize: '13px',
                                    fontWeight: 'bold'
                                }}>
                                    {wipeStatus.message}
                                </div>
                            )}
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
}