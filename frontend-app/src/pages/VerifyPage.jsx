import React, { useState } from 'react';
import axios from 'axios';
import { Search, ShieldAlert, ShieldCheck, Link as LinkIcon, ExternalLink } from 'lucide-react';

export default function VerifyPage() {
    const [studentId, setStudentId] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!studentId.trim()) return;

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const res = await axios.get(`http://localhost:3000/api/transcript/${studentId}`);
            setResult({
                record: res.data.record,
                evmVerification: res.data.evmVerification
            });
        } catch (err) {
            setError(err.response?.data?.error || err.message || "Failed to find credential");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-panel" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '0.5rem' }}>Verify Credential</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                Query the Hyperledger Fabric ledger to verify a student's academic standing and decentralized identifiers.
            </p>

            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <input
                    type="text"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="form-input"
                    placeholder="Enter Student ID (e.g. STUDENT_005)"
                    required
                    style={{ flexGrow: 1 }}
                />
                <button type="submit" className="action-button" style={{ width: 'auto', padding: '0 2rem' }} disabled={loading}>
                    {loading ? <div className="spinner"></div> : <><Search size={18} /> Verify</>}
                </button>
            </form>

            {error && (
                <div className="status-card error">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                        <ShieldAlert size={20} /> Credential Not Found
                    </div>
                    <div style={{ marginTop: '0.25rem', fontSize: '0.875rem' }}>{error}</div>
                </div>
            )}

            {result && (
                <div className="status-card" style={{ background: 'rgba(255, 255, 255, 0.02)', borderColor: 'var(--glass-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-success)', fontWeight: 600, marginBottom: '1.5rem' }}>
                        <ShieldCheck size={24} /> Verified on Ledger

                        {result.evmVerification?.valid && (
                            <span style={{ marginLeft: 'auto', background: 'rgba(58, 141, 255, 0.1)', color: 'var(--accent-primary)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                🔒 Anchored on Polygon zkEVM
                            </span>
                        )}
                    </div>

                    <div className="data-grid">
                        <div className="data-item">
                            <div className="data-label">Student ID</div>
                            <div className="data-value" style={{ color: 'var(--text-primary)' }}>{result.record.studentId}</div>
                        </div>
                        <div className="data-item">
                            <div className="data-label">Degree Program</div>
                            <div className="data-value" style={{ color: 'var(--text-primary)' }}>{result.record.degreeName}</div>
                        </div>
                        <div className="data-item">
                            <div className="data-label">Graduation Year</div>
                            <div className="data-value" style={{ color: 'var(--text-primary)' }}>{result.record.graduationYear}</div>
                        </div>
                        <div className="data-item">
                            <div className="data-label">GPA</div>
                            <div className="data-value" style={{ color: 'var(--text-primary)' }}>{result.record.gpa}</div>
                        </div>
                        <div className="data-item" style={{ gridColumn: '1 / -1' }}>
                            <div className="data-label">Decentralized Identity (DID)</div>
                            <div className="data-value" style={{ color: 'var(--accent-primary)', fontFamily: 'monospace', fontSize: '1rem' }}>{result.record.did}</div>
                        </div>
                        <div className="data-item" style={{ gridColumn: '1 / -1' }}>
                            <div className="data-label">Document Hash (Anchor)</div>
                            <div className="data-value" style={{ color: 'var(--text-secondary)', fontFamily: 'monospace', fontSize: '0.875rem' }}>{result.record.originalHash}</div>
                        </div>
                        <div className="data-item" style={{ gridColumn: '1 / -1', background: 'rgba(58, 141, 255, 0.05)', borderColor: 'rgba(58, 141, 255, 0.2)' }}>
                            <div className="data-label" style={{ color: 'var(--accent-primary)' }}>IPFS Content Identifier</div>
                            <a href={`https://gateway.pinata.cloud/ipfs/${result.record.ipfsCid}`} target="_blank" rel="noopener noreferrer" className="cid-link data-value" style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                                <LinkIcon size={14} /> {result.record.ipfsCid} <ExternalLink size={12} style={{ marginLeft: '4px' }} />
                            </a>
                        </div>
                        {result.evmVerification?.valid && (
                            <div className="data-item" style={{ gridColumn: '1 / -1', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
                                <div className="data-label" style={{ color: 'var(--accent-primary)' }}>EVM Issuer DID</div>
                                <div className="data-value" style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>{result.evmVerification.issuerDid}</div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
