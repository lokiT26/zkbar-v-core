import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { QRCodeSVG } from 'qrcode.react';
import { Wallet, Key, Shield, QrCode } from 'lucide-react';

export default function WalletPage() {
    const [wallet, setWallet] = useState(null);
    const [did, setDid] = useState('');
    const [credential, setCredential] = useState(null);
    const [loading, setLoading] = useState(false);
    const [studentIdInput, setStudentIdInput] = useState('');
    const [message, setMessage] = useState('');

    // Load existing wallet on mount
    useEffect(() => {
        const savedKey = localStorage.getItem('zkbar_private_key');
        const savedCred = localStorage.getItem('zkbar_vc');
        if (savedKey) {
            const loadedWallet = new ethers.Wallet(savedKey);
            setWallet(loadedWallet);
            setDid(`did:zkbar:${loadedWallet.address}`);
        }
        if (savedCred) {
            setCredential(JSON.parse(savedCred));
        }
    }, []);

    const generateWallet = () => {
        const newWallet = ethers.Wallet.createRandom();
        localStorage.setItem('zkbar_private_key', newWallet.privateKey);
        setWallet(newWallet);
        setDid(`did:zkbar:${newWallet.address}`);
    };

    const clearWallet = () => {
        if (window.confirm("Are you sure? This will delete your keys mapping locally.")) {
            localStorage.removeItem('zkbar_private_key');
            localStorage.removeItem('zkbar_vc');
            setWallet(null);
            setDid('');
            setCredential(null);
            setMessage('');
        }
    }

    const registerDid = async () => {
        if (!studentIdInput.trim()) return;
        setLoading(true);
        try {
            const res = await fetch('http://localhost:3000/api/register-did', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ studentId: studentIdInput, did })
            });
            const data = await res.json();
            if (data.success) {
                setMessage('✅ DID Registered successfully with University!');
            } else {
                setMessage('❌ Failed to register: ' + data.error);
            }
        } catch (error) {
            setMessage('❌ Error connecting to backend');
        } finally {
            setLoading(false);
        }
    };

    const syncWallet = async () => {
        setLoading(true);
        setMessage('');
        try {
            const res = await fetch(`http://localhost:3000/api/wallet/sync/${did}`);
            const data = await res.json();
            if (data.success) {
                setCredential(data.credential);
                localStorage.setItem('zkbar_vc', JSON.stringify(data.credential));
                setMessage('✅ Credential successfully synced to wallet!');
            } else {
                setMessage('❌ ' + (data.error || 'Failed to sync'));
            }
        } catch (error) {
            setMessage('❌ Error connecting to backend');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-panel" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Wallet /> Student Digital Wallet
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                Manage your Self-Sovereign Identity. Generate your Decentralized Identifier (DID) and hold your master private keys.
            </p>

            {!wallet ? (
                <div className="status-card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
                    <Key size={48} style={{ color: 'var(--accent-primary)', opacity: 0.8, margin: '0 auto 1rem' }} />
                    <h3 style={{ marginBottom: '1rem' }}>No Identity Found</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                        Create a cryptographic keypair to establish your unique, decentralized academic identity.
                    </p>
                    <button onClick={generateWallet} className="action-button">
                        Generate DID
                    </button>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div className="status-card" style={{ background: 'rgba(58, 141, 255, 0.05)', borderColor: 'rgba(58, 141, 255, 0.2)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: 'var(--accent-primary)', marginBottom: '1rem' }}>
                            <Shield size={20} /> Your Identity (DID)
                        </div>
                        <div style={{ wordBreak: 'break-all', fontFamily: 'monospace', fontSize: '1.25rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', border: '1px border var(--glass-border)' }}>
                            {did}
                        </div>

                        {/* Registration Section */}
                        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <input
                                type="text"
                                placeholder="Link your Student ID (e.g. STUDENT_123)"
                                className="form-input"
                                style={{ flex: 1 }}
                                value={studentIdInput}
                                onChange={(e) => setStudentIdInput(e.target.value)}
                            />
                            <button className="action-button" style={{ width: 'auto', padding: '0 1.5rem' }} onClick={registerDid} disabled={loading}>
                                Link ID
                            </button>
                            <button className="action-button" style={{ width: 'auto', padding: '0 1.5rem', background: 'var(--bg-panel)' }} onClick={syncWallet} disabled={loading}>
                                Sync VC
                            </button>
                        </div>

                        {message && (
                            <div style={{ marginTop: '1rem', fontSize: '0.875rem', fontWeight: 500, color: message.includes('❌') ? '#ff6b6b' : 'var(--accent-success)' }}>
                                {message}
                            </div>
                        )}

                        <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
                            <button onClick={clearWallet} style={{ background: 'transparent', border: '1px solid rgba(255,100,100,0.3)', color: '#ff6b6b', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.875rem' }}>
                                Clear Wallet (Danger)
                            </button>
                        </div>
                    </div>

                    {credential ? (
                        <div className="status-card" style={{ background: 'rgba(255, 255, 255, 0.05)', borderColor: 'var(--glass-border)' }}>
                            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-success)' }}>
                                <Shield size={20} /> Verified Academic Credential
                            </h3>
                            <div className="data-grid">
                                <div className="data-item">
                                    <div className="data-label">Degree</div>
                                    <div className="data-value">{credential.degreeName}</div>
                                </div>
                                <div className="data-item">
                                    <div className="data-label">GPA</div>
                                    <div className="data-value">{credential.gpa}</div>
                                </div>
                                <div className="data-item">
                                    <div className="data-label">Grad Year</div>
                                    <div className="data-value">{credential.graduationYear}</div>
                                </div>
                            </div>

                            <hr style={{ borderColor: 'var(--glass-border)', margin: '1.5rem 0' }} />

                            <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <QrCode size={18} /> Presentation QR Proof
                            </h4>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                                Show this QR code to verifiers. It packages your DID, document hash, and VC proofs.
                            </p>
                            <div style={{ background: 'white', padding: '1rem', borderRadius: '12px', display: 'inline-block' }}>
                                <QRCodeSVG
                                    value={JSON.stringify({
                                        type: 'VC_PRESENTATION',
                                        did: did,
                                        studentId: credential.studentId,
                                        hash: credential.originalHash
                                    })}
                                    size={200}
                                    level={"M"}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="status-card error">
                            <p>No Verifiable Credentials currently stored in your wallet. Sync after issuance.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
