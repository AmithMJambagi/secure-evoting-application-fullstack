import React, { useState, useEffect } from 'react';
import API from './apiConfig';

export default function VotingBooth({ sessionData, onSessionTerminate }) {
    const [candidates, setCandidates] = useState([]);
    const [selectedCandidateId, setSelectedCandidateId] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');
    const [loading, setLoading] = useState(false);
    
    // Lifecycle states for visual messaging loops
    const [showThankYou, setShowThankYou] = useState(false);
    const [showLoggedOut, setShowLoggedOut] = useState(false);
    
    // Safety verification overlay modal toggle flag
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    // Fetch matching regional candidates on mount using the voter's active security token context
    useEffect(() => {
        if (sessionData && sessionData.token) {
            loadBallotPaper(sessionData.token);
        } else {
            setErrorMsg("Missing secure signature. Please re-authenticate.");
        }
    }, [sessionData]);

    const loadBallotPaper = async (token) => {
        try {
            const res = await API.get('/api/public/candidates', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const targetConstituency = sessionData?.constituencyCode; 
            const isolatedCandidates = res.data.filter(
                c => c.constituencyCode === targetConstituency
            );
            
            setCandidates(isolatedCandidates);
        } catch (err) {
            setErrorMsg(err.response?.data?.message || "Failed to load constituency ballot configurations.");
        }
    };

    // Finds the fully qualified candidate object model details from matching state criteria 
    const targetCandidateProfile = candidates.find(c => c.candidateId === selectedCandidateId);

    const handleOpenConfirmationWorkflow = () => {
        if (!selectedCandidateId) {
            alert("Please select a candidate option matrix row before submitting.");
            return;
        }
        setErrorMsg('');
        setShowConfirmModal(true); 
    };

    const handleCastVoteSubmit = async () => {
        setShowConfirmModal(false);
        setLoading(true);

        try {
            await API.post('/api/votes/cast', 
                { candidateId: parseInt(selectedCandidateId) },
                {
                    headers: {
                        'Authorization': `Bearer ${sessionData.token}`
                    }
                }
            );
            
            setShowThankYou(true);
            
            setTimeout(() => {
                sessionStorage.clear(); 
                setShowThankYou(false);
                setShowLoggedOut(true);
                
                setTimeout(() => {
                    onSessionTerminate();
                }, 2500);
            }, 2500);

        } catch (err) {
            setErrorMsg(err.response?.data?.message || "Ballot transmission failure. Vote rejected.");
            setLoading(false);
        }
    };

    const handleAbortSession = () => {
        sessionStorage.clear();
        setShowLoggedOut(true);
        setTimeout(() => {
            onSessionTerminate();
        }, 2000);
    };

    // VIEW STATE A: SUCCESSFUL ANONYMOUS VERIFICATION MESSAGE
    if (showThankYou) {
        return (
            <div style={styles.masterViewportCentering}>
                <div className="voter-standalone-card" style={{ textAlign: 'center', padding: '40px 24px' }}>
                    <div style={styles.stack}>
                        <div style={{ fontSize: '48px', color: '#238636' }}>✓</div>
                        <h2 style={{ color: '#C9D1D9', fontSize: '18px', fontWeight: '700', margin: 0 }}>
                            VOTE SAVED SAFELY AND ANONYMOUSLY
                        </h2>
                        <p style={{ color: '#8B949E', fontSize: '13px', lineHeight: '1.6', margin: 0 }}>
                            Thank you for executing your civic signature. Your structural record key has been zeroed out, and the ledger transaction balance payload was successfully finalized.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // VIEW STATE B: EXPLICIT LOGOUT NOTIFICATION PANEL
    if (showLoggedOut) {
        return (
            <div style={styles.masterViewportCentering}>
                <div className="voter-standalone-card" style={{ textAlign: 'center', padding: '40px 24px' }}>
                    <div style={styles.stack}>
                        <div style={{ fontSize: '48px', color: '#f85149' }}>⏏</div>
                        <h2 style={{ color: '#C9D1D9', fontSize: '18px', fontWeight: '700', margin: 0 }}>
                            YOU ARE LOGGED OUT
                        </h2>
                        <p style={{ color: '#8B949E', fontSize: '12px', margin: 0 }}>
                            Your secure session link windows have been securely wiped and closed.
                        </p>
                        <span style={{ color: '#58A6FF', fontSize: '11px', fontFamily: 'monospace', marginTop: '10px' }}>
                            Redirecting to identity authentication panel...
                        </span>
                    </div>
                </div>
            </div>
        );
    }

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
                @media (max-width: 480px) {
                    .voter-standalone-card {
                        padding: 20px !important;
                        border: none !important;
                        background: transparent !important;
                        box-shadow: none !important;
                    }
                    .responsive-action-row {
                        flex-direction: column-reverse !important;
                        gap: 12px !important;
                    }
                    .responsive-action-row button {
                        width: 100% !important;
                    }
                }
            `}</style>

            <div className="voter-standalone-card">
                {errorMsg && <div style={styles.errorAlert}>{errorMsg}</div>}

                <div style={styles.stack}>
                    <header style={styles.header}>
                        <h1 style={styles.titleText}>DIGITAL BALLOT BOOTH</h1>
                        <div style={styles.badge}>
                            ACTIVE DISTRICT: <span style={{ color: '#58A6FF' }}>{sessionData?.constituencyCode || 'UNASSIGNED'}</span>
                        </div>
                        {sessionData?.constituencyName && (
                            <span style={{ color: '#8B949E', fontSize: '11px', fontFamily: 'monospace', marginTop: '2px' }}>
                                {sessionData.constituencyName}
                            </span>
                        )}
                        <p style={styles.subText}>Select one candidate option matrix row identifier below:</p>
                    </header>

                    <div style={styles.ballotGrid}>
                        {candidates.length === 0 ? (
                            <p style={{ color: '#8B949E', fontSize: '12px', textAlign: 'center', padding: '20px' }}>
                                No candidates found standing for this regional constituency division profile.
                            </p>
                        ) : (
                            candidates.map((c) => {
                                const isSelected = selectedCandidateId === c.candidateId;
                                return (
                                    <div 
                                        key={c.candidateId} 
                                        onClick={() => !loading && setSelectedCandidateId(c.candidateId)}
                                        style={{
                                            ...styles.ballotCard,
                                            borderColor: isSelected ? '#58A6FF' : '#21262D',
                                            backgroundColor: isSelected ? '#161B22' : '#0D1117'
                                        }}
                                    >
                                        <div style={styles.details}>
                                            <span style={styles.candidateName}>{c.name}</span>
                                            <span style={styles.candidateParty}>Faction: {c.party}</span>
                                        </div>
                                        
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                                                <span style={styles.badge}>{c.constituencyCode}</span>
                                            </div>
                                            <div style={{ 
                                                ...styles.radio, 
                                                borderColor: isSelected ? '#58A6FF' : '#484f58',
                                                backgroundColor: isSelected ? '#58A6FF' : 'transparent'
                                            }}>
                                                {isSelected && <div style={styles.radioInner} />}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    <div className="responsive-action-row" style={styles.actionRow}>
                        <button 
                            type="button" 
                            onClick={handleAbortSession} 
                            disabled={loading} 
                            style={styles.cancelBtn}
                        >
                            ABORT SESSION
                        </button>
                        <button 
                            type="button" 
                            onClick={handleOpenConfirmationWorkflow} 
                            disabled={loading || !selectedCandidateId} 
                            style={loading ? styles.disabledBtn : styles.successBtn}
                        >
                            {loading ? "TRANSMITTING..." : "CAST SIGNED BALLOT"}
                        </button>
                    </div>
                </div>
            </div>

            {/* CONFIRMATION OVERLAY MODAL - VVPAT DIGITAL SELECTION SLIP */}
            {showConfirmModal && targetCandidateProfile && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalCard}>
                        <h3 style={styles.modalTitle}>VERIFY VVPAT ELECTRONIC SLIP</h3>
                        <p style={styles.modalWarningText}>
                            Please re-verify your regional ballot envelope print block carefully. This cryptographic transaction identity action cannot be modified once confirmed.
                        </p>
                        
                        <div style={styles.vvpatSlipContainer}>
                            <div style={styles.vvpatWatermark}>ECI VVPAT SLIP</div>
                            <div style={styles.reviewRow}>
                                <span style={styles.reviewLabel}>CANDIDATE:</span>
                                <span style={styles.reviewValue}>{targetCandidateProfile.name}</span>
                            </div>
                            <div style={styles.reviewRow}>
                                <span style={styles.reviewLabel}>PARTY FACTION:</span>
                                <span style={styles.reviewValue}>{targetCandidateProfile.party}</span>
                            </div>
                            <div style={styles.reviewRow}>
                                <span style={styles.reviewLabel}>ECI INDEX NO:</span>
                                <span style={{ ...styles.reviewValue, fontFamily: 'monospace', color: '#58A6FF', fontWeight: 'bold' }}>
                                    {targetCandidateProfile.candidateId}
                                </span>
                            </div>
                            <div style={styles.reviewRow}>
                                <span style={styles.reviewLabel}>SECTOR REGION:</span>
                                <span style={{ ...styles.reviewValue, fontFamily: 'monospace' }}>
                                    {targetCandidateProfile.constituencyCode} {sessionData?.constituencyName ? `(${sessionData.constituencyName})` : ''}
                                </span>
                            </div>
                        </div>

                        <div style={styles.modalActionRow}>
                            <button 
                                type="button" 
                                onClick={() => setShowConfirmModal(false)} 
                                style={styles.modalBackBtn}
                            >
                                GO BACK
                            </button>
                            <button 
                                type="button" 
                                onClick={handleCastVoteSubmit} 
                                style={styles.modalConfirmBtn}
                            >
                                CONFIRM & VOTE
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const styles = {
    // Aligns the booth to lock seamlessly into the absolute viewport center matrix exactly like LoginRegister
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
    stack: { display: 'flex', flexDirection: 'column', gap: '20px' },
    header: { display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'center' },
    titleText: { color: '#C9D1D9', fontSize: '13px', fontWeight: '700', letterSpacing: '1.5px', margin: 0 },
    badge: { fontSize: '10px', fontFamily: 'monospace', background: '#0d1117', color: '#8B949E', padding: '4px 10px', borderRadius: '4px', alignSelf: 'center', marginTop: '4px', border: '1px solid #30363D' },
    subText: { color: '#8B949E', fontSize: '11px', margin: '6px 0 0 0' },
    ballotGrid: { display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '260px', overflowY: 'auto', paddingRight: '4px' },
    ballotCard: { border: '1px solid', borderRadius: '4px', padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', transition: 'all 0.15s ease' },
    details: { display: 'flex', flexDirection: 'column', gap: '2px', textAlign: 'left' },
    candidateName: { color: '#C9D1D9', fontSize: '13px', fontWeight: '600' },
    candidateParty: { color: '#8B949E', fontSize: '11px', fontFamily: 'monospace' },
    radio: { width: '16px', height: '16px', borderRadius: '50%', border: '2px solid', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s ease' },
    radioInner: { width: '6px', height: '6px', borderRadius: '50%', background: '#0D1117' },
    actionRow: { display: 'flex', gap: '10px', marginTop: '4px' },
    successBtn: { flex: 1, background: '#238636', border: '1px solid #2ea44f', color: '#fff', padding: '12px', borderRadius: '4px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' },
    disabledBtn: { flex: 1, background: '#21262D', border: '1px solid #30363D', color: '#8B949E', padding: '12px', borderRadius: '4px', fontSize: '12px', fontWeight: '600', cursor: 'not-allowed' },
    cancelBtn: { background: 'transparent', border: '1px solid #30363d', color: '#f85149', padding: '12px 16px', borderRadius: '4px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' },
    errorAlert: { background: 'rgba(248,81,81,0.1)', border: '1px solid rgba(248,81,81,0.2)', color: '#F85149', padding: '10px', borderRadius: '4px', fontSize: '11px', marginBottom: '12px', textAlign: 'center' },
    
    // VVPAT Overlay Styling Components
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100000, padding: '20px' },
    modalCard: { width: '100%', maxWidth: '400px', background: '#161B22', border: '1px solid #30363D', borderRadius: '6px', padding: '24px', boxSizing: 'border-box', boxShadow: '0 10px 40px rgba(0,0,0,0.6)', display: 'flex', flexDirection: 'column', gap: '16px' },
    modalTitle: { color: '#C9D1D9', fontSize: '13px', fontWeight: '700', margin: 0, letterSpacing: '1px', textAlign: 'center' },
    modalWarningText: { color: '#8B949E', fontSize: '11px', margin: 0, lineHeight: '1.5', textAlign: 'center' },
    vvpatSlipContainer: { background: '#f8f9fa', border: '2px dashed #30363D', borderRadius: '4px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '10px', position: 'relative', overflow: 'hidden' },
    vvpatWatermark: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(-15deg)', color: 'rgba(0, 0, 0, 0.04)', fontSize: '28px', fontWeight: 'bold', fontFamily: 'monospace', pointerEvents: 'none', whiteSpace: 'nowrap' },
    reviewRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', fontSize: '12px' },
    reviewLabel: { color: '#484f58', fontWeight: '700', minWidth: '90px', textAlign: 'left', fontSize: '11px', fontFamily: 'monospace' },
    reviewValue: { color: '#0d1117', textAlign: 'right', fontWeight: '600' },
    modalActionRow: { display: 'flex', gap: '10px', marginTop: '4px' },
    modalConfirmBtn: { flex: 1, background: '#238636', border: '1px solid #2ea44f', color: '#fff', padding: '12px', borderRadius: '4px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' },
    modalBackBtn: { background: 'transparent', border: '1px solid #30363D', color: '#8B949E', padding: '12px 18px', borderRadius: '4px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }
};