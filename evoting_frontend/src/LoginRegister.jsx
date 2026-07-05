import React, { useState, useEffect, useRef } from 'react';
import API from './apiConfig';

export default function LoginRegister({ onAuthSuccess }) {
    // Phase Matrix State System: 'browse', 'credentials', 'otp'
    const [viewMode, setViewMode] = useState('browse'); 
    const [constituencyList, setConstituencyList] = useState([]); 
    const [publicCandidates, setPublicCandidates] = useState([]);
    const [selectedFilterCode, setSelectedFilterCode] = useState('ALL'); 
    
    // Controlled Form Elements
    const [voterId, setVoterId] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    
    // Core Temporal Enforcements
    const [expiryTime, setExpiryTime] = useState(300);    
    const [cooldown, setCooldown] = useState(150);       
    const [resendCount, setResendCount] = useState(0);   
    
    // Interface Feedback Flags
    const [errorMsg, setErrorMsg] = useState('');
    const [infoMsg, setInfoMsg] = useState('');
    const [loading, setLoading] = useState(false);

    // Persistent Reference Clocks
    const expiryIntervalRef = useRef(null);
    const cooldownIntervalRef = useRef(null);

    // Sync Public Directory Log & Constituencies list
    useEffect(() => {
        if (viewMode === 'browse') {
            loadConstituencyMetadata();
            loadPublicRegistry();
        }
        return () => clearAllActiveIntervals();
    }, [viewMode]);

    // Active Lifecycle Timer Management
    useEffect(() => {
        if (viewMode === 'otp') {
            expiryIntervalRef.current = setInterval(() => {
                setExpiryTime((prev) => {
                    if (prev <= 1) {
                        clearInterval(expiryIntervalRef.current);
                        handleSessionTimeoutRollback();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            if (cooldown > 0) {
                cooldownIntervalRef.current = setInterval(() => {
                    setCooldown((prev) => {
                        if (prev <= 1) {
                            clearInterval(cooldownIntervalRef.current);
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);
            }
        }

        return () => clearAllActiveIntervals();
    }, [viewMode, cooldown]);

    const clearAllActiveIntervals = () => {
        if (expiryIntervalRef.current) clearInterval(expiryIntervalRef.current);
        if (cooldownIntervalRef.current) clearInterval(cooldownIntervalRef.current);
    };

    const handleSessionTimeoutRollback = () => {
        setErrorMsg("Security session expired. The 5-minute authentication window has closed. Please re-enter credentials.");
        setOtp('');
        setViewMode('credentials'); 
    };

    const loadConstituencyMetadata = async () => {
        try {
            const res = await API.get('/api/public/constituencies');
            setConstituencyList(res.data);
        } catch (err) {
            setConstituencyList([
               
            ]);
        }
    };

    const loadPublicRegistry = async () => {
        try {
            const res = await API.get('/api/public/candidates');
            setPublicCandidates(res.data);
        } catch (err) {
            setPublicCandidates([
               
            ]);
        }
    };

    // Advanced dynamic text interceptor processing nested/double-serialized JSON blocks
    const extractStringMessage = (errorObj) => {
        if (!errorObj?.response?.data) return null;
        const data = errorObj.response.data;
        
        let resolvedData = data;
        if (typeof data === 'string') {
            try { resolvedData = JSON.parse(data); } catch (e) { return data.trim(); }
        }

        // Intercept standard output attributes
        let targetMessage = resolvedData?.message || resolvedData?.detail;
        
        if (targetMessage && typeof targetMessage === 'string') {
            const trimmedMessage = targetMessage.trim();
            // Deep Extraction: If the payload text value is a nested JSON object structure string
            if (trimmedMessage.startsWith('{')) {
                try {
                    const nestedJson = JSON.parse(trimmedMessage);
                    if (nestedJson?.message) {
                        return nestedJson.message;
                    }
                } catch (parseError) {
                    return trimmedMessage;
                }
            }
            return trimmedMessage;
        }
        
        return null;
    };

    const handleCredentialSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg(''); 
        setInfoMsg('');
        setLoading(true);

        try {
            const res = await API.post('/sessions/request-otp', { voterId, password });
            if (res.status === 200 || res.data?.message === "OTP sent successfully") {
                setExpiryTime(300); 
                setCooldown(150);   
                setResendCount(0);  
                setViewMode('otp');  
            } else {
                setErrorMsg(res.data?.message || res.data?.detail || "Failed to dispatch authentication token.");
            }
        } catch (err) {
            const explicitMessage = extractStringMessage(err);
            
            if (explicitMessage) {
                setErrorMsg(explicitMessage);
            } else if (err.response?.status === 429) {
                setErrorMsg("Rate limit error: Please wait before retrying.");
            } else {
                setErrorMsg("Access Denied: Invalid credentials or account validation mismatch.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (cooldown > 0 || resendCount >= 1) return;
        setErrorMsg(''); 
        setInfoMsg('');

        try {
            await API.post('/sessions/request-otp', { voterId, password });
            setInfoMsg("Replacement verification token dispatched. Original 5-minute deadline remains unchanged.");
            setResendCount(1);  
            setCooldown(150);   
        } catch (err) {
            const explicitMessage = extractStringMessage(err);
            setErrorMsg(explicitMessage || "Rate limit exception: Request dropped by server protection layers.");
        }
    };

    const handleOtpValidationSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setLoading(true);

        try {
            const res = await API.post('/sessions/verify-otp', { voterId, otp });
            clearAllActiveIntervals();
            if (res.data && res.data.token) {
                sessionStorage.setItem('token', res.data.token);
            }
            onAuthSuccess(res.data); 
        } catch (err) {
            const explicitMessage = extractStringMessage(err);
            setErrorMsg(explicitMessage || "Verification failed. Token invalid.");
        } finally {
            setLoading(false);
        }
    };

    const formatClock = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const filteredCandidates = selectedFilterCode === 'ALL' 
        ? publicCandidates 
        : publicCandidates.filter(c => c.constituencyCode === selectedFilterCode);

    return (
        <div style={styles.masterViewportCentering}>
            <style>{`
                .voter-standalone-card {
                    width: 100%;
                    max-width: 460px;
                    background: #161b22;
                    border: 1px solid #30363d;
                    border-radius: 6px;
                    padding: 35px;
                    box-sizing: border-box;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
                    transition: all 0.2s ease;
                }
                .centered-dropdown {
                    background: #0d1117;
                    border: 1px solid #30363d;
                    color: #c9d1d9;
                    padding: 12px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-family: monospace;
                    font-size: 13px;
                    outline: none;
                    width: 100%;
                    text-align-last: center;
                }
                .prominent-login-btn {
                    background: #238636 !important;
                    border: 1px solid #2ea44f !important;
                    color: #fff !important;
                    padding: 12px 24px !important;
                    border-radius: 4px !important;
                    font-size: 14px !important;
                    font-weight: bold !important;
                    cursor: pointer !important;
                    letter-spacing: 0.5px !important;
                    box-shadow: 0 4px 12px rgba(35, 134, 54, 0.3) !important;
                }
                .prominent-login-btn:hover {
                    background: #2ea44f !important;
                }
                @media (max-width: 480px) {
                    .voter-standalone-card {
                        padding: 20px !important;
                        border: none !important;
                        background: transparent !important;
                        box-shadow: none !important;
                    }
                    .responsive-toolbar {
                        flex-direction: column !important;
                        gap: 16px !important;
                        text-align: center;
                        align-items: center !important;
                    }
                    .responsive-toolbar button {
                        width: 100% !important;
                    }
                }
            `}</style>

            <div className="voter-standalone-card">
                {errorMsg && <div style={styles.errorAlert}>{errorMsg}</div>}
                {infoMsg && <div style={styles.infoAlert}>{infoMsg}</div>}

                {/* STAGE 1: OPEN BROWSING MATRIX */}
                {viewMode === 'browse' && (
                    <div style={styles.stack}>
                        <div className="responsive-toolbar" style={styles.toolbarRow}>
                            <div>
                                <h2 style={styles.panelTitle}>CONSTITUENCY BALLOTS</h2>
                                <span style={styles.panelSubtitle}>Open public registry logs</span>
                            </div>
                            <button onClick={() => setViewMode('credentials')} className="prominent-login-btn">
                                LOGIN TO VOTE
                            </button>
                        </div>

                        <div style={styles.filterContainer}>
                            <label style={{ color: '#8b949e', fontSize: '11px', fontWeight: 'bold', marginBottom: '8px', display: 'block' }}>
                                SELECT REGION RANGE DETAILED DIRECTORY
                            </label>
                            <select 
                                value={selectedFilterCode} 
                                onChange={e => setSelectedFilterCode(e.target.value)}
                                className="centered-dropdown"
                            >
                                <option value="ALL">All Active Constituencies</option>
                                {constituencyList.map(c => (
                                    <option key={c.constituencyCode} value={c.constituencyCode}>
                                        {c.constituencyName} ({c.constituencyCode})
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <div style={styles.scrollArea}>
                            {filteredCandidates.length === 0 ? (
                                <div style={styles.emptyView}>No candidates registered yet for this regional sector code.</div>
                            ) : (
                                filteredCandidates.map(c => (
                                    <div key={c.candidateId} style={styles.inlineCard}>
                                        <div style={styles.cardHeaderRow}>
                                            <span style={styles.candidateName}>{c.name}</span>
                                            <span style={styles.zoneBadge}>{c.constituencyCode}</span>
                                        </div>
                                        <div style={styles.cardDetailRow}>
                                            <span>Party Name: {c.party}</span>
                                            <span style={styles.idSubtext}>ECI ID: {c.candidateId}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* STAGE 2: CREDENTIAL VERIFICATION PANEL */}
                {viewMode === 'credentials' && (
                    <form onSubmit={handleCredentialSubmit} style={styles.stack}>
                        <div style={styles.centerHeader}>
                            <h2 style={styles.titleText}>SECURE ACCESS IDENTITY</h2>
                            <p style={styles.subText}>Enter ledger profile key metrics to request 2FA token</p>
                        </div>
                        <input type="text" placeholder="VOTER REGISTER ID" value={voterId} onChange={e => setVoterId(e.target.value)} required style={styles.input} />
                        <input type="password" placeholder="SECURITY PASSCODE" value={password} onChange={e => setPassword(e.target.value)} required style={styles.input} />
                        <div style={styles.buttonSplitRow}>
                            <button type="button" onClick={() => setViewMode('browse')} style={styles.secondaryBtn}>CANCEL</button>
                            <button type="submit" disabled={loading} style={styles.primaryBtn}>
                                {loading ? "VALIDATING..." : "GENERATE OTP TOKEN"}
                            </button>
                        </div>
                    </form>
                )}

                {/* STAGE 3: INTERACTIVE 2FA CHALLENGE ENGINE */}
                {viewMode === 'otp' && (
                    <form onSubmit={handleOtpValidationSubmit} style={styles.stack}>
                        <div style={styles.centerHeader}>
                            <h2 style={styles.titleText}>SECURITY VERIFICATION MATRIX</h2>
                            <p style={styles.subText}>Input the 6-character payload delivered to your registered device</p>
                        </div>
                        <div style={styles.timerMetaRow}>
                            <span>Session Window Remaining: <strong style={{ color: '#f85149' }}>{formatClock(expiryTime)}</strong></span>
                            {cooldown > 0 ? (
                                <span style={styles.cooldownText}>Resend Lock: {formatClock(cooldown)}</span>
                            ) : resendCount < 1 ? (
                                <button type="button" onClick={handleResendOtp} style={styles.linkActionBtn}>Resend OTP</button>
                            ) : (
                                <span style={styles.lockoutText}>Resend Cap Reached</span>
                            )}
                        </div>
                        <input type="text" placeholder="000000" maxLength="6" value={otp} onChange={e => setOtp(e.target.value)} required style={styles.otpInput} />
                        <button type="submit" disabled={loading} style={styles.successBtn}>
                            {loading ? "SEALING IDENTITY ENVELOPE..." : "VERIFY IDENTITY SIGNATURE"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}

const styles = {
    masterViewportCentering: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0d1117',
        zIndex: 99999,
        padding: '20px',
        boxSizing: 'border-box'
    },
    stack: { display: 'flex', flexDirection: 'column', gap: '16px' },
    toolbarRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', width: '100%' },
    panelTitle: { color: '#C9D1D9', fontSize: '14px', margin: 0, fontWeight: '700', letterSpacing: '1px' },
    panelSubtitle: { color: '#8B949E', fontSize: '11px', display: 'block' },
    filterContainer: { background: '#0d1117', border: '1px solid #30363d', borderRadius: '4px', padding: '16px', width: '100%', boxSizing: 'border-box' },
    scrollArea: { display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '260px', overflowY: 'auto', paddingRight: '2px' },
    emptyView: { color: '#8B949E', fontSize: '12px', fontStyle: 'italic', textAlign: 'center', padding: '30px', background: '#0d1117', borderRadius: '4px', border: '1px solid #21262D' },
    inlineCard: { background: '#0d1117', border: '1px solid #21262D', borderRadius: '4px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '4px' },
    cardHeaderRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    candidateName: { color: '#C9D1D9', fontSize: '13px', fontWeight: '600' },
    zoneBadge: { fontSize: '9px', fontFamily: 'monospace', background: '#21262D', color: '#8B949E', padding: '2px 6px', borderRadius: '4px', border: '1px solid #30363D' },
    cardDetailRow: { display: 'flex', justifyContent: 'space-between', color: '#8B949E', fontSize: '11px' },
    idSubtext: { fontFamily: 'monospace', color: '#484f58' },
    centerHeader: { display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'center' },
    titleText: { color: '#C9D1D9', fontSize: '13px', fontWeight: '700', letterSpacing: '1px', margin: 0 },
    subText: { color: '#8B949E', fontSize: '11px', margin: 0 },
    input: { background: '#0d1117', border: '1px solid #30363D', borderRadius: '4px', color: '#C9D1D9', padding: '12px', fontSize: '13px', outline: 'none', boxSizing: 'border-box', width: '100%', fontFamily: 'monospace' },
    otpInput: { background: '#0d1117', border: '1px solid #30363D', borderRadius: '4px', color: '#58A6FF', padding: '14px', fontSize: '24px', fontFamily: 'monospace', fontWeight: '700', letterSpacing: '6px', textAlign: 'center', boxSizing: 'border-box', width: '100%', outline: 'none' },
    buttonSplitRow: { display: 'flex', gap: '10px' },
    primaryBtn: { flex: 1, background: '#1f6feb', border: '1px solid #388bfd', color: '#fff', padding: '12px', borderRadius: '4px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' },
    secondaryBtn: { background: 'transparent', border: '1px solid #30363D', color: '#8B949E', padding: '12px 20px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' },
    successBtn: { background: '#238636', border: '1px solid #2ea44f', color: '#fff', padding: '14px', borderRadius: '4px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', letterSpacing: '0.5px' },
    timerMetaRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#8B949E' },
    cooldownText: { color: '#8B949E', fontFamily: 'monospace' },
    lockoutText: { color: '#484f58', fontStyle: 'italic' },
    linkActionBtn: { background: 'none', border: 'none', color: '#58A6FF', cursor: 'pointer', textDecoration: 'underline', padding: 0, fontSize: '11px' },
    errorAlert: { background: 'rgba(248,81,81,0.1)', border: '1px solid rgba(248,81,81,0.2)', color: '#F85149', padding: '10px', borderRadius: '4px', fontSize: '11px', textAlign: 'center' },
    infoAlert: { background: 'rgba(56,139,253,0.1)', border: '1px solid rgba(56,139,253,0.2)', color: '#58A6FF', padding: '10px', borderRadius: '4px', fontSize: '11px', textAlign: 'center' }
};